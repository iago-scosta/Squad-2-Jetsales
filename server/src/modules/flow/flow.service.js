// server/src/modules/flow/flow.service.js
//
// CRUD DB-backed do módulo flow (knex). Contrato consumido em
// client/src/lib/api/flows.ts. Toda função recebe organizationId
// explícito — o controller faz a ponte com req.auth.

const db = require('../../database');
const { httpError } = require('../../middlewares/error.middleware');
const { mapFlow, mapNode, mapEdge } = require('./flow.mapper');
const {
  assertFlowOwned,
  assertNodeOwned,
  assertEdgeOwned,
} = require('./flow.guards');

/* ============================================================ */
/*  /flows                                                       */
/* ============================================================ */

/**
 * GET /flows/:id -> FlowWithGraph
 * Carrega o flow + nodes + edges (todos da mesma org).
 */
async function getFlowWithGraph(organizationId, id) {
  const flowRow = await assertFlowOwned(db, id, organizationId);

  const [nodeRows, edgeRows] = await Promise.all([
    db('flow_nodes').where({ flow_id: id }).orderBy('created_at', 'asc'),
    db('flow_edges').where({ flow_id: id }).orderBy('created_at', 'asc'),
  ]);

  return {
    ...mapFlow(flowRow),
    nodes: nodeRows.map(mapNode),
    edges: edgeRows.map(mapEdge),
  };
}

/**
 * PATCH /flows/:id -> Flow
 * Atualiza name e/ou status. Bloqueia draft -> published por aqui (use /publish).
 */
async function updateFlow(organizationId, id, patch) {
  const data = {};
  if (patch.name !== undefined) data.name = patch.name;

  if (patch.status !== undefined) {
    const current = await assertFlowOwned(db, id, organizationId);
    if (current.status !== 'published' && patch.status === 'published') {
      throw httpError(
        409,
        'Use /flows/:id/publish para promover draft a published',
        'FLOW_PUBLISHED'
      );
    }
    data.status = patch.status;
  } else {
    await assertFlowOwned(db, id, organizationId);
  }

  data.updated_at = db.fn.now();

  const [row] = await db('flows')
    .where({ id })
    .update(data)
    .returning('*');

  if (!row) throw httpError(404, 'Flow not found', 'NOT_FOUND');
  return mapFlow(row);
}

/**
 * POST /flows/:id/publish -> Flow
 * Idempotente: se já published, devolve o estado atual sem bumpar versão.
 * Caso contrário, valida o grafo (ver checkGraphIntegrity) e promove
 * status='published', version+=1.
 */
async function publishFlow(organizationId, id) {
  return db.transaction(async (trx) => {
    const flow = await assertFlowOwned(trx, id, organizationId);

    if (flow.status === 'published') {
      return mapFlow(flow);
    }

    const [nodeRows, edgeRows] = await Promise.all([
      trx('flow_nodes').where({ flow_id: id }),
      trx('flow_edges').where({ flow_id: id }),
    ]);

    const issues = checkGraphIntegrity(nodeRows, edgeRows);
    if (Object.keys(issues).length > 0) {
      throw httpError(422, 'Grafo inválido para publicação', 'FLOW_INVALID_GRAPH', issues);
    }

    await trx('flows').where({ id }).update({
      status: 'published',
      version: trx.raw('version + 1'),
      updated_at: trx.fn.now(),
    });

    const fresh = await trx('flows').where({ id }).first();
    return mapFlow(fresh);
  });
}

/**
 * POST /flows/:id/bulk-update -> { ok: true }
 * Diff por id em nodes; edges são truncadas e reinseridas (mais simples e
 * seguro com FK CASCADE). Salvar volta o flow para 'draft'.
 */
async function bulkUpdateFlow(organizationId, id, payload) {
  const { nodes, edges } = payload;

  // Coerência: todo flowId interno deve bater com :id
  for (const n of nodes) {
    if (n.flowId !== id) {
      throw httpError(422, 'Node flowId divergente do path', 'EDGE_CROSS_FLOW');
    }
  }
  for (const e of edges) {
    if (e.flowId !== id) {
      throw httpError(422, 'Edge flowId divergente do path', 'EDGE_CROSS_FLOW');
    }
  }

  // IDs duplicados
  const dupNode = findDuplicate(nodes.map((n) => n.id));
  if (dupNode) {
    throw httpError(400, `node.id duplicado: ${dupNode}`, 'VALIDATION_ERROR', { 'nodes.id': 'duplicado' });
  }
  const dupEdge = findDuplicate(edges.map((e) => e.id));
  if (dupEdge) {
    throw httpError(400, `edge.id duplicado: ${dupEdge}`, 'VALIDATION_ERROR', { 'edges.id': 'duplicado' });
  }

  // Edges referenciando nodes que não estão no payload
  const incomingNodeIds = new Set(nodes.map((n) => n.id));
  for (const e of edges) {
    if (!incomingNodeIds.has(e.sourceNodeId) || !incomingNodeIds.has(e.targetNodeId)) {
      throw httpError(
        422,
        'Edge referencia node fora do conjunto enviado',
        'EDGE_CROSS_FLOW'
      );
    }
  }

  await db.transaction(async (trx) => {
    await assertFlowOwned(trx, id, organizationId);

    const existing = await trx('flow_nodes').where({ flow_id: id }).select('id');
    const existingIds = new Set(existing.map((r) => r.id));
    const toDeleteNodes = [...existingIds].filter((nid) => !incomingNodeIds.has(nid));

    // Edges precisam sair antes dos nodes (FK). Reinserimos todas em seguida.
    await trx('flow_edges').where({ flow_id: id }).del();

    if (toDeleteNodes.length) {
      await trx('flow_nodes').whereIn('id', toDeleteNodes).del();
    }

    if (nodes.length) {
      const rows = nodes.map((n) => ({
        id: n.id,
        flow_id: id,
        type: n.type,
        data: n.data,
        position_x: n.positionX,
        position_y: n.positionY,
        updated_at: trx.fn.now(),
      }));
      await trx('flow_nodes')
        .insert(rows)
        .onConflict('id')
        .merge(['type', 'data', 'position_x', 'position_y', 'updated_at']);
    }

    if (edges.length) {
      const rows = edges.map((e) => ({
        id: e.id,
        flow_id: id,
        source_node_id: e.sourceNodeId,
        target_node_id: e.targetNodeId,
        source_handle: e.sourceHandle ?? null,
        condition_type: e.conditionType ?? null,
        condition_value: e.conditionValue ?? null,
      }));
      await trx('flow_edges').insert(rows);
    }

    // Salvar implica edição -> volta para draft. Publicar é ato deliberado.
    await trx('flows').where({ id }).update({
      status: 'draft',
      updated_at: trx.fn.now(),
    });
  });

  return { ok: true };
}

/* ============================================================ */
/*  /flow-nodes                                                  */
/* ============================================================ */

async function createNode(organizationId, input) {
  await assertFlowOwned(db, input.flowId, organizationId);
  const [row] = await db('flow_nodes')
    .insert({
      flow_id: input.flowId,
      type: input.type,
      data: input.data,
      position_x: input.positionX,
      position_y: input.positionY,
    })
    .returning('*');
  return mapNode(row);
}

async function updateNode(organizationId, id, patch) {
  await assertNodeOwned(db, id, organizationId);

  const data = {};
  if (patch.type !== undefined) data.type = patch.type;
  if (patch.data !== undefined) data.data = patch.data;
  if (patch.positionX !== undefined) data.position_x = patch.positionX;
  if (patch.positionY !== undefined) data.position_y = patch.positionY;

  if (Object.keys(data).length === 0) {
    const fresh = await db('flow_nodes').where({ id }).first();
    if (!fresh) throw httpError(404, 'Node not found', 'NOT_FOUND');
    return mapNode(fresh);
  }

  data.updated_at = db.fn.now();

  const [row] = await db('flow_nodes')
    .where({ id })
    .update(data)
    .returning('*');
  if (!row) throw httpError(404, 'Node not found', 'NOT_FOUND');
  return mapNode(row);
}

async function deleteNode(organizationId, id) {
  await assertNodeOwned(db, id, organizationId);
  // Edges referenciando o node saem via FK CASCADE.
  await db('flow_nodes').where({ id }).del();
}

/* ============================================================ */
/*  /flow-edges                                                  */
/* ============================================================ */

async function createEdge(organizationId, input) {
  await assertFlowOwned(db, input.flowId, organizationId);

  const countRow = await db('flow_nodes')
    .whereIn('id', [input.sourceNodeId, input.targetNodeId])
    .andWhere({ flow_id: input.flowId })
    .count('* as c')
    .first();
  if (Number(countRow.c) !== 2) {
    throw httpError(422, 'Edge nodes must belong to flow', 'EDGE_CROSS_FLOW');
  }

  const [row] = await db('flow_edges')
    .insert({
      flow_id: input.flowId,
      source_node_id: input.sourceNodeId,
      target_node_id: input.targetNodeId,
      source_handle: input.sourceHandle ?? null,
      condition_type: input.conditionType ?? null,
      condition_value: input.conditionValue ?? null,
    })
    .returning('*');
  return mapEdge(row);
}

async function deleteEdge(organizationId, id) {
  await assertEdgeOwned(db, id, organizationId);
  await db('flow_edges').where({ id }).del();
}

/* ============================================================ */
/*  Helpers                                                      */
/* ============================================================ */

function findDuplicate(arr) {
  const seen = new Set();
  for (const v of arr) {
    if (seen.has(v)) return v;
    seen.add(v);
  }
  return null;
}

/**
 * Validação mínima de integridade para o publish:
 *   - existe pelo menos 1 trigger
 *   - todo node não-trigger tem ao menos 1 edge de entrada
 *   - não há ciclos
 */
function checkGraphIntegrity(nodeRows, edgeRows) {
  const issues = {};

  if (nodeRows.length === 0) {
    issues['nodes'] = 'flow não tem nodes';
    return issues;
  }

  const triggers = nodeRows.filter((n) => n.type === 'trigger');
  if (triggers.length === 0) {
    issues['trigger'] = 'flow precisa de pelo menos um node do tipo trigger';
  }

  const incoming = new Map();
  for (const n of nodeRows) incoming.set(n.id, 0);
  for (const e of edgeRows) {
    if (incoming.has(e.target_node_id)) {
      incoming.set(e.target_node_id, incoming.get(e.target_node_id) + 1);
    }
  }

  const orphans = [];
  for (const n of nodeRows) {
    if (n.type === 'trigger') continue;
    if ((incoming.get(n.id) ?? 0) === 0) orphans.push(n.id);
  }
  if (orphans.length > 0) {
    issues['orphans'] = `nodes sem entrada: ${orphans.join(', ')}`;
  }

  if (hasCycle(nodeRows, edgeRows)) {
    issues['cycle'] = 'grafo contém ciclo';
  }

  return issues;
}

function hasCycle(nodeRows, edgeRows) {
  const adj = new Map();
  for (const n of nodeRows) adj.set(n.id, []);
  for (const e of edgeRows) {
    if (adj.has(e.source_node_id)) adj.get(e.source_node_id).push(e.target_node_id);
  }

  const WHITE = 0;
  const GRAY = 1;
  const BLACK = 2;
  const color = new Map();
  for (const n of nodeRows) color.set(n.id, WHITE);

  function dfs(u) {
    color.set(u, GRAY);
    for (const v of adj.get(u) ?? []) {
      const c = color.get(v);
      if (c === GRAY) return true;
      if (c === WHITE && dfs(v)) return true;
    }
    color.set(u, BLACK);
    return false;
  }

  for (const n of nodeRows) {
    if (color.get(n.id) === WHITE && dfs(n.id)) return true;
  }
  return false;
}

module.exports = {
  getFlowWithGraph,
  updateFlow,
  publishFlow,
  bulkUpdateFlow,
  createNode,
  updateNode,
  deleteNode,
  createEdge,
  deleteEdge,
  // exportados para testes
  _checkGraphIntegrity: checkGraphIntegrity,
};

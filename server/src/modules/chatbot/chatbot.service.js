// server/src/modules/chatbot/chatbot.service.js
//
// CRUD + duplicate + activate/deactivate sobre a tabela `chatbots` via knex.
// Toda função recebe organizationId explícito — o controller faz a ponte com
// req.auth. Saída sempre passa por toApi() para casar com o contrato camelCase
// do front (client/src/lib/api/chatbots.ts).

const crypto = require('crypto');
const db = require('../../database');

const TABLE = 'chatbots';

const UPDATABLE_FIELDS = ['name', 'description', 'type', 'ai_config', 'active_flow_id'];
const VALID_TYPES = ['manual', 'ai_generated', 'ai_agent'];

function toApi(row) {
  if (!row) return null;
  return {
    id: row.id,
    organizationId: row.organization_id,
    activeFlowId: row.active_flow_id,
    name: row.name,
    description: row.description,
    type: row.type,
    isActive: row.is_active,
    aiConfig: row.ai_config ?? undefined,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : row.updated_at,
  };
}

async function list(organizationId, { status, type } = {}) {
  const q = db(TABLE).where({ organization_id: organizationId });
  if (status === 'active') q.andWhere({ is_active: true });
  if (status === 'inactive') q.andWhere({ is_active: false });
  if (type) q.andWhere({ type });
  const rows = await q.orderBy('created_at', 'desc');
  return rows.map(toApi);
}

async function findById(organizationId, id) {
  const row = await db(TABLE).where({ id, organization_id: organizationId }).first();
  return toApi(row);
}

async function create(organizationId, userId, input) {
  const [row] = await db(TABLE)
    .insert({
      organization_id: organizationId,
      created_by: userId,
      name: input.name,
      description: input.description ?? '',
      type: input.type,
      is_active: true,
    })
    .returning('*');
  return toApi(row);
}

async function update(organizationId, id, patch) {
  const data = {};
  for (const key of UPDATABLE_FIELDS) {
    if (patch[key] !== undefined) data[key] = patch[key];
  }
  if (Object.keys(data).length === 0) return findById(organizationId, id);
  data.updated_at = db.fn.now();
  const [row] = await db(TABLE)
    .where({ id, organization_id: organizationId })
    .update(data)
    .returning('*');
  return toApi(row);
}

async function remove(organizationId, id) {
  const count = await db(TABLE).where({ id, organization_id: organizationId }).delete();
  return count > 0;
}

/**
 * Clone profundo: chatbot + flow ativo + nodes + edges, tudo numa transação.
 * - Clone começa is_active=false e o flow clonado nasce em status='draft'.
 * - Edges são remapeadas via idMap para apontar para os novos node ids.
 * - Original sem active_flow_id => clone também sem (sem erro).
 * - created_by recebe userId (quem duplicou), não o criador original.
 */
async function duplicate(organizationId, userId, id) {
  return db.transaction(async (trx) => {
    const original = await trx(TABLE)
      .where({ id, organization_id: organizationId })
      .first();
    if (!original) return null;

    const [cloneChatbot] = await trx(TABLE)
      .insert({
        organization_id: organizationId,
        created_by: userId,
        name: `${original.name} (cópia)`,
        description: original.description,
        type: original.type,
        ai_config: original.ai_config,
        is_active: false,
        active_flow_id: null,
      })
      .returning('*');

    if (!original.active_flow_id) {
      return toApi(cloneChatbot);
    }

    const sourceFlow = await trx('flows')
      .where({ id: original.active_flow_id })
      .first();
    if (!sourceFlow) {
      return toApi(cloneChatbot);
    }

    const [cloneFlow] = await trx('flows')
      .insert({
        chatbot_id: cloneChatbot.id,
        name: sourceFlow.name,
        status: 'draft',
        version: 1,
      })
      .returning('*');

    const sourceNodes = await trx('flow_nodes').where({ flow_id: sourceFlow.id });
    const idMap = new Map();
    if (sourceNodes.length) {
      const newNodeRows = sourceNodes.map((n) => {
        const newId = crypto.randomUUID();
        idMap.set(n.id, newId);
        return {
          id: newId,
          flow_id: cloneFlow.id,
          type: n.type,
          data: n.data,
          position_x: n.position_x,
          position_y: n.position_y,
        };
      });
      await trx('flow_nodes').insert(newNodeRows);
    }

    const sourceEdges = await trx('flow_edges').where({ flow_id: sourceFlow.id });
    if (sourceEdges.length) {
      const newEdgeRows = sourceEdges.map((e) => ({
        flow_id: cloneFlow.id,
        source_node_id: idMap.get(e.source_node_id),
        target_node_id: idMap.get(e.target_node_id),
        source_handle: e.source_handle,
        condition_type: e.condition_type,
        condition_value: e.condition_value,
      }));
      await trx('flow_edges').insert(newEdgeRows);
    }

    const [updatedClone] = await trx(TABLE)
      .where({ id: cloneChatbot.id })
      .update({ active_flow_id: cloneFlow.id, updated_at: trx.fn.now() })
      .returning('*');

    return toApi(updatedClone);
  });
}

async function setActive(organizationId, id, isActive) {
  const [row] = await db(TABLE)
    .where({ id, organization_id: organizationId })
    .update({ is_active: isActive, updated_at: db.fn.now() })
    .returning('*');
  return toApi(row);
}

module.exports = {
  TABLE,
  VALID_TYPES,
  UPDATABLE_FIELDS,
  toApi,
  list,
  findById,
  create,
  update,
  remove,
  duplicate,
  activate: (orgId, id) => setActive(orgId, id, true),
  deactivate: (orgId, id) => setActive(orgId, id, false),
};

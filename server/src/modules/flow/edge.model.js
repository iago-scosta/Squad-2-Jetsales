const db = require('../../database');

const TABLE = 'flow_edges';

const normalizePayload = (data, flowId) => ({
  flow_id: flowId || data.flow_id || data.flowId,
  source_node_id: data.source_node_id || data.sourceNodeId || data.from,
  target_node_id: data.target_node_id || data.targetNodeId || data.to,
  source_handle: data.source_handle || data.sourceHandle || null,
  condition_type: data.condition?.operator || data.condition_type || null,
  condition_value: data.condition?.value != null
    ? String(data.condition.value)
    : data.condition_value || null,
});

// Mapeia de volta para o formato { from, to, condition } do FlowEngine
const toEngineFormat = (edge) => ({
  ...edge,
  from: edge.source_node_id,
  to: edge.target_node_id,
  condition: edge.condition_type
    ? { operator: edge.condition_type, value: edge.condition_value }
    : null,
});

module.exports = {
  create: async (data, flowId) => {
    const [edge] = await db(TABLE).insert(normalizePayload(data, flowId)).returning('*');
    return toEngineFormat(edge);
  },

  createMany: async (edges, flowId, trx) => {
    if (!edges || edges.length === 0) return [];
    const payloads = edges.map((e) => normalizePayload(e, flowId));
    const created = await (trx || db)(TABLE).insert(payloads).returning('*');
    return created.map(toEngineFormat);
  },

  findByFlow: async (flowId) => {
    const edges = await db(TABLE).where({ flow_id: flowId });
    return edges.map(toEngineFormat);
  },

  findOne: async (id) => {
    const edge = await db(TABLE).where({ id }).first();
    return edge ? toEngineFormat(edge) : null;
  },

  update: async (id, data) => {
    const [edge] = await db(TABLE)
      .where({ id })
      .update(normalizePayload(data))
      .returning('*');
    return toEngineFormat(edge);
  },

  remove: async (id) => {
    return await db(TABLE).where({ id }).del();
  },

  removeByFlow: async (flowId, trx) => {
    return await (trx || db)(TABLE).where({ flow_id: flowId }).del();
  },
};

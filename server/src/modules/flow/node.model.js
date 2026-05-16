const db = require('../../database');

const TABLE = 'flow_nodes';

// Todos os campos lógicos do node vão dentro do JSONB `data`
// incluindo o `label` (id semântico), pois o banco não tem coluna label
const normalizePayload = (data) => ({
  flow_id: data.flow_id || data.flowId,
  type: data.type,
  data: {
    label: data.label || data.id || null, // id semântico ("start", "ask_name"…)
    message: data.message || null,
    variable: data.variable || null,
    options: data.options || null,
    url: data.url || null,
    saveAs: data.saveAs || data.save_as || null,
    key: data.key || null,
    value: data.value || null,
    condition: data.condition || null,
    delay: data.delay || 0,
  },
  position_x: data.position_x ?? data.positionX ?? 0,
  position_y: data.position_y ?? data.positionY ?? 0,
});

// Expande `data` JSONB para primeiro nível para o FlowEngine continuar funcionando
const expand = (node) => {
  if (!node) return null;
  const { data, ...rest } = node;
  return { ...rest, ...(data || {}) };
};

module.exports = {
  create: async (nodeData) => {
    const [node] = await db(TABLE).insert(normalizePayload(nodeData)).returning('*');
    return expand(node);
  },

  createMany: async (nodes, trx) => {
    if (!nodes || nodes.length === 0) return [];
    const payloads = nodes.map(normalizePayload);
    const q = (trx || db)(TABLE).insert(payloads).returning('*');
    const created = await q;
    return created.map(expand);
  },

  findByFlow: async (flowId) => {
    const nodes = await db(TABLE).where({ flow_id: flowId }).orderBy('created_at', 'asc');
    return nodes.map(expand);
  },

  findOne: async (id) => {
    const node = await db(TABLE).where({ id }).first();
    return expand(node);
  },

  update: async (id, nodeData) => {
    const [node] = await db(TABLE)
      .where({ id })
      .update({ ...normalizePayload(nodeData), updated_at: db.fn.now() })
      .returning('*');
    return expand(node);
  },

  remove: async (id) => {
    return await db(TABLE).where({ id }).del();
  },

  removeByFlow: async (flowId, trx) => {
    return await (trx || db)(TABLE).where({ flow_id: flowId }).del();
  },
};

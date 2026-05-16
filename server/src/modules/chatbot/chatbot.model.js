const db = require('../../database');

const TABLE = 'chatbots';

const normalizePayload = (data) => ({
  organization_id: data.organization_id || data.organizationId,
  active_flow_id: data.active_flow_id || data.activeFlowId,
  name: data.name,
  type: data.type,
  is_active: data.is_active ?? data.isActive ?? true,
  inactivity_timeout_ms: data.inactivity_timeout_ms ?? data.inactivityTimeoutMs,
  max_retries: data.max_retries ?? data.maxRetries,
  send_delay_ms: data.send_delay_ms ?? data.sendDelayMs,
  ai_config: data.ai_config ?? data.aiConfig,
});

module.exports = {
  create: async (data) => {
    const payload = normalizePayload(data);
    const [chatbot] = await db(TABLE).insert(payload).returning('*');
    return chatbot;
  },

  findAll: async () => {
    return await db(TABLE).select('*').orderBy('created_at', 'desc');
  },

  findOne: async (id) => {
    return await db(TABLE).where({ id }).first();
  },

  update: async (id, data) => {
    const payload = normalizePayload(data);
    const [chatbot] = await db(TABLE)
      .where({ id })
      .update(payload)
      .returning('*');
    return chatbot;
  },

  remove: async (id) => {
    return await db(TABLE).where({ id }).del();
  },
};
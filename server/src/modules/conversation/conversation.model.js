const db = require('../../database');

const TABLE = 'conversations';

const normalizePayload = (data) => ({
  organization_id: data.organization_id || data.organizationId,
  contact_id: data.contact_id || data.contactId,
  chatbot_id: data.chatbot_id || data.chatbotId,
  whatsapp_connection_id: data.whatsapp_connection_id || data.whatsappConnectionId,
  status: data.status,
  close_reason: data.close_reason || data.closeReason,
  started_at: data.started_at || data.startedAt,
  closed_at: data.closed_at || data.closedAt,
  last_activity_at: data.last_activity_at || data.lastActivityAt,
});

module.exports = {
  create: async (data) => {
    const payload = normalizePayload(data);
    const [conversation] = await db(TABLE).insert(payload).returning('*');
    return conversation;
  },

  findAll: async (filters = {}) => {
    const query = db(TABLE).select('*').orderBy('created_at', 'desc');

    if (filters.organization_id || filters.organizationId) {
      query.where('organization_id', filters.organization_id || filters.organizationId);
    }
    if (filters.contact_id || filters.contactId) {
      query.where('contact_id', filters.contact_id || filters.contactId);
    }
    if (filters.chatbot_id || filters.chatbotId) {
      query.where('chatbot_id', filters.chatbot_id || filters.chatbotId);
    }

    return await query;
  },

  findOne: async (id) => {
    return await db(TABLE).where({ id }).first();
  },

  update: async (id, data) => {
    const payload = normalizePayload(data);
    const [conversation] = await db(TABLE)
      .where({ id })
      .update(payload)
      .returning('*');
    return conversation;
  },

  remove: async (id) => {
    return await db(TABLE).where({ id }).del();
  },
};

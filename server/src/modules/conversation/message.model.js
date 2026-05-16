const db = require('../../database');

const TABLE = 'messages';

// Normaliza o payload recebido pela API para o formato das colunas do Postgres
const normalizePayload = (data) => ({
  conversation_id: data.conversation_id || data.conversationId,
  flow_node_id: data.flow_node_id || data.flowNodeId,
  direction: data.direction,
  content_type: data.content_type || data.contentType,
  body: data.body,
  media_url: data.media_url || data.mediaUrl,
  metadata: data.metadata,
  delivery_status: data.delivery_status || data.deliveryStatus,
  retry_attempts: data.retry_attempts ?? data.retryAttempts,
  external_id: data.external_id || data.externalId,
  sent_at: data.sent_at || data.sentAt,
  delivered_at: data.delivered_at || data.deliveredAt,
  read_at: data.read_at || data.readAt,
});

module.exports = {
  // Insere uma nova mensagem na tabela messages e retorna o registro criado
  create: async (data) => {
    const payload = normalizePayload(data);
    const [message] = await db(TABLE).insert(payload).returning('*');
    return message;
  },

  // Lista mensagens, opcionalmente filtrando por conversation_id
  findAll: async (filters = {}) => {
    const query = db(TABLE).select('*').orderBy('created_at', 'desc');

    if (filters.conversation_id || filters.conversationId) {
      const conversationId = filters.conversation_id || filters.conversationId;
      query.where({ conversation_id: conversationId });
    }

    return await query;
  },

  // Busca uma mensagem pelo id
  findOne: async (id) => {
    return await db(TABLE).where({ id }).first();
  },

  // Atualiza um registro de mensagem e retorna o registro atualizado
  update: async (id, data) => {
    const payload = normalizePayload(data);
    const [message] = await db(TABLE)
      .where({ id })
      .update(payload)
      .returning('*');
    return message;
  },

  // Remove uma mensagem pelo id
  remove: async (id) => {
    return await db(TABLE).where({ id }).del();
  },
};

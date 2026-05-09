// server/src/modules/chatbot/chatbot.model.js
//
// ⚠️ Model anterior usava Mongoose. Schema agora vive na migration
// 20260504_001_initial_schema.js (tabela `chatbots`).
// Helpers de leitura/escrita virão com o refator do service na Fase 1.

const db = require('../../database');

const TABLE = 'chatbots';

module.exports = {
  TABLE,
  query: () => db(TABLE),
};

const { randomUUID } = require("crypto");
const db = require("../../database/db");

async function findOrCreateContact(data, executor = db) {
  const query = `
    INSERT INTO contacts (
      id,
      organization_id,
      phone,
      name,
      custom_fields
    )
    VALUES ($1, $2, $3, $4, $5::jsonb)
    ON CONFLICT (phone)
    DO UPDATE SET
      organization_id = COALESCE(contacts.organization_id, EXCLUDED.organization_id),
      updated_at = NOW()
    RETURNING *
  `;
  const values = [
    randomUUID(),
    data.organization_id || null,
    data.phone,
    data.name || null,
    JSON.stringify(data.custom_fields || {}),
  ];
  const result = await executor.query(query, values);

  return result.rows[0];
}

async function createConversation(data, executor = db) {
  const query = `
    INSERT INTO conversations (
      id,
      organization_id,
      contact_id,
      chatbot_id,
      status
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  const values = [
    randomUUID(),
    data.organization_id || null,
    data.contact_id,
    data.chatbot_id,
    data.status || "open",
  ];
  const result = await executor.query(query, values);

  return result.rows[0];
}

async function createMessage(data, executor = db) {
  const query = `
    INSERT INTO messages (
      id,
      conversation_id,
      flow_node_id,
      direction,
      content,
      metadata
    )
    VALUES ($1, $2, $3, $4, $5, $6::jsonb)
    RETURNING *
  `;
  const values = [
    randomUUID(),
    data.conversation_id,
    data.flow_node_id || null,
    data.direction,
    data.content,
    JSON.stringify(data.metadata || {}),
  ];
  const result = await executor.query(query, values);

  return result.rows[0];
}

module.exports = {
  findOrCreateContact,
  createConversation,
  createMessage,
};

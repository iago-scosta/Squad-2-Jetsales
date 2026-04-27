const { randomUUID } = require("crypto");
const db = require("../../database/db");

async function createFlow(data, executor = db) {
  const query = `
    INSERT INTO flows (
      id,
      chatbot_id,
      name,
      status,
      version
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  const values = [
    randomUUID(),
    data.chatbot_id,
    data.name,
    data.status,
    data.version,
  ];
  const result = await executor.query(query, values);

  return result.rows[0];
}

async function findAllFlows(executor = db) {
  const result = await executor.query("SELECT * FROM flows ORDER BY created_at ASC");

  return result.rows;
}

async function findFlowById(id, executor = db) {
  const result = await executor.query("SELECT * FROM flows WHERE id = $1", [id]);

  return result.rows[0] || null;
}

async function updateFlow(id, data, executor = db) {
  const query = `
    UPDATE flows
    SET
      chatbot_id = $2,
      name = $3,
      status = $4,
      version = $5,
      updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `;
  const values = [id, data.chatbot_id, data.name, data.status, data.version];
  const result = await executor.query(query, values);

  return result.rows[0] || null;
}

async function removeFlow(id, executor = db) {
  const result = await executor.query("DELETE FROM flows WHERE id = $1 RETURNING *", [
    id,
  ]);

  return result.rows[0] || null;
}

async function createNode(data, executor = db) {
  const query = `
    INSERT INTO flow_nodes (
      id,
      flow_id,
      type,
      data,
      position_x,
      position_y
    )
    VALUES ($1, $2, $3, $4::jsonb, $5, $6)
    RETURNING *
  `;
  const values = [
    randomUUID(),
    data.flow_id,
    data.type,
    JSON.stringify(data.data),
    data.position_x,
    data.position_y,
  ];
  const result = await executor.query(query, values);

  return result.rows[0];
}

async function listNodes(flowId, executor = db) {
  const result = await executor.query(
    "SELECT * FROM flow_nodes WHERE flow_id = $1 ORDER BY created_at ASC",
    [flowId]
  );

  return result.rows;
}

async function findNodeById(id, executor = db) {
  const result = await executor.query("SELECT * FROM flow_nodes WHERE id = $1", [
    id,
  ]);

  return result.rows[0] || null;
}

async function createEdge(data, executor = db) {
  const query = `
    INSERT INTO flow_edges (
      id,
      flow_id,
      source_node_id,
      target_node_id,
      condition_type,
      condition_value
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
  const values = [
    randomUUID(),
    data.flow_id,
    data.source_node_id,
    data.target_node_id,
    data.condition_type,
    data.condition_value,
  ];
  const result = await executor.query(query, values);

  return result.rows[0];
}

async function listEdges(flowId, executor = db) {
  const result = await executor.query(
    "SELECT * FROM flow_edges WHERE flow_id = $1 ORDER BY created_at ASC",
    [flowId]
  );

  return result.rows;
}

module.exports = {
  createFlow,
  findAllFlows,
  findFlowById,
  updateFlow,
  removeFlow,
  createNode,
  listNodes,
  findNodeById,
  createEdge,
  listEdges,
};

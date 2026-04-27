const { randomUUID } = require("crypto");
const db = require("../../database/db");

async function create(data, executor = db) {
  const query = `
    INSERT INTO chatbots (
      id,
      organization_id,
      name,
      type,
      is_active
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  const values = [
    randomUUID(),
    data.organization_id,
    data.name,
    data.type,
    data.is_active,
  ];
  const result = await executor.query(query, values);

  return result.rows[0];
}

async function findAll(executor = db) {
  const result = await executor.query(
    "SELECT * FROM chatbots ORDER BY created_at ASC"
  );

  return result.rows;
}

async function findById(id, executor = db) {
  const result = await executor.query("SELECT * FROM chatbots WHERE id = $1", [
    id,
  ]);

  return result.rows[0] || null;
}

async function update(id, data, executor = db) {
  const query = `
    UPDATE chatbots
    SET
      organization_id = $2,
      name = $3,
      type = $4,
      is_active = $5,
      updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `;
  const values = [id, data.organization_id, data.name, data.type, data.is_active];
  const result = await executor.query(query, values);

  return result.rows[0] || null;
}

async function remove(id, executor = db) {
  const result = await executor.query(
    "DELETE FROM chatbots WHERE id = $1 RETURNING *",
    [id]
  );

  return result.rows[0] || null;
}

module.exports = {
  create,
  findAll,
  findById,
  update,
  remove,
};

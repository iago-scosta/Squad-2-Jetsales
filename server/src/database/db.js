const { Pool } = require("pg");
const createHttpError = require("../utils/http-error");

let pool = null;

function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

function getPool() {
  if (!isDatabaseConfigured()) {
    throw createHttpError(
      500,
      "postgresql nao configurado. defina DATABASE_URL no arquivo .env"
    );
  }

  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  return pool;
}

async function query(text, params = []) {
  return getPool().query(text, params);
}

async function testConnection() {
  await query("SELECT 1");
}

async function withTransaction(callback) {
  const client = await getPool().connect();

  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  query,
  testConnection,
  withTransaction,
  isDatabaseConfigured,
  getPool,
};

// server/knexfile.js
require('dotenv').config();

const base = {
  client: 'pg',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'jetsales',
  },
  pool: { min: 0, max: 10 },
  migrations: {
    directory: './src/database/migrations',
    tableName: 'knex_migrations',
  },
  seeds: {
    directory: './src/database/seeds',
  },
};

module.exports = {
  development: base,
  test: { ...base, connection: { ...base.connection, database: `${base.connection.database}_test` } },
  production: {
    ...base,
    connection: process.env.DATABASE_URL || base.connection,
    pool: { min: 2, max: 20 },
  },
};

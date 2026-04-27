const fs = require("fs");
const path = require("path");
const db = require("./db");

const migrationsDirectory = path.join(__dirname, "migrations");

async function runMigrations() {
  const files = fs
    .readdirSync(migrationsDirectory)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  if (!files.length) {
    console.log("Nenhuma migration SQL encontrada.");
    return;
  }

  for (const file of files) {
    const filePath = path.join(migrationsDirectory, file);
    const sql = fs.readFileSync(filePath, "utf8");

    console.log(`Aplicando migration: ${file}`);
    await db.query(sql);
  }

  console.log("Migrations aplicadas com sucesso.");
}

runMigrations()
  .then(async () => {
    if (db.isDatabaseConfigured()) {
      await db.getPool().end();
    }
  })
  .catch(async (error) => {
    console.error("Erro ao rodar migrations:", error.message);

    if (db.isDatabaseConfigured()) {
      await db.getPool().end().catch(() => {});
    }

    process.exit(1);
  });

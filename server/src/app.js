const cors = require("cors");
const dotenv = require("dotenv");
const express = require("express");
const db = require("./database/db");
const errorMiddleware = require("./middlewares/error.middleware");
const notFoundMiddleware = require("./middlewares/not-found.middleware");
const routes = require("./routes");

dotenv.config({ quiet: true });

const app = express();

app.use(express.json());
app.use(cors());

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "jetsales-backend",
  });
});

app.use("/api/v1", routes);
app.use(notFoundMiddleware);
app.use(errorMiddleware);

async function startServer() {
  if (!db.isDatabaseConfigured()) {
    console.warn("PostgreSQL nao configurado. Defina DATABASE_URL no arquivo .env.");
  } else {
    try {
      await db.testConnection();
      console.log("Conexao com PostgreSQL estabelecida.");
    } catch (error) {
      console.warn(`Nao foi possivel conectar ao PostgreSQL: ${error.message}`);
    }
  }

  const PORT = process.env.PORT || 3001;

  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}

if (require.main === module) {
  startServer();
}

module.exports = app;

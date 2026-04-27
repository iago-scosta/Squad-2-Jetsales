const cors = require("cors");
const dotenv = require("dotenv");
const express = require("express");
const errorMiddleware = require("./middlewares/error.middleware");
const notFoundMiddleware = require("./middlewares/not-found.middleware");
const routes = require("./routes");

dotenv.config();

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

if (require.main === module) {
  const PORT = process.env.PORT || 3001;

  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}

module.exports = app;

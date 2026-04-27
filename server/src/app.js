const cors = require("cors");
const dotenv = require("dotenv");
const express = require("express");
const errorMiddleware = require("./middlewares/error.middleware");
const notFoundMiddleware = require("./middlewares/not-found.middleware");
const routes = require("./routes");

dotenv.config({ quiet: true });

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    data: {
      name: "JetGO API",
      description: "Backend academico em memoria para chatbots, fluxos e atendimento.",
    },
  });
});

app.get("/health", (req, res) => {
  res.json({
    data: {
      status: "ok",
      service: "jetgo-backend",
    },
  });
});

app.use("/api/v1", routes);
app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;

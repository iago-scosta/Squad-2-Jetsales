const express = require("express");
const chatbotRoutes = require("./chatbot.routes");
const flowRoutes = require("./flow.routes");
const webhookRoutes = require("./webhook.routes");

const router = express.Router();

router.use("/chatbots", chatbotRoutes);
router.use("/flows", flowRoutes);
router.use("/webhook", webhookRoutes);

module.exports = router;

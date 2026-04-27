const express = require("express");
const chatbotRoutes = require("./chatbot.routes");
const flowRoutes = require("./flow.routes");
const conversationRoutes = require("./conversation.routes");
const webhookRoutes = require("./webhook.routes");
const analyticsRoutes = require("./analytics.routes");
const aiRoutes = require("../modules/ai/ai.routes");
const { sendList } = require("../utils/http-response");

const router = express.Router();

router.get("/", (req, res) => {
  sendList(res, [
    { method: "GET", path: "/api/v1", description: "Lista basica das rotas do backend" },
    { method: "GET", path: "/api/v1/chatbots", description: "Lista chatbots" },
    { method: "POST", path: "/api/v1/chatbots", description: "Cria chatbot" },
    { method: "GET", path: "/api/v1/flows", description: "Lista fluxos" },
    { method: "POST", path: "/api/v1/flows", description: "Cria fluxo" },
    { method: "GET", path: "/api/v1/conversations", description: "Lista conversas" },
    { method: "POST", path: "/api/v1/conversations", description: "Cria conversa" },
    { method: "POST", path: "/api/v1/webhook/whatsapp", description: "Webhook fake do WhatsApp" },
    { method: "POST", path: "/api/v1/ai/respond", description: "Resposta fake de IA" },
    { method: "GET", path: "/api/v1/analytics/summary", description: "Resumo simples de analytics" },
  ]);
});

router.use("/chatbots", chatbotRoutes);
router.use("/flows", flowRoutes);
router.use("/conversations", conversationRoutes);
router.use("/webhook", webhookRoutes);
router.use("/ai", aiRoutes);
router.use("/analytics", analyticsRoutes);

module.exports = router;

const express = require("express");
const conversationController = require("../modules/conversation/conversation.controller");

const router = express.Router();

router.post("/whatsapp", conversationController.receiveWhatsappMessage);

module.exports = router;

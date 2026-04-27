const express = require("express");
const chatbotController = require("../modules/chatbot/chatbot.controller");

const router = express.Router();

router.post("/", chatbotController.create);
router.get("/", chatbotController.findAll);
router.get("/:id", chatbotController.findOne);
router.put("/:id", chatbotController.update);
router.delete("/:id", chatbotController.remove);

module.exports = router;

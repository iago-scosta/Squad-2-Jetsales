const express = require("express");
const conversationController = require("../modules/conversation/conversation.controller");

const router = express.Router();

router.get("/", conversationController.findAll);
router.post("/", conversationController.create);
router.get("/:id", conversationController.findOne);
router.patch("/:id", conversationController.patch);
router.delete("/:id", conversationController.remove);

router.get("/:id/messages", conversationController.listMessages);
router.post("/:id/messages", conversationController.createMessage);

module.exports = router;

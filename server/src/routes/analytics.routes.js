const express = require("express");
const analyticsController = require("../modules/conversation/conversation.controller");

const router = express.Router();

router.get("/summary", analyticsController.summary);

module.exports = router;

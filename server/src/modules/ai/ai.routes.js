const express = require("express");
const aiService = require("./ai.service");
const { sendData } = require("../../utils/http-response");

const router = express.Router();

router.post("/respond", async (req, res, next) => {
  try {
    const result = await aiService.respond(req.body);
    sendData(res, result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

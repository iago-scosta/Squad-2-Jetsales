const conversationService = require("./conversation.service");

async function receiveWhatsappMessage(req, res, next) {
  try {
    const result = await conversationService.receiveWhatsappMessage(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  receiveWhatsappMessage,
};

const conversationService = require("./conversation.service");

function receiveWhatsappMessage(req, res, next) {
  try {
    const result = conversationService.receiveWhatsappMessage(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  receiveWhatsappMessage,
};

const chatbotService = require("./chatbot.service");

function create(req, res, next) {
  try {
    const chatbot = chatbotService.create(req.body);
    res.status(201).json(chatbot);
  } catch (error) {
    next(error);
  }
}

function findAll(req, res, next) {
  try {
    const chatbots = chatbotService.findAll();
    res.json(chatbots);
  } catch (error) {
    next(error);
  }
}

function findOne(req, res, next) {
  try {
    const chatbot = chatbotService.findOne(req.params.id);
    res.json(chatbot);
  } catch (error) {
    next(error);
  }
}

function update(req, res, next) {
  try {
    const chatbot = chatbotService.update(req.params.id, req.body);
    res.json(chatbot);
  } catch (error) {
    next(error);
  }
}

function remove(req, res, next) {
  try {
    chatbotService.remove(req.params.id);
    res.json({ mensagem: "chatbot removido com sucesso" });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  create,
  findAll,
  findOne,
  update,
  remove,
};

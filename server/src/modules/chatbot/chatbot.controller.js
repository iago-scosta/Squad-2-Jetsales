const chatbotService = require("./chatbot.service");

async function create(req, res, next) {
  try {
    const chatbot = await chatbotService.create(req.body);
    res.status(201).json(chatbot);
  } catch (error) {
    next(error);
  }
}

async function findAll(req, res, next) {
  try {
    const chatbots = await chatbotService.findAll();
    res.json(chatbots);
  } catch (error) {
    next(error);
  }
}

async function findOne(req, res, next) {
  try {
    const chatbot = await chatbotService.findOne(req.params.id);
    res.json(chatbot);
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const chatbot = await chatbotService.update(req.params.id, req.body);
    res.json(chatbot);
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    await chatbotService.remove(req.params.id);
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

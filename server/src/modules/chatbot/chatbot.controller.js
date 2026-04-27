const chatbotService = require("./chatbot.service");
const { sendData, sendList } = require("../../utils/http-response");

async function create(req, res, next) {
  try {
    const chatbot = await chatbotService.create(req.body);
    sendData(res, chatbot, 201);
  } catch (error) {
    next(error);
  }
}

async function findAll(req, res, next) {
  try {
    const chatbots = await chatbotService.findAll();
    sendList(res, chatbots);
  } catch (error) {
    next(error);
  }
}

async function findOne(req, res, next) {
  try {
    const chatbot = await chatbotService.findOne(req.params.id);
    sendData(res, chatbot);
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const chatbot = await chatbotService.update(req.params.id, req.body, {
      partial: false,
    });
    sendData(res, chatbot);
  } catch (error) {
    next(error);
  }
}

async function patch(req, res, next) {
  try {
    const chatbot = await chatbotService.update(req.params.id, req.body, {
      partial: true,
    });
    sendData(res, chatbot);
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    const chatbot = await chatbotService.remove(req.params.id);
    sendData(res, {
      message: "chatbot removido com sucesso",
      chatbot,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  create,
  findAll,
  findOne,
  update,
  patch,
  remove,
};

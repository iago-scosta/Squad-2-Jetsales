const conversationService = require("./conversation.service");
const { sendData, sendList } = require("../../utils/http-response");

async function findAll(req, res, next) {
  try {
    const conversations = await conversationService.findAll();
    sendList(res, conversations);
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const conversation = await conversationService.create(req.body);
    sendData(res, conversation, 201);
  } catch (error) {
    next(error);
  }
}

async function findOne(req, res, next) {
  try {
    const conversation = await conversationService.findOne(req.params.id);
    sendData(res, conversation);
  } catch (error) {
    next(error);
  }
}

async function patch(req, res, next) {
  try {
    const conversation = await conversationService.update(req.params.id, req.body);
    sendData(res, conversation);
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    const conversation = await conversationService.remove(req.params.id);
    sendData(res, {
      message: "conversa removida com sucesso",
      conversation,
    });
  } catch (error) {
    next(error);
  }
}

async function listMessages(req, res, next) {
  try {
    const messages = await conversationService.listMessages(req.params.id);
    sendList(res, messages);
  } catch (error) {
    next(error);
  }
}

async function createMessage(req, res, next) {
  try {
    const message = await conversationService.createMessage(req.params.id, req.body);
    sendData(res, message, 201);
  } catch (error) {
    next(error);
  }
}

async function receiveWhatsappMessage(req, res, next) {
  try {
    const result = await conversationService.receiveWhatsappMessage(req.body);
    sendData(res, result);
  } catch (error) {
    next(error);
  }
}

async function summary(req, res, next) {
  try {
    const result = await conversationService.summary();
    sendData(res, result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  findAll,
  create,
  findOne,
  patch,
  remove,
  listMessages,
  createMessage,
  receiveWhatsappMessage,
  summary,
};

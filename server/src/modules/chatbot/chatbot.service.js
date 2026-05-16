const Chatbot = require('./chatbot.model');

// Serviço de chatbots: encapsula a lógica de CRUD e delega para o modelo SQL
exports.create = async (data) => {
  return await Chatbot.create(data);
};

exports.findAll = async () => {
  return await Chatbot.findAll();
};

exports.findOne = async (id) => {
  return await Chatbot.findOne(id);
};

exports.update = async (id, data) => {
  return await Chatbot.update(id, data);
};

exports.remove = async (id) => {
  return await Chatbot.remove(id);
};
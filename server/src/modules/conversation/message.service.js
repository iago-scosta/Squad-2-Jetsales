const Message = require('./message.model');

// Serviço de mensagens: delega operações CRUD para o modelo SQL
exports.create = async (data) => {
  return await Message.create(data);
};

exports.findAll = async (filters) => {
  return await Message.findAll(filters);
};

exports.findOne = async (id) => {
  return await Message.findOne(id);
};

exports.update = async (id, data) => {
  return await Message.update(id, data);
};

exports.remove = async (id) => {
  return await Message.remove(id);
};

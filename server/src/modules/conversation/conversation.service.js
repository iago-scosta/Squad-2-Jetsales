const Conversation = require('./conversation.model');

exports.create = async (data) => {
  return await Conversation.create(data);
};

exports.findAll = async (filters) => {
  return await Conversation.findAll(filters);
};

exports.findOne = async (id) => {
  return await Conversation.findOne(id);
};

exports.update = async (id, data) => {
  return await Conversation.update(id, data);
};

exports.remove = async (id) => {
  return await Conversation.remove(id);
};

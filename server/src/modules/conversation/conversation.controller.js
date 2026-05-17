const service = require('./conversation.service');

exports.create = async (req, res) => {
  try {
    const conversation = await service.create(req.body);
    res.status(201).json(conversation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.findAll = async (req, res) => {
  try {
    const filters = req.query;
    const conversations = await service.findAll(filters);
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.findOne = async (req, res) => {
  try {
    const conversation = await service.findOne(req.params.id);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    res.json(conversation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const conversation = await service.update(req.params.id, req.body);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    res.json(conversation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const deleted = await service.remove(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    res.json({ message: 'Conversation deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const service = require('./message.service');

// POST /api/messages
exports.create = async (req, res) => {
  try {
    const message = await service.create(req.body);
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/messages
// Aceita query string como conversation_id para filtrar mensagens de uma conversa
exports.findAll = async (req, res) => {
  try {
    const filters = req.query;
    const messages = await service.findAll(filters);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/messages/:id
exports.findOne = async (req, res) => {
  try {
    const message = await service.findOne(req.params.id);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/messages/:id
exports.update = async (req, res) => {
  try {
    const message = await service.update(req.params.id, req.body);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/messages/:id
exports.remove = async (req, res) => {
  try {
    const deleted = await service.remove(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.json({ message: 'Message deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

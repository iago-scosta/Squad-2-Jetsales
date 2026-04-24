const service = require('./chatbot.service');

//post
exports.create = async (req, res) => {
  try {
    const chatbot = await service.create(req.body);
    res.status(201).json(chatbot);

    } catch (err) {
    res.status(500).json({ error: err.message });
    }
};

//get all
exports.findAll = async (req, res) => {
  try {
    const chatbots = await service.findAll();
    res.json(chatbots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//get by id
exports.findOne = async (req, res) => {
  try {
    const chatbot = await service.findOne(req.params.id);
    if (!chatbot) {
      return res.status(404).json({ error: 'Chatbot not found' });
    }
    res.json(chatbot);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//put
exports.update = async (req, res) => {
  try {
    const chatbot = await service.update(req.params.id, req.body);
    if (!chatbot) {
      return res.status(404).json({ error: 'Chatbot not found' });
    }
    res.json(chatbot);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
    
//delete
exports.remove = async (req, res) => {
  try {
    const chatbot = await service.remove(req.params.id);
    if (!chatbot) {
      return res.status(404).json({ error: 'Chatbot not found' });
    }
    res.json({ message: 'Chatbot deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
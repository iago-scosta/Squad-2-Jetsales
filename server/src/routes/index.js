const router = require('express').Router();
const chatbotRoutes = require('../modules/chatbot/chatbot.routes');

router.use('/chatbots', chatbotRoutes);

module.exports = router;
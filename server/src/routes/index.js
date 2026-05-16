const router = require('express').Router();
const chatbotRoutes = require('../modules/chatbot/chatbot.routes');
const messageRoutes = require('../modules/conversation/message.routes');

router.use('/chatbots', chatbotRoutes);
router.use('/messages', messageRoutes);

module.exports = router;
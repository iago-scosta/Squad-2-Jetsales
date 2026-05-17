const router = require('express').Router();
const chatbotRoutes = require('../modules/chatbot/chatbot.routes');
const messageRoutes = require('../modules/conversation/message.routes');
const conversationRoutes = require('../modules/conversation/conversation.routes');

router.use('/chatbots', chatbotRoutes);
router.use('/messages', messageRoutes);
router.use('/conversations', conversationRoutes);

module.exports = router;
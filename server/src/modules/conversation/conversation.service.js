const db = require("../../database/db");
const createHttpError = require("../../utils/http-error");
const {
  validateRequiredText,
  validateRequiredUuid,
} = require("../../utils/validation");
const chatbotRepository = require("../chatbot/chatbot.repository");
const conversationRepository = require("./conversation.repository");
const flowEngine = require("../flow/flow.engine");

async function ensureChatbotExists(chatbotId) {
  const chatbot = await chatbotRepository.findById(chatbotId);

  if (!chatbot) {
    throw createHttpError(404, "chatbot nao encontrado");
  }

  return chatbot;
}

async function receiveWhatsappMessage(data) {
  const phone = validateRequiredText(data.phone, "phone");
  const message = validateRequiredText(data.message, "message");
  const chatbotId = validateRequiredUuid(data.chatbot_id, "chatbot_id");
  const chatbot = await ensureChatbotExists(chatbotId);

  return db.withTransaction(async (client) => {
    const contact = await conversationRepository.findOrCreateContact(
      {
        organization_id: chatbot.organization_id,
        phone,
      },
      client
    );

    const conversation = await conversationRepository.createConversation(
      {
        organization_id: chatbot.organization_id,
        contact_id: contact.id,
        chatbot_id: chatbot.id,
        status: "open",
      },
      client
    );

    await conversationRepository.createMessage(
      {
        conversation_id: conversation.id,
        direction: "incoming",
        content: message,
        metadata: {
          sender: "contact",
          contact_id: contact.id,
        },
      },
      client
    );

    const botResponse = flowEngine.buildFakeResponse(message);

    await conversationRepository.createMessage(
      {
        conversation_id: conversation.id,
        direction: "outgoing",
        content: botResponse,
        metadata: {
          sender: "bot",
          contact_id: contact.id,
        },
      },
      client
    );

    return {
      conversation_id: conversation.id,
      contact_id: contact.id,
      received_message: message,
      bot_response: botResponse,
    };
  });
}

module.exports = {
  receiveWhatsappMessage,
};

const memoryStore = require("../../database/memory-store");
const createHttpError = require("../../utils/http-error");
const flowEngine = require("../flow/flow.engine");

function validateRequiredText(value, fieldName) {
  if (typeof value !== "string" || !value.trim()) {
    throw createHttpError(400, `${fieldName} e obrigatorio`);
  }

  return value.trim();
}

function ensureChatbotExists(chatbotId) {
  const chatbot = memoryStore.findById("chatbots", chatbotId);

  if (!chatbot) {
    throw createHttpError(404, "chatbot nao encontrado");
  }

  return chatbot;
}

function findOrCreateContactByPhone(phone) {
  const existingContact = memoryStore.findOne(
    "contacts",
    (contact) => contact.phone === phone
  );

  if (existingContact) {
    return existingContact;
  }

  return memoryStore.create("contacts", {
    phone,
  });
}

function receiveWhatsappMessage(data) {
  const phone = validateRequiredText(data.phone, "phone");
  const message = validateRequiredText(data.message, "message");
  const chatbotId = validateRequiredText(data.chatbot_id, "chatbot_id");

  ensureChatbotExists(chatbotId);

  const contact = findOrCreateContactByPhone(phone);
  const conversation = memoryStore.create("conversations", {
    chatbot_id: chatbotId,
    contact_id: contact.id,
    channel: "whatsapp",
    status: "open",
  });

  memoryStore.create("messages", {
    conversation_id: conversation.id,
    contact_id: contact.id,
    direction: "incoming",
    sender: "contact",
    content: message,
  });

  const botResponse = flowEngine.buildFakeResponse(message);

  memoryStore.create("messages", {
    conversation_id: conversation.id,
    contact_id: contact.id,
    direction: "outgoing",
    sender: "bot",
    content: botResponse,
  });

  return {
    conversation_id: conversation.id,
    contact_id: contact.id,
    received_message: message,
    bot_response: botResponse,
  };
}

module.exports = {
  receiveWhatsappMessage,
};

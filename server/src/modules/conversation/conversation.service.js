const createHttpError = require("../../utils/http-error");
const {
  validateOptionalEnum,
  validateOptionalObject,
  validateRequiredId,
  validateRequiredText,
} = require("../../utils/validation");
const store = require("../../database");
const flowService = require("../flow/flow.service");
const {
  buildFakeWhatsappReply,
  normalizePhone,
} = require("../../integrations/whatsapp");

async function ensureChatbotExists(chatbotId) {
  const chatbot = store.findById("chatbots", chatbotId);

  if (!chatbot) {
    throw createHttpError(404, "chatbot nao encontrado", "NOT_FOUND");
  }

  return chatbot;
}

function ensureConversationExists(id) {
  const conversationId = validateRequiredId(id, "id");
  const conversation = store.findById("conversations", conversationId);

  if (!conversation) {
    throw createHttpError(404, "conversa nao encontrada", "NOT_FOUND");
  }

  return conversation;
}

function normalizeOptionalName(value) {
  if (value === undefined || value === null) {
    return "";
  }

  if (typeof value !== "string") {
    throw createHttpError(400, "contact_name precisa ser texto", "VALIDATION_ERROR");
  }

  return value.trim();
}

function findOrCreateContact({ organizationId, contactName, phone }) {
  const normalizedPhone = normalizePhone(phone);
  let contact = store.findOne(
    "contacts",
    (item) =>
      item.organization_id === organizationId && item.phone === normalizedPhone
  );

  if (!contact) {
    contact = store.create("contacts", {
      organization_id: organizationId,
      name: contactName || normalizedPhone,
      phone: normalizedPhone,
    });
  } else if (contactName) {
    contact = store.update("contacts", contact.id, {
      name: contactName,
    });
  }

  return contact;
}

async function findAll() {
  return store.list("conversations");
}

async function findOne(id) {
  return ensureConversationExists(id);
}

async function create(data) {
  const chatbotId = validateRequiredId(data.chatbot_id, "chatbot_id");
  const contactPhone = validateRequiredText(data.contact_phone, "contact_phone");
  const chatbot = await ensureChatbotExists(chatbotId);
  const contactName = normalizeOptionalName(data.contact_name);
  const contact = findOrCreateContact({
    organizationId: chatbot.organization_id,
    contactName,
    phone: contactPhone,
  });

  return store.create("conversations", {
    organization_id: chatbot.organization_id,
    chatbot_id: chatbot.id,
    contact_id: contact.id,
    contact_name: contact.name,
    contact_phone: contact.phone,
    status: "open",
    closed_at: null,
  });
}

async function update(id, data) {
  const conversation = ensureConversationExists(id);
  const status = validateOptionalEnum(data.status, ["open", "closed"], "status");
  let contactName = conversation.contact_name;
  let contactPhone = conversation.contact_phone;
  let closedAt = conversation.closed_at || null;

  if (data.contact_name !== undefined) {
    contactName = normalizeOptionalName(data.contact_name);
  }

  if (data.contact_phone !== undefined) {
    contactPhone = normalizePhone(
      validateRequiredText(data.contact_phone, "contact_phone")
    );
  }

  if (status === "closed") {
    closedAt = new Date().toISOString();
  } else if (status === "open") {
    closedAt = null;
  }

  if (conversation.contact_id) {
    const contact = store.findById("contacts", conversation.contact_id);

    if (contact) {
      store.update("contacts", contact.id, {
        name: contactName || contact.name,
        phone: contactPhone,
      });
    }
  }

  return store.update("conversations", conversation.id, {
    contact_name: contactName,
    contact_phone: contactPhone,
    status: status || conversation.status,
    closed_at: closedAt,
  });
}

async function remove(id) {
  const conversation = ensureConversationExists(id);

  store.removeWhere(
    "messages",
    (message) => message.conversation_id === conversation.id
  );
  store.remove("conversations", conversation.id);

  return conversation;
}

async function listMessages(conversationId) {
  const conversation = ensureConversationExists(conversationId);

  return store.filter(
    "messages",
    (message) => message.conversation_id === conversation.id
  );
}

async function createMessage(conversationId, data) {
  const conversation = ensureConversationExists(conversationId);
  const direction =
    validateOptionalEnum(data.direction, ["in", "out"], "direction") || "out";
  const content = validateRequiredText(data.content, "content");
  const metadata = validateOptionalObject(data.metadata, "metadata", {}) || {};

  const message = store.create("messages", {
    conversation_id: conversation.id,
    direction,
    content,
    metadata,
  });

  store.update("conversations", conversation.id, {});

  return message;
}

async function findOpenConversation(chatbotId, phone) {
  return store.findOne(
    "conversations",
    (conversation) =>
      conversation.chatbot_id === chatbotId &&
      conversation.contact_phone === phone &&
      conversation.status === "open"
  );
}

async function receiveWhatsappMessage(data) {
  const phone = normalizePhone(validateRequiredText(data.phone, "phone"));
  const content = validateRequiredText(data.message, "message");
  const chatbotId = validateRequiredId(data.chatbot_id, "chatbot_id");
  const chatbot = await ensureChatbotExists(chatbotId);
  const contact = findOrCreateContact({
    organizationId: chatbot.organization_id,
    contactName: "",
    phone,
  });
  let conversation = await findOpenConversation(chatbot.id, phone);

  if (!conversation) {
    conversation = store.create("conversations", {
      organization_id: chatbot.organization_id,
      chatbot_id: chatbot.id,
      contact_id: contact.id,
      contact_name: contact.name,
      contact_phone: contact.phone,
      status: "open",
      closed_at: null,
    });
  }

  const receivedMessage = await createMessage(conversation.id, {
    direction: "in",
    content,
    metadata: {
      source: "whatsapp-webhook",
    },
  });

  const flowReply = await flowService.getFlowPreview(chatbot.id, content);
  const responseText = buildFakeWhatsappReply(content, flowReply);
  const responseMessage = await createMessage(conversation.id, {
    direction: "out",
    content: responseText,
    metadata: {
      source: "fake-whatsapp",
    },
  });

  return {
    conversation,
    received_message: receivedMessage,
    response_message: responseMessage,
  };
}

async function summary() {
  const conversations = store.list("conversations");

  return {
    total_chatbots: store.list("chatbots").length,
    total_flows: store.list("flows").length,
    total_conversations: conversations.length,
    total_messages: store.list("messages").length,
    total_open_conversations: conversations.filter(
      (conversation) => conversation.status === "open"
    ).length,
    total_closed_conversations: conversations.filter(
      (conversation) => conversation.status === "closed"
    ).length,
  };
}

module.exports = {
  findAll,
  create,
  findOne,
  update,
  remove,
  listMessages,
  createMessage,
  receiveWhatsappMessage,
  summary,
};

const memoryStore = require("../../database/memory-store");
const createHttpError = require("../../utils/http-error");

function validateRequiredText(value, fieldName) {
  if (typeof value !== "string" || !value.trim()) {
    throw createHttpError(400, `${fieldName} e obrigatorio`);
  }

  return value.trim();
}

function validateOptionalText(value, fieldName) {
  if (value === undefined) {
    return undefined;
  }

  return validateRequiredText(value, fieldName);
}

function findOne(id) {
  const chatbot = memoryStore.findById("chatbots", id);

  if (!chatbot) {
    throw createHttpError(404, "chatbot nao encontrado");
  }

  return chatbot;
}

function create(data) {
  const name = validateRequiredText(data.name, "name");
  const organizationId = validateRequiredText(
    data.organization_id,
    "organization_id"
  );
  const type = validateOptionalText(data.type, "type") || "whatsapp";

  return memoryStore.create("chatbots", {
    name,
    organization_id: organizationId,
    type,
    is_active: true,
  });
}

function findAll() {
  return memoryStore.list("chatbots");
}

function update(id, data) {
  findOne(id);

  const nextData = {};

  if (data.name !== undefined) {
    nextData.name = validateRequiredText(data.name, "name");
  }

  if (data.organization_id !== undefined) {
    nextData.organization_id = validateRequiredText(
      data.organization_id,
      "organization_id"
    );
  }

  if (data.type !== undefined) {
    nextData.type = validateRequiredText(data.type, "type");
  }

  if (data.is_active !== undefined) {
    nextData.is_active = Boolean(data.is_active);
  }

  return memoryStore.update("chatbots", id, nextData);
}

function remove(id) {
  const chatbot = findOne(id);
  const relatedFlows = memoryStore.filter("flows", (flow) => flow.chatbot_id === id);
  const relatedConversations = memoryStore.filter(
    "conversations",
    (conversation) => conversation.chatbot_id === id
  );

  relatedFlows.forEach((flow) => {
    memoryStore.removeMany("flow_nodes", (node) => node.flow_id === flow.id);
    memoryStore.removeMany("flow_edges", (edge) => edge.flow_id === flow.id);
  });

  relatedConversations.forEach((conversation) => {
    memoryStore.removeMany(
      "messages",
      (message) => message.conversation_id === conversation.id
    );
  });

  memoryStore.removeMany("flows", (flow) => flow.chatbot_id === id);
  memoryStore.removeMany(
    "conversations",
    (conversation) => conversation.chatbot_id === id
  );
  memoryStore.remove("chatbots", id);

  return chatbot;
}

module.exports = {
  create,
  findAll,
  findOne,
  update,
  remove,
};

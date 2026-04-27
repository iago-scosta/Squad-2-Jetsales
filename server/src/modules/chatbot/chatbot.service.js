const createHttpError = require("../../utils/http-error");
const {
  validateOptionalBoolean,
  validateOptionalEnum,
  validateOptionalObject,
  validateOptionalText,
  validateRequiredId,
  validateRequiredText,
} = require("../../utils/validation");
const store = require("../../database");

const chatbotTypes = ["flow", "ai", "hybrid"];

function readDescription(value) {
  if (value === undefined || value === null) {
    return "";
  }

  if (typeof value !== "string") {
    throw createHttpError(400, "description precisa ser texto", "VALIDATION_ERROR");
  }

  return value.trim();
}

async function findOne(id) {
  const chatbotId = validateRequiredId(id, "id");
  const chatbot = store.findById("chatbots", chatbotId);

  if (!chatbot) {
    throw createHttpError(404, "chatbot nao encontrado", "NOT_FOUND");
  }

  return chatbot;
}

async function create(data) {
  const name = validateRequiredText(data.name, "name");
  const organizationId =
    validateOptionalText(data.organization_id, "organization_id") ||
    store.DEFAULT_ORGANIZATION.id;
  const type = validateOptionalEnum(data.type, chatbotTypes, "type") || "flow";
  const isActive =
    data.is_active === undefined
      ? true
      : validateOptionalBoolean(data.is_active, "is_active");
  const aiConfig = validateOptionalObject(data.ai_config, "ai_config", {}) || {};

  return store.create("chatbots", {
    organization_id: organizationId,
    name,
    description: readDescription(data.description),
    type,
    is_active: isActive,
    ai_config: aiConfig,
  });
}

async function findAll() {
  return store.list("chatbots");
}

async function update(id, data, options = {}) {
  const { partial = false } = options;
  const chatbot = await findOne(id);
  const nextType = validateOptionalEnum(data.type, chatbotTypes, "type");
  const nextIsActive = validateOptionalBoolean(data.is_active, "is_active");
  const nextAiConfig = validateOptionalObject(data.ai_config, "ai_config");

  const nextData = {
    organization_id:
      data.organization_id !== undefined
        ? validateRequiredText(data.organization_id, "organization_id")
        : chatbot.organization_id,
    name:
      data.name !== undefined
        ? validateRequiredText(data.name, "name")
        : chatbot.name,
    description:
      data.description !== undefined
        ? readDescription(data.description)
        : chatbot.description,
    type: nextType !== undefined ? nextType : chatbot.type,
    is_active: nextIsActive !== undefined ? nextIsActive : chatbot.is_active,
    ai_config: nextAiConfig !== undefined ? nextAiConfig : chatbot.ai_config,
  };

  if (!partial) {
    nextData.name = validateRequiredText(nextData.name, "name");
  }

  return store.update("chatbots", chatbot.id, nextData);
}

async function remove(id) {
  const chatbot = await findOne(id);
  const removedFlows = store.removeWhere(
    "flows",
    (flow) => flow.chatbot_id === chatbot.id
  );
  const removedFlowIds = new Set(removedFlows.map((flow) => flow.id));
  const removedNodes = store.removeWhere(
    "flow_nodes",
    (node) => removedFlowIds.has(node.flow_id)
  );
  const removedNodeIds = new Set(removedNodes.map((node) => node.id));

  store.removeWhere(
    "flow_edges",
    (edge) =>
      removedFlowIds.has(edge.flow_id) ||
      removedNodeIds.has(edge.source_node_id) ||
      removedNodeIds.has(edge.target_node_id)
  );

  const removedConversations = store.removeWhere(
    "conversations",
    (conversation) => conversation.chatbot_id === chatbot.id
  );
  const removedConversationIds = new Set(
    removedConversations.map((conversation) => conversation.id)
  );

  store.removeWhere(
    "messages",
    (message) => removedConversationIds.has(message.conversation_id)
  );
  store.remove("chatbots", chatbot.id);

  return chatbot;
}

module.exports = {
  create,
  findAll,
  findOne,
  update,
  remove,
};

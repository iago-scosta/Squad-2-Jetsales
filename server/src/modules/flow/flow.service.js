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

function validateRequiredObject(value, fieldName) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw createHttpError(400, `${fieldName} e obrigatorio`);
  }

  return value;
}

function validateOptionalPosition(value, fieldName) {
  if (value === undefined) {
    return 0;
  }

  if (typeof value !== "number" || Number.isNaN(value)) {
    throw createHttpError(400, `${fieldName} precisa ser numerico`);
  }

  return value;
}

function ensureChatbotExists(chatbotId) {
  const chatbot = memoryStore.findById("chatbots", chatbotId);

  if (!chatbot) {
    throw createHttpError(404, "chatbot nao encontrado");
  }

  return chatbot;
}

function findOne(id) {
  const flow = memoryStore.findById("flows", id);

  if (!flow) {
    throw createHttpError(404, "fluxo nao encontrado");
  }

  return flow;
}

function create(data) {
  const chatbotId = validateRequiredText(data.chatbot_id, "chatbot_id");
  const name = validateRequiredText(data.name, "name");

  ensureChatbotExists(chatbotId);

  return memoryStore.create("flows", {
    chatbot_id: chatbotId,
    name,
    status: "draft",
    version: 1,
  });
}

function findAll() {
  return memoryStore.list("flows");
}

function update(id, data) {
  findOne(id);

  const nextData = {};

  if (data.chatbot_id !== undefined) {
    const chatbotId = validateRequiredText(data.chatbot_id, "chatbot_id");
    ensureChatbotExists(chatbotId);
    nextData.chatbot_id = chatbotId;
  }

  if (data.name !== undefined) {
    nextData.name = validateRequiredText(data.name, "name");
  }

  if (data.status !== undefined) {
    nextData.status = validateRequiredText(data.status, "status");
  }

  if (data.version !== undefined) {
    if (!Number.isInteger(data.version) || data.version < 1) {
      throw createHttpError(400, "version precisa ser um numero inteiro");
    }

    nextData.version = data.version;
  }

  return memoryStore.update("flows", id, nextData);
}

function remove(id) {
  const flow = findOne(id);

  memoryStore.removeMany("flow_nodes", (node) => node.flow_id === id);
  memoryStore.removeMany("flow_edges", (edge) => edge.flow_id === id);
  memoryStore.remove("flows", id);

  return flow;
}

function ensureFlowExists(flowId) {
  return findOne(flowId);
}

function listNodes(flowId) {
  ensureFlowExists(flowId);

  return memoryStore.filter("flow_nodes", (node) => node.flow_id === flowId);
}

function createNode(flowId, data) {
  ensureFlowExists(flowId);

  const type = validateRequiredText(data.type, "type");
  const nodeData = validateRequiredObject(data.data, "data");
  const positionX = validateOptionalPosition(data.position_x, "position_x");
  const positionY = validateOptionalPosition(data.position_y, "position_y");

  return memoryStore.create("flow_nodes", {
    flow_id: flowId,
    type,
    data: nodeData,
    position_x: positionX,
    position_y: positionY,
  });
}

function listEdges(flowId) {
  ensureFlowExists(flowId);

  return memoryStore.filter("flow_edges", (edge) => edge.flow_id === flowId);
}

function createEdge(flowId, data) {
  ensureFlowExists(flowId);

  const sourceNodeId = validateRequiredText(
    data.source_node_id,
    "source_node_id"
  );
  const targetNodeId = validateRequiredText(
    data.target_node_id,
    "target_node_id"
  );
  const conditionType = validateOptionalText(
    data.condition_type,
    "condition_type"
  );
  const conditionValue =
    data.condition_value === undefined || data.condition_value === null
      ? null
      : String(data.condition_value);

  const sourceNode = memoryStore.findById("flow_nodes", sourceNodeId);
  const targetNode = memoryStore.findById("flow_nodes", targetNodeId);

  if (!sourceNode || !targetNode) {
    throw createHttpError(404, "no do fluxo nao encontrado");
  }

  if (sourceNode.flow_id !== flowId || targetNode.flow_id !== flowId) {
    throw createHttpError(404, "os nos precisam pertencer ao mesmo fluxo");
  }

  return memoryStore.create("flow_edges", {
    flow_id: flowId,
    source_node_id: sourceNodeId,
    target_node_id: targetNodeId,
    condition_type: conditionType || null,
    condition_value: conditionValue,
  });
}

module.exports = {
  create,
  findAll,
  findOne,
  update,
  remove,
  createNode,
  listNodes,
  createEdge,
  listEdges,
};

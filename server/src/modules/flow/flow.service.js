const createHttpError = require("../../utils/http-error");
const {
  validateOptionalEnum,
  validateOptionalInteger,
  validateOptionalObject,
  validateOptionalText,
  validateRequiredEnum,
  validateRequiredId,
  validateRequiredObject,
  validateRequiredText,
} = require("../../utils/validation");
const store = require("../../database");
const flowEngine = require("./flow.engine");

const flowStatuses = ["draft", "published"];
const nodeTypes = ["start", "message", "input", "condition", "end"];

async function ensureChatbotExists(chatbotId) {
  const chatbot = store.findById("chatbots", chatbotId);

  if (!chatbot) {
    throw createHttpError(404, "chatbot nao encontrado", "NOT_FOUND");
  }

  return chatbot;
}

async function findOne(id) {
  const flowId = validateRequiredId(id, "id");
  const flow = store.findById("flows", flowId);

  if (!flow) {
    throw createHttpError(404, "fluxo nao encontrado", "NOT_FOUND");
  }

  return flow;
}

async function create(data) {
  const chatbotId = validateRequiredId(data.chatbot_id, "chatbot_id");
  const name = validateRequiredText(data.name, "name");
  const status = validateOptionalEnum(data.status, flowStatuses, "status") || "draft";
  const version = validateOptionalInteger(data.version, "version", 1);

  await ensureChatbotExists(chatbotId);

  if (version < 1) {
    throw createHttpError(
      400,
      "version precisa ser maior ou igual a 1",
      "VALIDATION_ERROR"
    );
  }

  return store.create("flows", {
    chatbot_id: chatbotId,
    name,
    status,
    version,
  });
}

async function findAll() {
  return store.list("flows");
}

async function update(id, data, options = {}) {
  const { partial = false } = options;
  const flow = await findOne(id);
  const chatbotId =
    data.chatbot_id !== undefined
      ? validateRequiredId(data.chatbot_id, "chatbot_id")
      : flow.chatbot_id;
  const status = validateOptionalEnum(data.status, flowStatuses, "status");
  const version = validateOptionalInteger(data.version, "version");

  await ensureChatbotExists(chatbotId);

  const nextData = {
    chatbot_id: chatbotId,
    name:
      data.name !== undefined
        ? validateRequiredText(data.name, "name")
        : flow.name,
    status: status !== undefined ? status : flow.status,
    version: version !== undefined ? version : flow.version,
  };

  if (nextData.version < 1) {
    throw createHttpError(
      400,
      "version precisa ser maior ou igual a 1",
      "VALIDATION_ERROR"
    );
  }

  if (!partial) {
    nextData.name = validateRequiredText(nextData.name, "name");
  }

  return store.update("flows", flow.id, nextData);
}

async function remove(id) {
  const flow = await findOne(id);
  const removedNodes = store.removeWhere("flow_nodes", (node) => node.flow_id === flow.id);
  const removedNodeIds = new Set(removedNodes.map((node) => node.id));

  store.removeWhere(
    "flow_edges",
    (edge) =>
      edge.flow_id === flow.id ||
      removedNodeIds.has(edge.source_node_id) ||
      removedNodeIds.has(edge.target_node_id)
  );
  store.remove("flows", flow.id);

  return flow;
}

async function ensureFlowExists(flowId) {
  return findOne(flowId);
}

async function listNodes(flowId) {
  const validFlowId = validateRequiredId(flowId, "flowId");

  await ensureFlowExists(validFlowId);

  return store.filter("flow_nodes", (node) => node.flow_id === validFlowId);
}

async function findNode(flowId, nodeId) {
  const validNodeId = validateRequiredId(nodeId, "nodeId");
  const node = store.findById("flow_nodes", validNodeId);

  if (!node || node.flow_id !== flowId) {
    throw createHttpError(404, "no do fluxo nao encontrado", "NOT_FOUND");
  }

  return node;
}

async function createNode(flowId, data) {
  const validFlowId = validateRequiredId(flowId, "flowId");

  await ensureFlowExists(validFlowId);

  const type = validateRequiredEnum(data.type, nodeTypes, "type");
  const nodeData = validateRequiredObject(data.data, "data");
  const positionX = validateOptionalInteger(data.position_x, "position_x", 0);
  const positionY = validateOptionalInteger(data.position_y, "position_y", 0);

  return store.create("flow_nodes", {
    flow_id: validFlowId,
    type,
    data: nodeData,
    position_x: positionX,
    position_y: positionY,
  });
}

async function updateNode(flowId, nodeId, data, options = {}) {
  const { partial = false } = options;
  const validFlowId = validateRequiredId(flowId, "flowId");
  const node = await findNode(validFlowId, nodeId);
  const type = validateOptionalEnum(data.type, nodeTypes, "type");
  const nodeData = validateOptionalObject(data.data, "data");
  const positionX = validateOptionalInteger(data.position_x, "position_x");
  const positionY = validateOptionalInteger(data.position_y, "position_y");

  const nextData = {
    type: type !== undefined ? type : node.type,
    data: nodeData !== undefined ? nodeData : node.data,
    position_x: positionX !== undefined ? positionX : node.position_x,
    position_y: positionY !== undefined ? positionY : node.position_y,
  };

  if (!partial) {
    nextData.type = validateRequiredEnum(nextData.type, nodeTypes, "type");
    nextData.data = validateRequiredObject(nextData.data, "data");
  }

  return store.update("flow_nodes", node.id, nextData);
}

async function removeNode(flowId, nodeId) {
  const validFlowId = validateRequiredId(flowId, "flowId");
  const node = await findNode(validFlowId, nodeId);

  store.removeWhere(
    "flow_edges",
    (edge) =>
      edge.flow_id === validFlowId &&
      (edge.source_node_id === node.id || edge.target_node_id === node.id)
  );
  store.remove("flow_nodes", node.id);

  return node;
}

async function listEdges(flowId) {
  const validFlowId = validateRequiredId(flowId, "flowId");

  await ensureFlowExists(validFlowId);

  return store.filter("flow_edges", (edge) => edge.flow_id === validFlowId);
}

async function createEdge(flowId, data) {
  const validFlowId = validateRequiredId(flowId, "flowId");
  const sourceNodeId = validateRequiredId(data.source_node_id, "source_node_id");
  const targetNodeId = validateRequiredId(data.target_node_id, "target_node_id");
  const conditionType = validateOptionalText(data.condition_type, "condition_type");
  const conditionValue =
    data.condition_value === undefined || data.condition_value === null
      ? null
      : String(data.condition_value);

  await ensureFlowExists(validFlowId);
  await findNode(validFlowId, sourceNodeId);
  await findNode(validFlowId, targetNodeId);

  return store.create("flow_edges", {
    flow_id: validFlowId,
    source_node_id: sourceNodeId,
    target_node_id: targetNodeId,
    condition_type: conditionType || null,
    condition_value: conditionValue,
  });
}

async function removeEdge(flowId, edgeId) {
  const validFlowId = validateRequiredId(flowId, "flowId");
  await ensureFlowExists(validFlowId);

  const edge = store.findById("flow_edges", validateRequiredId(edgeId, "edgeId"));

  if (!edge || edge.flow_id !== validFlowId) {
    throw createHttpError(404, "edge nao encontrada", "NOT_FOUND");
  }

  store.remove("flow_edges", edge.id);

  return edge;
}

async function getFlowPreview(chatbotId, incomingMessage) {
  const flows = store
    .filter("flows", (flow) => flow.chatbot_id === chatbotId)
    .sort((left, right) => right.created_at.localeCompare(left.created_at));
  const selectedFlow =
    flows.find((flow) => flow.status === "published") || flows[0] || null;

  if (!selectedFlow) {
    return null;
  }

  const nodes = store.filter("flow_nodes", (node) => node.flow_id === selectedFlow.id);
  const edges = store.filter("flow_edges", (edge) => edge.flow_id === selectedFlow.id);
  const result = flowEngine.runFlow({
    flow: selectedFlow,
    nodes,
    edges,
    message: incomingMessage,
  });

  return result ? result.response : null;
}

module.exports = {
  create,
  findAll,
  findOne,
  update,
  remove,
  createNode,
  listNodes,
  updateNode,
  removeNode,
  createEdge,
  listEdges,
  removeEdge,
  getFlowPreview,
};

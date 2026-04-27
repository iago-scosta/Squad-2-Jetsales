const createHttpError = require("../../utils/http-error");
const {
  validateRequiredText,
  validateOptionalText,
  validateRequiredUuid,
  validateRequiredObject,
  validateOptionalInteger,
} = require("../../utils/validation");
const chatbotRepository = require("../chatbot/chatbot.repository");
const flowRepository = require("./flow.repository");

async function ensureChatbotExists(chatbotId) {
  const chatbot = await chatbotRepository.findById(chatbotId);

  if (!chatbot) {
    throw createHttpError(404, "chatbot nao encontrado");
  }

  return chatbot;
}

async function findOne(id) {
  const flowId = validateRequiredUuid(id, "id");
  const flow = await flowRepository.findFlowById(flowId);

  if (!flow) {
    throw createHttpError(404, "fluxo nao encontrado");
  }

  return flow;
}

async function create(data) {
  const chatbotId = validateRequiredUuid(data.chatbot_id, "chatbot_id");
  const name = validateRequiredText(data.name, "name");

  await ensureChatbotExists(chatbotId);

  return flowRepository.createFlow({
    chatbot_id: chatbotId,
    name,
    status: "draft",
    version: 1,
  });
}

async function findAll() {
  return flowRepository.findAllFlows();
}

async function update(id, data) {
  const flow = await findOne(id);

  const chatbotId =
    data.chatbot_id !== undefined
      ? validateRequiredUuid(data.chatbot_id, "chatbot_id")
      : flow.chatbot_id;

  await ensureChatbotExists(chatbotId);

  const nextData = {
    chatbot_id: chatbotId,
    name:
      data.name !== undefined
        ? validateRequiredText(data.name, "name")
        : flow.name,
    status:
      data.status !== undefined
        ? validateRequiredText(data.status, "status")
        : flow.status,
    version:
      data.version !== undefined
        ? validateOptionalInteger(data.version, "version")
        : flow.version,
  };

  if (nextData.version < 1) {
    throw createHttpError(400, "version precisa ser um numero inteiro");
  }

  return flowRepository.updateFlow(flow.id, nextData);
}

async function remove(id) {
  const flow = await findOne(id);

  await flowRepository.removeFlow(flow.id);

  return flow;
}

async function ensureFlowExists(flowId) {
  return findOne(flowId);
}

async function listNodes(flowId) {
  const validFlowId = validateRequiredUuid(flowId, "flowId");

  await ensureFlowExists(validFlowId);

  return flowRepository.listNodes(validFlowId);
}

async function createNode(flowId, data) {
  const validFlowId = validateRequiredUuid(flowId, "flowId");

  await ensureFlowExists(validFlowId);

  const type = validateRequiredText(data.type, "type");
  const nodeData = validateRequiredObject(data.data, "data");
  const positionX = validateOptionalInteger(data.position_x, "position_x", 0);
  const positionY = validateOptionalInteger(data.position_y, "position_y", 0);

  return flowRepository.createNode({
    flow_id: validFlowId,
    type,
    data: nodeData,
    position_x: positionX,
    position_y: positionY,
  });
}

async function listEdges(flowId) {
  const validFlowId = validateRequiredUuid(flowId, "flowId");

  await ensureFlowExists(validFlowId);

  return flowRepository.listEdges(validFlowId);
}

async function createEdge(flowId, data) {
  const validFlowId = validateRequiredUuid(flowId, "flowId");
  const sourceNodeId = validateRequiredUuid(
    data.source_node_id,
    "source_node_id"
  );
  const targetNodeId = validateRequiredUuid(
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

  await ensureFlowExists(validFlowId);

  const sourceNode = await flowRepository.findNodeById(sourceNodeId);
  const targetNode = await flowRepository.findNodeById(targetNodeId);

  if (!sourceNode || !targetNode) {
    throw createHttpError(404, "no do fluxo nao encontrado");
  }

  if (sourceNode.flow_id !== validFlowId || targetNode.flow_id !== validFlowId) {
    throw createHttpError(404, "os nos precisam pertencer ao mesmo fluxo");
  }

  return flowRepository.createEdge({
    flow_id: validFlowId,
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

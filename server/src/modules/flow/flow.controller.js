const flowService = require("./flow.service");
const { sendData, sendList } = require("../../utils/http-response");

async function create(req, res, next) {
  try {
    const flow = await flowService.create(req.body);
    sendData(res, flow, 201);
  } catch (error) {
    next(error);
  }
}

async function findAll(req, res, next) {
  try {
    const flows = await flowService.findAll();
    sendList(res, flows);
  } catch (error) {
    next(error);
  }
}

async function findOne(req, res, next) {
  try {
    const flow = await flowService.findOne(req.params.id);
    sendData(res, flow);
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const flow = await flowService.update(req.params.id, req.body, {
      partial: false,
    });
    sendData(res, flow);
  } catch (error) {
    next(error);
  }
}

async function patch(req, res, next) {
  try {
    const flow = await flowService.update(req.params.id, req.body, {
      partial: true,
    });
    sendData(res, flow);
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    const flow = await flowService.remove(req.params.id);
    sendData(res, {
      message: "fluxo removido com sucesso",
      flow,
    });
  } catch (error) {
    next(error);
  }
}

async function createNode(req, res, next) {
  try {
    const node = await flowService.createNode(req.params.flowId, req.body);
    sendData(res, node, 201);
  } catch (error) {
    next(error);
  }
}

async function listNodes(req, res, next) {
  try {
    const nodes = await flowService.listNodes(req.params.flowId);
    sendList(res, nodes);
  } catch (error) {
    next(error);
  }
}

async function updateNode(req, res, next) {
  try {
    const node = await flowService.updateNode(
      req.params.flowId,
      req.params.nodeId,
      req.body,
      { partial: false }
    );
    sendData(res, node);
  } catch (error) {
    next(error);
  }
}

async function patchNode(req, res, next) {
  try {
    const node = await flowService.updateNode(
      req.params.flowId,
      req.params.nodeId,
      req.body,
      { partial: true }
    );
    sendData(res, node);
  } catch (error) {
    next(error);
  }
}

async function removeNode(req, res, next) {
  try {
    const node = await flowService.removeNode(req.params.flowId, req.params.nodeId);
    sendData(res, {
      message: "no removido com sucesso",
      node,
    });
  } catch (error) {
    next(error);
  }
}

async function createEdge(req, res, next) {
  try {
    const edge = await flowService.createEdge(req.params.flowId, req.body);
    sendData(res, edge, 201);
  } catch (error) {
    next(error);
  }
}

async function listEdges(req, res, next) {
  try {
    const edges = await flowService.listEdges(req.params.flowId);
    sendList(res, edges);
  } catch (error) {
    next(error);
  }
}

async function removeEdge(req, res, next) {
  try {
    const edge = await flowService.removeEdge(req.params.flowId, req.params.edgeId);
    sendData(res, {
      message: "edge removida com sucesso",
      edge,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  create,
  findAll,
  findOne,
  update,
  patch,
  remove,
  createNode,
  listNodes,
  updateNode,
  patchNode,
  removeNode,
  createEdge,
  listEdges,
  removeEdge,
};

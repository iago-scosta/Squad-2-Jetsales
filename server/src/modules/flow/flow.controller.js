const flowService = require("./flow.service");

async function create(req, res, next) {
  try {
    const flow = await flowService.create(req.body);
    res.status(201).json(flow);
  } catch (error) {
    next(error);
  }
}

async function findAll(req, res, next) {
  try {
    const flows = await flowService.findAll();
    res.json(flows);
  } catch (error) {
    next(error);
  }
}

async function findOne(req, res, next) {
  try {
    const flow = await flowService.findOne(req.params.id);
    res.json(flow);
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const flow = await flowService.update(req.params.id, req.body);
    res.json(flow);
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    await flowService.remove(req.params.id);
    res.json({ mensagem: "fluxo removido com sucesso" });
  } catch (error) {
    next(error);
  }
}

async function createNode(req, res, next) {
  try {
    const node = await flowService.createNode(req.params.flowId, req.body);
    res.status(201).json(node);
  } catch (error) {
    next(error);
  }
}

async function listNodes(req, res, next) {
  try {
    const nodes = await flowService.listNodes(req.params.flowId);
    res.json(nodes);
  } catch (error) {
    next(error);
  }
}

async function createEdge(req, res, next) {
  try {
    const edge = await flowService.createEdge(req.params.flowId, req.body);
    res.status(201).json(edge);
  } catch (error) {
    next(error);
  }
}

async function listEdges(req, res, next) {
  try {
    const edges = await flowService.listEdges(req.params.flowId);
    res.json(edges);
  } catch (error) {
    next(error);
  }
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

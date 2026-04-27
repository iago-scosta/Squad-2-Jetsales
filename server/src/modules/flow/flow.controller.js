const flowService = require("./flow.service");

function create(req, res, next) {
  try {
    const flow = flowService.create(req.body);
    res.status(201).json(flow);
  } catch (error) {
    next(error);
  }
}

function findAll(req, res, next) {
  try {
    const flows = flowService.findAll();
    res.json(flows);
  } catch (error) {
    next(error);
  }
}

function findOne(req, res, next) {
  try {
    const flow = flowService.findOne(req.params.id);
    res.json(flow);
  } catch (error) {
    next(error);
  }
}

function update(req, res, next) {
  try {
    const flow = flowService.update(req.params.id, req.body);
    res.json(flow);
  } catch (error) {
    next(error);
  }
}

function remove(req, res, next) {
  try {
    flowService.remove(req.params.id);
    res.json({ mensagem: "fluxo removido com sucesso" });
  } catch (error) {
    next(error);
  }
}

function createNode(req, res, next) {
  try {
    const node = flowService.createNode(req.params.flowId, req.body);
    res.status(201).json(node);
  } catch (error) {
    next(error);
  }
}

function listNodes(req, res, next) {
  try {
    const nodes = flowService.listNodes(req.params.flowId);
    res.json(nodes);
  } catch (error) {
    next(error);
  }
}

function createEdge(req, res, next) {
  try {
    const edge = flowService.createEdge(req.params.flowId, req.body);
    res.status(201).json(edge);
  } catch (error) {
    next(error);
  }
}

function listEdges(req, res, next) {
  try {
    const edges = flowService.listEdges(req.params.flowId);
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

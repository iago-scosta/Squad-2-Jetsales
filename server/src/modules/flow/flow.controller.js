// server/src/modules/flow/flow.controller.js
//
// Camada fina sobre flow.service. authRequired já roda em routes/index.js,
// então aqui só lemos req.auth.organizationId, validamos input com zod e
// delegamos. Falhas de validação propagam ZodError -> errorMiddleware.

const service = require('./flow.service');
const { httpError } = require('../../middlewares/error.middleware');
const {
  idParam,
  updateFlowBody,
  bulkUpdateBody,
  createNodeBody,
  updateNodeBody,
  createEdgeBody,
} = require('./flow.schemas');

/* ============================================================ */
/*  /flows                                                       */
/* ============================================================ */

exports.getFlow = async (req, res, next) => {
  try {
    const { id } = idParam.parse(req.params);
    const result = await service.getFlowWithGraph(req.auth.organizationId, id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.updateFlow = async (req, res, next) => {
  try {
    const { id } = idParam.parse(req.params);
    const body = updateFlowBody.parse(req.body ?? {});
    if (Object.keys(body).length === 0) {
      throw httpError(400, 'No fields to update', 'VALIDATION_ERROR');
    }
    const result = await service.updateFlow(req.auth.organizationId, id, body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.publishFlow = async (req, res, next) => {
  try {
    const { id } = idParam.parse(req.params);
    const result = await service.publishFlow(req.auth.organizationId, id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.bulkUpdateFlow = async (req, res, next) => {
  try {
    const { id } = idParam.parse(req.params);
    const body = bulkUpdateBody.parse(req.body ?? {});
    const result = await service.bulkUpdateFlow(req.auth.organizationId, id, body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

/* ============================================================ */
/*  /flow-nodes                                                  */
/* ============================================================ */

exports.createNode = async (req, res, next) => {
  try {
    const body = createNodeBody.parse(req.body ?? {});
    const row = await service.createNode(req.auth.organizationId, body);
    res.status(201).json(row);
  } catch (err) {
    next(err);
  }
};

exports.updateNode = async (req, res, next) => {
  try {
    const { id } = idParam.parse(req.params);
    const body = updateNodeBody.parse(req.body ?? {});
    const row = await service.updateNode(req.auth.organizationId, id, body);
    res.json(row);
  } catch (err) {
    next(err);
  }
};

exports.deleteNode = async (req, res, next) => {
  try {
    const { id } = idParam.parse(req.params);
    await service.deleteNode(req.auth.organizationId, id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

/* ============================================================ */
/*  /flow-edges                                                  */
/* ============================================================ */

exports.createEdge = async (req, res, next) => {
  try {
    const body = createEdgeBody.parse(req.body ?? {});
    const row = await service.createEdge(req.auth.organizationId, body);
    res.status(201).json(row);
  } catch (err) {
    next(err);
  }
};

exports.deleteEdge = async (req, res, next) => {
  try {
    const { id } = idParam.parse(req.params);
    await service.deleteEdge(req.auth.organizationId, id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

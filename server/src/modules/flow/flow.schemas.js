// server/src/modules/flow/flow.schemas.js
//
// Schemas zod para validação de body/params/query dos endpoints do módulo
// flow. Falha de validação propaga ZodError -> errorMiddleware devolve 400
// com { code: 'VALIDATION_ERROR', fields }.

const { z } = require('zod');

const FLOW_NODE_TYPES = [
  'trigger',
  'message',
  'menu',
  'condition',
  'wait',
  'capture',
  'integration',
  'end',
];

const FLOW_STATUSES = ['draft', 'published'];

/* -------------------- params -------------------- */

const idParam = z.object({ id: z.string().uuid() });

/* -------------------- /flows/:id -------------------- */

const updateFlowBody = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    status: z.enum(FLOW_STATUSES).optional(),
  })
  .strict();

/* -------------------- /flows/:id/bulk-update -------------------- */

const bulkNodeSchema = z.object({
  id: z.string().uuid(),
  flowId: z.string().uuid(),
  type: z.enum(FLOW_NODE_TYPES),
  data: z.record(z.any()).default({}),
  positionX: z.number().finite(),
  positionY: z.number().finite(),
});

const bulkEdgeSchema = z.object({
  id: z.string().uuid(),
  flowId: z.string().uuid(),
  sourceNodeId: z.string().uuid(),
  targetNodeId: z.string().uuid(),
  sourceHandle: z.string().nullable().optional(),
  conditionType: z.string().optional(),
  conditionValue: z.string().optional(),
});

const bulkUpdateBody = z.object({
  nodes: z.array(bulkNodeSchema),
  edges: z.array(bulkEdgeSchema),
});

/* -------------------- /flow-nodes -------------------- */

const createNodeBody = z.object({
  flowId: z.string().uuid(),
  type: z.enum(FLOW_NODE_TYPES),
  data: z.record(z.any()).default({}),
  positionX: z.number().finite(),
  positionY: z.number().finite(),
});

const updateNodeBody = z
  .object({
    type: z.enum(FLOW_NODE_TYPES).optional(),
    data: z.record(z.any()).optional(),
    positionX: z.number().finite().optional(),
    positionY: z.number().finite().optional(),
  })
  .strict();

/* -------------------- /flow-edges -------------------- */

const createEdgeBody = z.object({
  flowId: z.string().uuid(),
  sourceNodeId: z.string().uuid(),
  targetNodeId: z.string().uuid(),
  sourceHandle: z.string().nullable().optional(),
  conditionType: z.string().optional(),
  conditionValue: z.string().optional(),
});

module.exports = {
  FLOW_NODE_TYPES,
  FLOW_STATUSES,
  idParam,
  updateFlowBody,
  bulkUpdateBody,
  createNodeBody,
  updateNodeBody,
  createEdgeBody,
};

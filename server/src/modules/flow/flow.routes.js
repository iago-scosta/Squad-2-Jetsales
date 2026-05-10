// server/src/modules/flow/flow.routes.js
//
// Este router atende DOIS contratos diferentes:
//
// 1. PÚBLICO (consumido pelo front em client/src/lib/api/flows.ts):
//      GET    /flows/:id                -> FlowWithGraph
//      PATCH  /flows/:id                -> Flow
//      POST   /flows/:id/publish        -> Flow
//      POST   /flows/:id/bulk-update    -> { ok: true }
//
//    Implementado pelo flow.controller (DB-backed via knex).
//
// 2. RUNTIME / INTERNO (executor in-memory do FlowEngine, mantido pela squad):
//      POST   /flows/runtime               -> cria fluxo em memória
//      GET    /flows/runtime               -> lista fluxos em memória
//      POST   /flows/runtime/validate      -> valida estrutura
//      GET    /flows/runtime/:flowId       -> obtém fluxo
//      PUT    /flows/runtime/:flowId       -> atualiza fluxo
//      DELETE /flows/runtime/:flowId       -> deleta fluxo
//      POST   /flows/runtime/:flowId/sessions
//      POST   /flows/runtime/sessions/:sessionId/input
//      GET    /flows/runtime/sessions/:sessionId
//      GET    /flows/runtime/sessions/:sessionId/stats
//      POST   /flows/runtime/sessions/:sessionId/end
//
//    Implementado pelo flow.runtime.controller (in-memory).

const router = require('express').Router();
const c = require('./flow.controller');
const runtimeController = require('./flow.runtime.controller');

/* ============================================================ */
/*  RUNTIME INTERNO — FlowEngine in-memory mantido pela squad     */
/*  (declarado antes para não colidir com /:id do contrato       */
/*   público)                                                     */
/* ============================================================ */

// ----- Fluxos -----

router.post('/runtime', (req, res) => runtimeController.createFlow(req, res));
router.get('/runtime', (req, res) => runtimeController.listflows(req, res));
router.post('/runtime/validate', (req, res) => runtimeController.validateFlow(req, res));
router.get('/runtime/:flowId', (req, res) => runtimeController.getFlow(req, res));
router.put('/runtime/:flowId', (req, res) => runtimeController.updateFlow(req, res));
router.delete('/runtime/:flowId', (req, res) => runtimeController.deleteFlow(req, res));

// ----- Sessões do FlowEngine -----

router.post('/runtime/:flowId/sessions', (req, res) => runtimeController.startSession(req, res));
router.post('/runtime/sessions/:sessionId/input', (req, res) => runtimeController.processInput(req, res));
router.get('/runtime/sessions/:sessionId', (req, res) => runtimeController.getSession(req, res));
router.get('/runtime/sessions/:sessionId/stats', (req, res) => runtimeController.getSessionStats(req, res));
router.post('/runtime/sessions/:sessionId/end', (req, res) => runtimeController.endSession(req, res));

/* ============================================================ */
/*  CONTRATO PÚBLICO — consumido pelo editor de fluxos do front  */
/* ============================================================ */

router.get('/:id', c.getFlow);
router.patch('/:id', c.updateFlow);
router.post('/:id/publish', c.publishFlow);
router.post('/:id/bulk-update', c.bulkUpdateFlow);

module.exports = router;

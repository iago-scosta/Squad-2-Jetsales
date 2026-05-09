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
//    Esses ainda dependem do refator knex (Fase 1) — respondem 501 por enquanto.
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
//    Eles são usados pelo motor de execução do chatbot (consumido pelo
//    webhook handler da EvolutionAPI), não pelo editor visual.
//    Ao migrar para knex na Fase 1, este sub-router será absorvido pelo
//    flow.service definitivo.

const router = require('express').Router();
const flowController = require('./flow.controller');

/* ============================================================ */
/*  CONTRATO PÚBLICO — consumido pelo editor de fluxos do front  */
/* ============================================================ */

function notImplemented(action) {
  return (req, res) => {
    res.status(501).json({
      error: `flows.${action} pendente — refator knex (Fase 1)`,
      code: 'NOT_IMPLEMENTED',
    });
  };
}

router.get('/:id', notImplemented('get'));
router.patch('/:id', notImplemented('update'));
router.post('/:id/publish', notImplemented('publish'));
router.post('/:id/bulk-update', notImplemented('bulkUpdate'));

/* ============================================================ */
/*  RUNTIME INTERNO — FlowEngine in-memory mantido pela squad     */
/* ============================================================ */

// ----- Fluxos -----

router.post('/runtime', (req, res) => flowController.createFlow(req, res));
router.get('/runtime', (req, res) => flowController.listflows(req, res));
router.post('/runtime/validate', (req, res) => flowController.validateFlow(req, res));
router.get('/runtime/:flowId', (req, res) => flowController.getFlow(req, res));
router.put('/runtime/:flowId', (req, res) => flowController.updateFlow(req, res));
router.delete('/runtime/:flowId', (req, res) => flowController.deleteFlow(req, res));

// ----- Sessões do FlowEngine -----

router.post('/runtime/:flowId/sessions', (req, res) => flowController.startSession(req, res));
router.post('/runtime/sessions/:sessionId/input', (req, res) => flowController.processInput(req, res));
router.get('/runtime/sessions/:sessionId', (req, res) => flowController.getSession(req, res));
router.get('/runtime/sessions/:sessionId/stats', (req, res) => flowController.getSessionStats(req, res));
router.post('/runtime/sessions/:sessionId/end', (req, res) => flowController.endSession(req, res));

module.exports = router;

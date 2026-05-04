// server/src/modules/flow/flow.routes.js
//
// Contrato esperado pelo front (client/src/lib/api/flows.ts):
//   GET    /flows/:id                -> FlowWithGraph
//   PATCH  /flows/:id                -> Flow
//   POST   /flows/:id/publish        -> Flow
//   POST   /flows/:id/bulk-update    -> { ok: true }
//
// O serviço in-memory antigo (states+edges) NÃO bate com esse contrato e
// permanece em flow.service.js apenas para o runtime do FlowEngine.
// Stubs 501 abaixo até a Fase 1 (refator knex).

const router = require('express').Router();

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

module.exports = router;

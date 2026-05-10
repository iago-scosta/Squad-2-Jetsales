// server/src/modules/flow/edge.routes.js
//
// Sub-router montado em /flow-edges pelo routes/index.js. Handlers em
// flow.controller.

const router = require('express').Router();
const c = require('./flow.controller');

router.post('/', c.createEdge);
router.delete('/:id', c.deleteEdge);

module.exports = router;

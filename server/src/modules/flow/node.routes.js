// server/src/modules/flow/node.routes.js
//
// Sub-router montado em /flow-nodes pelo routes/index.js. Os handlers vivem
// em flow.controller — esse arquivo só amarra paths a funções.

const router = require('express').Router();
const c = require('./flow.controller');

router.post('/', c.createNode);
router.patch('/:id', c.updateNode);
router.delete('/:id', c.deleteNode);

module.exports = router;

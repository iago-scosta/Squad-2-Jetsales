const router = require('express').Router();
const controller = require('./message.controller');

// CRUD de mensagens
router.post('/', controller.create);
router.get('/', controller.findAll);
router.get('/:id', controller.findOne);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;

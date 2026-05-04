// server/src/modules/auth/auth.routes.js
//
// Rotas de autenticação. As 4 primeiras são públicas (sem cookie ainda) e
// /me é a única que exige authRequired — aplicado pontualmente porque o
// agregador em routes/index.js NÃO aplica authRequired neste sub-router
// (ele é montado antes do middleware global).

const router = require('express').Router();
const controller = require('./auth.controller');
const { authRequired } = require('../../middlewares/auth.middleware');

router.post('/login', controller.login);
router.post('/logout', controller.logout);
router.post('/refresh', controller.refresh);
router.post('/forgot-password', controller.forgotPassword);
router.get('/me', authRequired, controller.me);

module.exports = router;

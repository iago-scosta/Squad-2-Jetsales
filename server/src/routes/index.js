// server/src/routes/index.js
//
// Agregador de rotas do JetGO. Tudo aqui é montado pelo app.js sob /api/v1.
// Mantemos os módulos isolados por domínio para que cada subgrupo (auth, flows,
// chatbots, etc.) possa evoluir sem tocar nos outros.

const router = require('express').Router();
const { authRequired } = require('../middlewares/auth.middleware');

/* -------------------- Helpers -------------------- */

/**
 * Tenta carregar um router. Se o módulo ainda não existe (ex.: módulos das
 * próximas fases), devolve um router stub que responde 501 Not Implemented —
 * assim o front não recebe 404 silencioso e a equipe vê o que falta no log.
 */
function loadOrStub(modulePath, label) {
  try {
    const mod = require(modulePath);
    if (typeof mod !== 'function' && typeof mod?.handle !== 'function') {
      console.warn(`⚠️  [${label}] export não é um router Express — usando stub`);
      return makeStub(label);
    }
    return mod;
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND' && err.message.includes(modulePath.split('/').pop())) {
      console.warn(`⚠️  [${label}] módulo ainda não implementado — usando stub 501`);
      return makeStub(label);
    }
    // erro real (sintaxe, dependência faltando) — propaga
    throw err;
  }
}

function makeStub(label) {
  const stub = require('express').Router();
  stub.all('*', (req, res) => {
    res.status(501).json({
      error: `Endpoint não implementado: ${label}`,
      code: 'NOT_IMPLEMENTED',
      path: req.originalUrl,
    });
  });
  return stub;
}

/* -------------------- Rotas públicas -------------------- */

// Auth — login, logout, refresh, me, forgot-password
router.use('/auth', loadOrStub('../modules/auth/auth.routes', 'auth'));

/* -------------------- Rotas autenticadas -------------------- */
//
// A partir daqui tudo exige cookie httpOnly válido + CSRF double-submit em
// métodos state-changing. Os módulos individuais NÃO precisam aplicar
// authRequired novamente — é aplicado uma vez aqui.

router.use(authRequired);

router.use('/chatbots', loadOrStub('../modules/chatbot/chatbot.routes', 'chatbots'));
router.use('/flows', loadOrStub('../modules/flow/flow.routes', 'flows'));
router.use('/flow-nodes', loadOrStub('../modules/flow/node.routes', 'flow-nodes'));
router.use('/flow-edges', loadOrStub('../modules/flow/edge.routes', 'flow-edges'));
router.use(
  '/whatsapp-connections',
  loadOrStub('../modules/whatsapp/whatsapp.routes', 'whatsapp-connections')
);
router.use(
  '/conversations',
  loadOrStub('../modules/conversation/conversation.routes', 'conversations')
);
router.use('/tickets', loadOrStub('../modules/ticket/ticket.routes', 'tickets'));
router.use('/dashboard', loadOrStub('../modules/dashboard/dashboard.routes', 'dashboard'));

/* -------------------- Webhooks (públicos, sem auth) -------------------- */
//
// Webhooks da EvolutionAPI vêm de servidor externo — aplicamos validação
// própria por API key/HMAC dentro do módulo, não usamos cookie.
// Como esses estão antes do authRequired? Não — montamos o sub-router antes.
// Para isso recriamos um sub-router público abaixo e o app.js também o expõe.

module.exports = router;

const router = require('express').Router();
const flowController = require('./flow.controller');

// ===== FLUXOS =====

/**
 * Criar novo fluxo
 * POST /api/flow
 */
router.post('/', (req, res) => flowController.createFlow(req, res));

/**
 * Listar todos os fluxos
 * GET /api/flow
 */
router.get('/', (req, res) => flowController.listflow(req, res));

/**
 * Validar estrutura de um fluxo
 * POST /api/flow/validate
 */
router.post('/validate', (req, res) => flowController.validateFlow(req, res));

/**
 * Obter um fluxo pelo ID
 * GET /api/flow/:flowId
 */
router.get('/:flowId', (req, res) => flowController.getFlow(req, res));

/**
 * Atualizar um fluxo
 * PUT /api/flow/:flowId
 */
router.put('/:flowId', (req, res) => flowController.updateFlow(req, res));

/**
 * Deletar um fluxo
 * DELETE /api/flow/:flowId
 */
router.delete('/:flowId', (req, res) => flowController.deleteFlow(req, res));

// ===== SESSÕES DE FLUXO =====

/**
 * Iniciar uma sessão de fluxo
 * POST /api/flow/:flowId/sessions
 */
router.post('/:flowId/sessions', (req, res) => flowController.startSession(req, res));

/**
 * Processar entrada de usuário em uma sessão
 * POST /api/flow/sessions/:sessionId/input
 */
router.post('/sessions/:sessionId/input', (req, res) => flowController.processInput(req, res));

/**
 * Obter informações de uma sessão
 * GET /api/flow/sessions/:sessionId
 */
router.get('/sessions/:sessionId', (req, res) => flowController.getSession(req, res));

/**
 * Obter estatísticas de uma sessão
 * GET /api/flow/sessions/:sessionId/stats
 */
router.get('/sessions/:sessionId/stats', (req, res) => flowController.getSessionStats(req, res));

/**
 * Encerrar uma sessão
 * POST /api/flow/sessions/:sessionId/end
 */
router.post('/sessions/:sessionId/end', (req, res) => flowController.endSession(req, res));

module.exports = router;

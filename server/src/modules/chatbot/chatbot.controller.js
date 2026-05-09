// server/src/modules/chatbot/chatbot.controller.js
//
// Camada fina sobre chatbot.service. authRequired já roda em routes/index.js,
// então aqui só lemos req.auth.{organizationId,userId}, validamos input e
// delegamos. aiGenerate/aiAdjust seguem 501 até a próxima fase.

const service = require('./chatbot.service');

const VALID_STATUS = ['active', 'inactive'];

function notImplemented(action) {
  return (req, res) => {
    res.status(501).json({
      error: `chatbot.${action} ainda não migrado para knex`,
      code: 'NOT_IMPLEMENTED',
    });
  };
}

exports.findAll = async (req, res, next) => {
  try {
    const { organizationId } = req.auth;
    const { status, type } = req.query;
    if (status !== undefined && !VALID_STATUS.includes(status)) {
      return res.status(400).json({ error: 'status inválido', code: 'BAD_REQUEST' });
    }
    if (type !== undefined && !service.VALID_TYPES.includes(type)) {
      return res.status(400).json({ error: 'type inválido', code: 'BAD_REQUEST' });
    }
    const rows = await service.list(organizationId, { status, type });
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.findOne = async (req, res, next) => {
  try {
    const row = await service.findById(req.auth.organizationId, req.params.id);
    if (!row) return res.status(404).json({ error: 'Chatbot não encontrado', code: 'NOT_FOUND' });
    res.json(row);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name, description, type } = req.body || {};
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'name é obrigatório', code: 'BAD_REQUEST' });
    }
    if (!type || !service.VALID_TYPES.includes(type)) {
      return res.status(400).json({ error: 'type inválido', code: 'BAD_REQUEST' });
    }
    const row = await service.create(req.auth.organizationId, req.auth.userId, {
      name: name.trim(),
      description,
      type,
    });
    res.status(201).json(row);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const patch = req.body || {};
    if ('is_active' in patch || 'isActive' in patch) {
      return res.status(400).json({
        error: 'Use /activate ou /deactivate para alterar status',
        code: 'BAD_REQUEST',
      });
    }
    if (patch.type !== undefined && !service.VALID_TYPES.includes(patch.type)) {
      return res.status(400).json({ error: 'type inválido', code: 'BAD_REQUEST' });
    }
    const mapped = {};
    if (patch.name !== undefined) mapped.name = patch.name;
    if (patch.description !== undefined) mapped.description = patch.description;
    if (patch.type !== undefined) mapped.type = patch.type;
    if (patch.aiConfig !== undefined) mapped.ai_config = patch.aiConfig;
    if (patch.activeFlowId !== undefined) mapped.active_flow_id = patch.activeFlowId;

    const existing = await service.findById(req.auth.organizationId, req.params.id);
    if (!existing) return res.status(404).json({ error: 'Chatbot não encontrado', code: 'NOT_FOUND' });

    const row = await service.update(req.auth.organizationId, req.params.id, mapped);
    res.json(row);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const ok = await service.remove(req.auth.organizationId, req.params.id);
    if (!ok) return res.status(404).json({ error: 'Chatbot não encontrado', code: 'NOT_FOUND' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

exports.duplicate = async (req, res, next) => {
  try {
    const row = await service.duplicate(req.auth.organizationId, req.auth.userId, req.params.id);
    if (!row) return res.status(404).json({ error: 'Chatbot não encontrado', code: 'NOT_FOUND' });
    res.status(201).json(row);
  } catch (err) {
    next(err);
  }
};

exports.activate = async (req, res, next) => {
  try {
    const row = await service.activate(req.auth.organizationId, req.params.id);
    if (!row) return res.status(404).json({ error: 'Chatbot não encontrado', code: 'NOT_FOUND' });
    res.json(row);
  } catch (err) {
    next(err);
  }
};

exports.deactivate = async (req, res, next) => {
  try {
    const row = await service.deactivate(req.auth.organizationId, req.params.id);
    if (!row) return res.status(404).json({ error: 'Chatbot não encontrado', code: 'NOT_FOUND' });
    res.json(row);
  } catch (err) {
    next(err);
  }
};

exports.aiGenerate = notImplemented('aiGenerate');
exports.aiAdjust = notImplemented('aiAdjust');

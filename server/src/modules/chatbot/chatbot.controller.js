// server/src/modules/chatbot/chatbot.controller.js
//
// ⚠️ Implementação anterior usava Mongoose (incompatível com a stack atual de
// Postgres + knex). Neutralizada até a Fase 1 (refator usando knex).
// Mantém handlers que respondem 501 — assim a rota é descoberta pelo front e
// fica clara no log o que falta entregar.

function notImplemented(action) {
  return (req, res) => {
    res.status(501).json({
      error: `chatbot.${action} ainda não migrado para knex`,
      code: 'NOT_IMPLEMENTED',
    });
  };
}

exports.create = notImplemented('create');
exports.findAll = notImplemented('findAll');
exports.findOne = notImplemented('findOne');
exports.update = notImplemented('update');
exports.remove = notImplemented('remove');
exports.duplicate = notImplemented('duplicate');
exports.activate = notImplemented('activate');
exports.deactivate = notImplemented('deactivate');
exports.aiGenerate = notImplemented('aiGenerate');
exports.aiAdjust = notImplemented('aiAdjust');

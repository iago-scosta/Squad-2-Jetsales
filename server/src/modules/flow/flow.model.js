// server/src/modules/flow/flow.model.js
//
// ⚠️ Este arquivo era um "flow de exemplo" hardcoded em ESM e quebrava o boot.
// O modelo real agora é a tabela `flows` (ver migration 20260504_001).
// Mantido aqui APENAS como fixture de referência até o módulo flow ser migrado
// para knex (Fase 1).

const flowExample = {
  states: [
    { id: 'start', type: 'message', message: 'Bem-vindo ao nosso atendimento!', delay: 500 },
    { id: 'ask_name', type: 'message', message: 'Qual é o seu nome?', delay: 500 },
    { id: 'get_name', type: 'input', variable: 'name' },
    { id: 'welcome_user', type: 'message', message: 'Prazer, {{name}}!', delay: 500 },
  ],
  edges: [
    { from: 'start', to: 'ask_name' },
    { from: 'ask_name', to: 'get_name' },
    { from: 'get_name', to: 'welcome_user' },
  ],
};

module.exports = { flowExample };

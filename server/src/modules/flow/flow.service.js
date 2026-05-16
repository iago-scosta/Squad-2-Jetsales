const db = require('../../database');
const { FlowEngine } = require('./flow.engine');
const FlowModel = require('./flow.model');

const flowSessions = new Map();

// Mapeia os tipos "semânticos" usados no editor/engine para os valores do enum do banco
const NODE_TYPE_TO_DB = {
  message:     'message',
  input:       'capture',   // input do engine → capture no banco
  capture:     'capture',
  choice:      'menu',      // choice → menu
  menu:        'menu',
  api:         'integration',
  integration: 'integration',
  condition:   'condition',
  wait:        'wait',
  trigger:     'trigger',
  end:         'end',
};

// Mapeia de volta: banco → engine (capture vira input para o FlowEngine continuar funcionando)
const DB_TYPE_TO_ENGINE = {
  capture:     'input',
  menu:        'choice',
  integration: 'api',
  message:     'message',
  condition:   'condition',
  wait:        'wait',
  trigger:     'trigger',
  end:         'end',
};

const toDbType = (type) => NODE_TYPE_TO_DB[type] || type;
const toEngineType = (type) => DB_TYPE_TO_ENGINE[type] || type;

class FlowService {
  // ─────────────────────────────────────────────
  // CRUD de Flows
  // ─────────────────────────────────────────────

  async createFlow(flowData) {
    return await db.transaction(async (trx) => {
      const [flow] = await trx('flows')
        .insert({
          chatbot_id: flowData.chatbotId || flowData.chatbot_id || null,
          name: flowData.name,
          version: flowData.version || 1,
          ...(flowData.status ? { status: flowData.status } : {}),
        })
        .returning('*');

      const states = flowData.states || [];
      const edges  = flowData.edges  || [];
      const nodeIdMap = {};

      if (states.length > 0) {
        const nodePayloads = states.map((s) => ({
          flow_id:    flow.id,
          type:       toDbType(s.type),
          data: {
            label:    s.id,
            message:  s.message  || null,
            variable: s.variable || null,
            options:  s.options  || null,
            url:      s.url      || null,
            saveAs:   s.saveAs   || null,
            key:      s.key      || null,
            value:    s.value    || null,
            condition:s.condition|| null,
            delay:    s.delay    || 0,
          },
          position_x: s.position_x ?? 0,
          position_y: s.position_y ?? 0,
        }));

        const insertedNodes = await trx('flow_nodes').insert(nodePayloads).returning('*');
        insertedNodes.forEach((n) => {
          if (n.data?.label) nodeIdMap[n.data.label] = n.id;
        });
      }

      if (edges.length > 0) {
        const edgePayloads = edges.map((e) => ({
          flow_id:         flow.id,
          source_node_id:  nodeIdMap[e.from] || e.from,
          target_node_id:  nodeIdMap[e.to]   || e.to,
          source_handle:   e.source_handle   || null,
          condition_type:  e.condition?.operator || null,
          condition_value: e.condition?.value != null ? String(e.condition.value) : null,
        }));

        await trx('flow_edges').insert(edgePayloads);
      }

      return await FlowModel.findWithGraph(flow.id);
    });
  }

  async getFlow(flowId) {
    const flow = await FlowModel.findOne(flowId);
    if (!flow) throw new Error(`Fluxo com ID ${flowId} não encontrado`);
    return flow;
  }

  async getFlowWithGraph(flowId) {
    const flow = await FlowModel.findWithGraph(flowId);
    if (!flow) throw new Error(`Fluxo com ID ${flowId} não encontrado`);
    return flow;
  }

  async listFlows({ chatbotId } = {}) {
    return await FlowModel.findAll({ chatbotId });
  }

  async updateFlow(flowId, updates) {
    await this.getFlow(flowId);
    return await FlowModel.update(flowId, updates);
  }

  async replaceGraph(flowId, { states = [], edges = [] }) {
    await this.getFlow(flowId);

    return await db.transaction(async (trx) => {
      await trx('flow_edges').where({ flow_id: flowId }).del();
      await trx('flow_nodes').where({ flow_id: flowId }).del();

      const nodeIdMap = {};

      if (states.length > 0) {
        const nodePayloads = states.map((s) => ({
          flow_id:    flowId,
          type:       toDbType(s.type),
          data: {
            label:    s.id,
            message:  s.message  || null,
            variable: s.variable || null,
            options:  s.options  || null,
            url:      s.url      || null,
            saveAs:   s.saveAs   || null,
            key:      s.key      || null,
            value:    s.value    || null,
            condition:s.condition|| null,
            delay:    s.delay    || 0,
          },
          position_x: s.position_x ?? 0,
          position_y: s.position_y ?? 0,
        }));

        const inserted = await trx('flow_nodes').insert(nodePayloads).returning('*');
        inserted.forEach((n) => {
          if (n.data?.label) nodeIdMap[n.data.label] = n.id;
        });
      }

      if (edges.length > 0) {
        const edgePayloads = edges.map((e) => ({
          flow_id:         flowId,
          source_node_id:  nodeIdMap[e.from] || e.from,
          target_node_id:  nodeIdMap[e.to]   || e.to,
          source_handle:   e.source_handle   || null,
          condition_type:  e.condition?.operator || null,
          condition_value: e.condition?.value != null ? String(e.condition.value) : null,
        }));

        await trx('flow_edges').insert(edgePayloads);
      }

      await trx('flows').where({ id: flowId }).update({ updated_at: db.fn.now() });
      return await FlowModel.findWithGraph(flowId);
    });
  }

  async publishFlow(flowId) {
    await this.getFlow(flowId);
    return await FlowModel.publish(flowId);
  }

  async deleteFlow(flowId) {
    await this.getFlow(flowId);
    await FlowModel.remove(flowId);
    return true;
  }

  // ─────────────────────────────────────────────
  // Sessões
  // ─────────────────────────────────────────────

  async startFlowSession(flowId, userId) {
    const flow = await this.getFlowWithGraph(flowId);
    const engineFlow = this._toEngineFormat(flow);

    const sessionId = this._generateId();
    const startNodeId = engineFlow.states[0]?.id;
    if (!startNodeId) throw new Error('Fluxo não tem nenhum node');

    const engine = new FlowEngine(engineFlow);
    const result = await engine.run({
      currentNodeId: startNodeId,
      data: null,
      context: { userId, sessionId },
    });

    const session = {
      id: sessionId,
      flowId,
      userId,
      currentNodeId: result.nextNodeId,
      context: result.context,
      startedAt: new Date(),
      messages: result.responses || [],
    };

    flowSessions.set(sessionId, session);
    return { sessionId, responses: result.responses, context: result.context };
  }

  async processFlowInput(sessionId, userInput) {
    const session = flowSessions.get(sessionId);
    if (!session) throw new Error(`Sessão com ID ${sessionId} não encontrada`);

    const flow = await this.getFlowWithGraph(session.flowId);
    const engineFlow = this._toEngineFormat(flow);
    const engine = new FlowEngine(engineFlow);

    const result = await engine.run({
      currentNodeId: session.currentNodeId,
      data: userInput,
      context: session.context,
    });

    session.currentNodeId = result.nextNodeId;
    session.context = result.context;
    session.messages.push(...result.responses);
    session.updatedAt = new Date();
    flowSessions.set(sessionId, session);

    return {
      sessionId,
      responses: result.responses,
      context: result.context,
      isComplete: this._isFlowComplete(engineFlow, result.nextNodeId),
    };
  }

  async getFlowSession(sessionId) {
    const session = flowSessions.get(sessionId);
    if (!session) throw new Error(`Sessão com ID ${sessionId} não encontrada`);
    return session;
  }

  async endFlowSession(sessionId) {
    const session = await this.getFlowSession(sessionId);
    session.endedAt = new Date();
    flowSessions.set(sessionId, session);
    return session;
  }

  async getSessionStats(sessionId) {
    const session = await this.getFlowSession(sessionId);
    return {
      sessionId,
      flowId: session.flowId,
      userId: session.userId,
      duration: session.endedAt
        ? (session.endedAt - session.startedAt) / 1000 + 's'
        : (new Date() - session.startedAt) / 1000 + 's',
      messagesCount: session.messages.length,
      currentNode: session.currentNodeId,
      startedAt: session.startedAt,
      endedAt: session.endedAt || null,
    };
  }

  // ─────────────────────────────────────────────
  // Validação
  // ─────────────────────────────────────────────

  validateFlow(flowData) {
    const errors = [];
    if (!flowData.name || flowData.name.trim() === '')
      errors.push('Nome do fluxo é obrigatório');
    if (!Array.isArray(flowData.states) || flowData.states.length === 0)
      errors.push('Fluxo deve ter pelo menos um estado');
    if (!Array.isArray(flowData.edges))
      errors.push('Edges deve ser um array');

    const stateIds = (flowData.states || []).map((s) => s.id);
    for (const edge of flowData.edges || []) {
      if (!stateIds.includes(edge.from))
        errors.push(`Edge referencia nó inexistente: ${edge.from}`);
      if (!stateIds.includes(edge.to))
        errors.push(`Edge referencia nó inexistente: ${edge.to}`);
    }
    return { valid: errors.length === 0, errors };
  }

  // ─────────────────────────────────────────────
  // Helpers privados
  // ─────────────────────────────────────────────

  _toEngineFormat(flow) {
    const states = (flow.states || []).map((n) => ({
      id:   n.data?.label || n.id,
      type: toEngineType(n.type), // converte capture→input, menu→choice, etc.
      ...(n.data || {}),
    }));

    const edges = (flow.edges || []).map((e) => ({
      from:      e.from || e.source_node_id,
      to:        e.to   || e.target_node_id,
      condition: e.condition || null,
    }));

    return { ...flow, states, edges };
  }

  _isFlowComplete(flow, nodeId) {
    const node = flow.states.find((s) => s.id === nodeId);
    return node?.type === 'end' || !node;
  }

  _generateId() {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

module.exports = new FlowService();

const { FlowEngine } = require('./flow.engine');

class FlowService {
  constructor() {
    this.flows = new Map(); // Simula armazenamento em memória, pode ser substituído por BD
    this.flowSessions = new Map(); // Rastreia sessões ativas de fluxo
  }

  /**
   * Cria um novo fluxo
   * @param {Object} flowData - Dados do fluxo { name, description, states, edges }
   * @returns {Object} Fluxo criado com ID
   */
  async createFlow(flowData) {
    try {
      const id = this.generateId();
      const flow = {
        id,
        name: flowData.name,
        description: flowData.description || '',
        states: flowData.states || [],
        edges: flowData.edges || [],
        createdAt: new Date(),
        updatedAt: new Date(),
        active: true
      };

      this.flows.set(id, flow);
      return flow;
    } catch (error) {
      throw new Error(`Erro ao criar fluxo: ${error.message}`);
    }
  }

  /**
   * Obtém um fluxo pelo ID
   * @param {string} flowId - ID do fluxo
   * @returns {Object} Dados do fluxo
   */
  async getFlow(flowId) {
    try {
      const flow = this.flows.get(flowId);
      if (!flow) {
        throw new Error(`Fluxo com ID ${flowId} não encontrado`);
      }
      return flow;
    } catch (error) {
      throw new Error(`Erro ao buscar fluxo: ${error.message}`);
    }
  }

  /**
   * Lista todos os fluxos
   * @returns {Array} Array de fluxos
   */
  async listFlows() {
    try {
      return Array.from(this.flows.values());
    } catch (error) {
      throw new Error(`Erro ao listar fluxos: ${error.message}`);
    }
  }

  /**
   * Atualiza um fluxo existente
   * @param {string} flowId - ID do fluxo
   * @param {Object} updates - Dados para atualizar
   * @returns {Object} Fluxo atualizado
   */
  async updateFlow(flowId, updates) {
    try {
      const flow = this.flows.get(flowId);
      if (!flow) {
        throw new Error(`Fluxo com ID ${flowId} não encontrado`);
      }

      const updatedFlow = {
        ...flow,
        ...updates,
        id: flow.id, // Garante que ID não muda
        createdAt: flow.createdAt, // Garante que createdAt não muda
        updatedAt: new Date()
      };

      this.flows.set(flowId, updatedFlow);
      return updatedFlow;
    } catch (error) {
      throw new Error(`Erro ao atualizar fluxo: ${error.message}`);
    }
  }

  /**
   * Deleta um fluxo
   * @param {string} flowId - ID do fluxo
   * @returns {boolean} Sucesso da operação
   */
  async deleteFlow(flowId) {
    try {
      const deleted = this.flows.delete(flowId);
      if (!deleted) {
        throw new Error(`Fluxo com ID ${flowId} não encontrado`);
      }
      return true;
    } catch (error) {
      throw new Error(`Erro ao deletar fluxo: ${error.message}`);
    }
  }

  /**
   * Inicia uma sessão de fluxo para um usuário
   * @param {string} flowId - ID do fluxo
   * @param {string} userId - ID do usuário
   * @returns {Object} Sessão iniciada com resposta inicial
   */
  async startFlowSession(flowId, userId) {
    try {
      const flow = await this.getFlow(flowId);
      
      const sessionId = this.generateId();
      const startNodeId = flow.states[0]?.id || 'start';

      const engine = new FlowEngine(flow);
      const result = await engine.run({
        currentNodeId: startNodeId,
        data: null,
        context: { userId, sessionId }
      });

      const session = {
        id: sessionId,
        flowId,
        userId,
        currentNodeId: result.nextNodeId,
        context: result.context,
        startedAt: new Date(),
        messages: result.responses || []
      };

      this.flowSessions.set(sessionId, session);
      
      return {
        sessionId,
        responses: result.responses,
        context: result.context
      };
    } catch (error) {
      throw new Error(`Erro ao iniciar sessão de fluxo: ${error.message}`);
    }
  }

  /**
   * Processa uma entrada do usuário em uma sessão de fluxo
   * @param {string} sessionId - ID da sessão
   * @param {*} userInput - Entrada do usuário
   * @returns {Object} Resposta do fluxo
   */
  async processFlowInput(sessionId, userInput) {
    try {
      const session = this.flowSessions.get(sessionId);
      if (!session) {
        throw new Error(`Sessão com ID ${sessionId} não encontrada`);
      }

      const flow = await this.getFlow(session.flowId);
      const engine = new FlowEngine(flow);

      const result = await engine.run({
        currentNodeId: session.currentNodeId,
        data: userInput,
        context: session.context
      });

      // Atualiza a sessão com o novo estado
      session.currentNodeId = result.nextNodeId;
      session.context = result.context;
      session.messages.push(...result.responses);
      session.updatedAt = new Date();

      this.flowSessions.set(sessionId, session);

      return {
        sessionId,
        responses: result.responses,
        context: result.context,
        isComplete: this.isFlowComplete(flow, result.nextNodeId)
      };
    } catch (error) {
      throw new Error(`Erro ao processar entrada do fluxo: ${error.message}`);
    }
  }

  /**
   * Obtém informações de uma sessão de fluxo
   * @param {string} sessionId - ID da sessão
   * @returns {Object} Dados da sessão
   */
  async getFlowSession(sessionId) {
    try {
      const session = this.flowSessions.get(sessionId);
      if (!session) {
        throw new Error(`Sessão com ID ${sessionId} não encontrada`);
      }
      return session;
    } catch (error) {
      throw new Error(`Erro ao buscar sessão: ${error.message}`);
    }
  }

  /**
   * Encerra uma sessão de fluxo
   * @param {string} sessionId - ID da sessão
   * @returns {Object} Dados da sessão finalizada
   */
  async endFlowSession(sessionId) {
    try {
      const session = this.flowSessions.get(sessionId);
      if (!session) {
        throw new Error(`Sessão com ID ${sessionId} não encontrada`);
      }

      session.endedAt = new Date();
      this.flowSessions.set(sessionId, session);
      
      return session;
    } catch (error) {
      throw new Error(`Erro ao encerrar sessão: ${error.message}`);
    }
  }

  /**
   * Verifica se um fluxo foi completado
   * @param {Object} flow - Dados do fluxo
   * @param {string} nodeId - ID do nó atual
   * @returns {boolean} True se o fluxo está completo
   */
  isFlowComplete(flow, nodeId) {
    const node = flow.states.find(state => state.id === nodeId);
    return node?.type === 'end' || !node;
  }

  /**
   * Gera um ID único
   * @returns {string} ID gerado
   */
  generateId() {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Obtém estatísticas de uma sessão
   * @param {string} sessionId - ID da sessão
   * @returns {Object} Estatísticas da sessão
   */
  async getSessionStats(sessionId) {
    try {
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
        endedAt: session.endedAt || null
      };
    } catch (error) {
      throw new Error(`Erro ao obter estatísticas: ${error.message}`);
    }
  }

  /**
   * Valida a estrutura de um fluxo
   * @param {Object} flowData - Dados do fluxo para validar
   * @returns {Object} Resultado da validação
   */
  validateFlow(flowData) {
    const errors = [];

    if (!flowData.name || flowData.name.trim() === '') {
      errors.push('Nome do fluxo é obrigatório');
    }

    if (!Array.isArray(flowData.states) || flowData.states.length === 0) {
      errors.push('Fluxo deve ter pelo menos um estado');
    }

    if (!Array.isArray(flowData.edges)) {
      errors.push('Edges deve ser um array');
    }

    // Valida se cada edge referencia nós existentes
    const stateIds = flowData.states.map(s => s.id);
    for (const edge of flowData.edges) {
      if (!stateIds.includes(edge.from)) {
        errors.push(`Edge referencia nó inexistente: ${edge.from}`);
      }
      if (!stateIds.includes(edge.to)) {
        errors.push(`Edge referencia nó inexistente: ${edge.to}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

module.exports = new FlowService();

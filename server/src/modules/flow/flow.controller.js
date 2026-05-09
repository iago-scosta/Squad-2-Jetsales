const flowservice = require('./flow.service');

class FlowController {
  /**
   * Cria um novo fluxo
   * POST /api/flow
   */
  async createFlow(req, res) {
    try {
      const { name, description, states, edges } = req.body;

      // Valida dados de entrada
      if (!name || name.trim() === '') {
        return res.status(400).json({ 
          error: 'Nome do fluxo é obrigatório' 
        });
      }

      // Valida estrutura do fluxo
      const validation = flowservice.validateFlow({
        name,
        description,
        states: states || [],
        edges: edges || []
      });

      if (!validation.valid) {
        return res.status(400).json({ 
          error: 'Fluxo inválido',
          details: validation.errors 
        });
      }

      const flow = await flowservice.createFlow({
        name,
        description,
        states,
        edges
      });

      res.status(201).json({
        success: true,
        data: flow
      });
    } catch (error) {
      res.status(500).json({ 
        error: error.message 
      });
    }
  }

  /**
   * Obtém um fluxo pelo ID
   * GET /api/flow/:flowId
   */
  async getFlow(req, res) {
    try {
      const { flowId } = req.params;

      const flow = await flowservice.getFlow(flowId);

      res.json({
        success: true,
        data: flow
      });
    } catch (error) {
      res.status(404).json({ 
        error: error.message 
      });
    }
  }

  /**
   * Lista todos os fluxos
   * GET /api/flow
   */
  async listflows(req, res) {
    try {
      const flows = await flowservice.listFlows();

      res.json({
        success: true,
        data: flows,
        count: flows.length
      });
    } catch (error) {
      res.status(500).json({ 
        error: error.message 
      });
    }
  }

  /**
   * Atualiza um fluxo
   * PUT /api/flow/:flowId
   */
  async updateFlow(req, res) {
    try {
      const { flowId } = req.params;
      const { name, description, states, edges, active } = req.body;

      // Valida estrutura do fluxo atualizado se states/edges forem fornecidos
      if (states || edges) {
        const currentFlow = await flowservice.getFlow(flowId);
        const validation = flowservice.validateFlow({
          name: name || currentFlow.name,
          description: description || currentFlow.description,
          states: states || currentFlow.states,
          edges: edges || currentFlow.edges
        });

        if (!validation.valid) {
          return res.status(400).json({ 
            error: 'Fluxo inválido',
            details: validation.errors 
          });
        }
      }

      const updates = {};
      if (name !== undefined) updates.name = name;
      if (description !== undefined) updates.description = description;
      if (states !== undefined) updates.states = states;
      if (edges !== undefined) updates.edges = edges;
      if (active !== undefined) updates.active = active;

      const flow = await flowservice.updateFlow(flowId, updates);

      res.json({
        success: true,
        data: flow
      });
    } catch (error) {
      res.status(500).json({ 
        error: error.message 
      });
    }
  }

  /**
   * Deleta um fluxo
   * DELETE /api/flow/:flowId
   */
  async deleteFlow(req, res) {
    try {
      const { flowId } = req.params;

      await flowservice.deleteFlow(flowId);

      res.json({
        success: true,
        message: 'Fluxo deletado com sucesso'
      });
    } catch (error) {
      res.status(404).json({ 
        error: error.message 
      });
    }
  }

  /**
   * Inicia uma sessão de fluxo
   * POST /api/flow/:flowId/sessions
   */
  async startSession(req, res) {
    try {
      const { flowId } = req.params;
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ 
          error: 'ID do usuário é obrigatório' 
        });
      }

      const session = await flowservice.startFlowSession(flowId, userId);

      res.status(201).json({
        success: true,
        data: session
      });
    } catch (error) {
      res.status(500).json({ 
        error: error.message 
      });
    }
  }

  /**
   * Processa uma entrada de usuário em uma sessão
   * POST /api/flow/sessions/:sessionId/input
   */
  async processInput(req, res) {
    try {
      const { sessionId } = req.params;
      const { input } = req.body;

      if (input === undefined || input === null) {
        return res.status(400).json({ 
          error: 'Input do usuário é obrigatório' 
        });
      }

      const result = await flowservice.processFlowInput(sessionId, input);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({ 
        error: error.message 
      });
    }
  }

  /**
   * Obtém informações de uma sessão
   * GET /api/flow/sessions/:sessionId
   */
  async getSession(req, res) {
    try {
      const { sessionId } = req.params;

      const session = await flowservice.getFlowSession(sessionId);

      res.json({
        success: true,
        data: session
      });
    } catch (error) {
      res.status(404).json({ 
        error: error.message 
      });
    }
  }

  /**
   * Encerra uma sessão
   * POST /api/flow/sessions/:sessionId/end
   */
  async endSession(req, res) {
    try {
      const { sessionId } = req.params;

      const session = await flowservice.endFlowSession(sessionId);

      res.json({
        success: true,
        data: session
      });
    } catch (error) {
      res.status(500).json({ 
        error: error.message 
      });
    }
  }

  /**
   * Obtém estatísticas de uma sessão
   * GET /api/flow/sessions/:sessionId/stats
   */
  async getSessionStats(req, res) {
    try {
      const { sessionId } = req.params;

      const stats = await flowservice.getSessionStats(sessionId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({ 
        error: error.message 
      });
    }
  }

  /**
   * Valida um fluxo
   * POST /api/flow/validate
   */
  async validateFlow(req, res) {
    try {
      const { name, description, states, edges } = req.body;

      const validation = flowservice.validateFlow({
        name,
        description,
        states,
        edges
      });

      res.json({
        success: true,
        data: validation
      });
    } catch (error) {
      res.status(500).json({ 
        error: error.message 
      });
    }
  }
}

module.exports = new FlowController();

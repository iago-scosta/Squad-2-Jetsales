const flowService = require('./flow.service');

class FlowController {
  // POST /api/flows
  async createFlow(req, res) {
    try {
      const { name, description, chatbotId, states, edges } = req.body;

      if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'Nome do fluxo é obrigatório' });
      }

      const validation = flowService.validateFlow({
        name,
        states: states || [],
        edges: edges || [],
      });

      if (!validation.valid) {
        return res.status(400).json({ error: 'Fluxo inválido', details: validation.errors });
      }

      const flow = await flowService.createFlow({ name, description, chatbotId, states, edges });

      res.status(201).json({ success: true, data: flow });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/flows
  async listFlows(req, res) {
    try {
      const { chatbotId } = req.query;
      const flows = await flowService.listFlows({ chatbotId });
      res.json({ success: true, data: flows, count: flows.length });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/flows/:flowId
  async getFlow(req, res) {
    try {
      const flow = await flowService.getFlowWithGraph(req.params.flowId);
      res.json({ success: true, data: flow });
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  // PUT /api/flows/:flowId
  async updateFlow(req, res) {
    try {
      const { name, description, status, chatbotId } = req.body;
      const flow = await flowService.updateFlow(req.params.flowId, {
        name, description, status, chatbot_id: chatbotId,
      });
      res.json({ success: true, data: flow });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // PUT /api/flows/:flowId/graph — substitui nodes + edges inteiros
  async replaceGraph(req, res) {
    try {
      const { states, edges } = req.body;

      const validation = flowService.validateFlow({
        name: 'graph-replace',
        states: states || [],
        edges: edges || [],
      });

      if (!validation.valid) {
        return res.status(400).json({ error: 'Grafo inválido', details: validation.errors });
      }

      const flow = await flowService.replaceGraph(req.params.flowId, { states, edges });
      res.json({ success: true, data: flow });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // POST /api/flows/:flowId/publish
  async publishFlow(req, res) {
    try {
      const flow = await flowService.publishFlow(req.params.flowId);
      res.json({ success: true, data: flow });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // DELETE /api/flows/:flowId
  async deleteFlow(req, res) {
    try {
      await flowService.deleteFlow(req.params.flowId);
      res.json({ success: true, message: 'Fluxo deletado com sucesso' });
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  // POST /api/flows/validate
  async validateFlow(req, res) {
    try {
      const { name, states, edges } = req.body;
      const validation = flowService.validateFlow({ name, states, edges });
      res.json({ success: true, data: validation });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // ── Sessões ──────────────────────────────────────

  // POST /api/flows/:flowId/sessions
  async startSession(req, res) {
    try {
      const { userId } = req.body;
      if (!userId) return res.status(400).json({ error: 'ID do usuário é obrigatório' });

      const session = await flowService.startFlowSession(req.params.flowId, userId);
      res.status(201).json({ success: true, data: session });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // POST /api/flows/sessions/:sessionId/input
  async processInput(req, res) {
    try {
      const { input } = req.body;
      if (input === undefined || input === null) {
        return res.status(400).json({ error: 'Input do usuário é obrigatório' });
      }
      const result = await flowService.processFlowInput(req.params.sessionId, input);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/flows/sessions/:sessionId
  async getSession(req, res) {
    try {
      const session = await flowService.getFlowSession(req.params.sessionId);
      res.json({ success: true, data: session });
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  // GET /api/flows/sessions/:sessionId/stats
  async getSessionStats(req, res) {
    try {
      const stats = await flowService.getSessionStats(req.params.sessionId);
      res.json({ success: true, data: stats });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // POST /api/flows/sessions/:sessionId/end
  async endSession(req, res) {
    try {
      const session = await flowService.endFlowSession(req.params.sessionId);
      res.json({ success: true, data: session });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new FlowController();

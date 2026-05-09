// motor de fluxo baseado em grafo
// execução de nodes por tipo (input, message, choice, api, set)
// contexto persistente entre chamadas
// interpolação de variáveis ({{name}})
// limite de segurança contra loop infinito

class FlowEngine {
  constructor(flow) {
    this.flow = flow;
    this.edges = flow.edges;
    this.states = flow.states;
  }

  // executa o fluxo a partir do nó atual
  async run({ currentNodeId, data, context = {} }) {
    this.context = context;

    let node = this.getNode(currentNodeId);
    let nextNodeId = currentNodeId;
    const responses = [];
    let safety = 0;

    while (node.type !== 'input' && safety < 20) {
      await this.executeNode(node, data);

      const response = this.buildResponse(node);
      if (response.message) {
        responses.push(response);
      }

      nextNodeId = this.getNextNodeId(node.id, data);
      node = this.getNode(nextNodeId);
      safety++;
    }

    if (safety === 20) {
      throw new Error('Limite de segurança atingido, possível loop infinito');
    }

    return {
      responses,
      context: this.context,
      nextNodeId,
    };
  }

  getNode(nodeId) {
    const node = this.states.find((state) => state.id === nodeId);
    if (!node) {
      throw new Error(`Node with id ${nodeId} not found`);
    }
    return node;
  }

  // pega o próximo nó com base nas edges do nó atual
  getNextNodeId(currentNodeId, userInput) {
    const possibleEdges = this.edges.filter((edge) => edge.from === currentNodeId);

    for (const edge of possibleEdges) {
      if (this.evaluateCondition(edge.condition, userInput)) {
        return edge.to;
      }
    }
    // sem transição válida: permanece no mesmo nó
    return currentNodeId;
  }

  evaluateCondition(condition, input) {
    if (!condition) return true;
    if (input == null) return false;

    if (typeof condition === 'function') {
      return condition(input, this.context);
    }
    if (typeof condition === 'string') {
      return String(input).toLowerCase().includes(condition.toLowerCase());
    }
    return false;
  }

  buildResponse(node) {
    let message = node.message || null;
    if (message) {
      message = message.replace(/\{\{(\w+)\}\}/g, (_, key) => {
        return this.context[key.trim()] || `{{${key}}}`;
      });
    }
    return {
      message,
      options: node.options || null,
      delay: node.delay || 0,
    };
  }

  async executeNode(node, input) {
    if (!node) return;

    switch (node.type) {
      case 'input':
        if (node.variable) {
          this.context[node.variable] = input;
        }
        break;

      case 'message':
        // resposta é construída em buildResponse
        break;

      case 'choice':
        // se o input bater com uma das opções, salva no contexto.
        // o roteamento real é feito pelas edges via getNextNodeId.
        if (Array.isArray(node.options) && input != null && node.variable) {
          const matched = node.options.find((opt) => {
            const value = typeof opt === 'string' ? opt : opt.value;
            return String(value).toLowerCase() === String(input).toLowerCase();
          });
          if (matched) {
            this.context[node.variable] =
              typeof matched === 'string' ? matched : matched.value;
          }
        }
        break;

      case 'api':
        if (node.url && node.saveAs) {
          const response = await fetch(node.url);
          const data = await response.json();
          this.context[node.saveAs] = data;
        }
        break;

      case 'set':
        this.context[node.key] = node.value;
        break;

      default:
        console.warn(`Unknown node type: ${node.type}`);
        break;
    }
  }
}

module.exports = { FlowEngine };

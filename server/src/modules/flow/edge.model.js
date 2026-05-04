/**
 * Modelo de Aresta (Edge) do Fluxo
 * Representa uma transição entre nós
 */

class Edge {
  constructor(data) {
    this.from = data.from;
    this.to = data.to;
    this.condition = data.condition || null;
    this.label = data.label || null;
  }

  /**
   * Valida se a aresta tem todos os campos obrigatórios
   * @returns {Object} { valid: boolean, errors: Array }
   */
  validate() {
    const errors = [];

    if (!this.from || this.from.trim() === '') {
      errors.push('Campo "from" é obrigatório em Edge');
    }

    if (!this.to || this.to.trim() === '') {
      errors.push('Campo "to" é obrigatório em Edge');
    }

    if (this.from === this.to) {
      console.warn(`Aresta com mesmo nó de origem e destino: ${this.from}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Avalia se a condição da aresta é atendida
   * @param {*} input - Entrada do usuário
   * @param {Object} context - Contexto da sessão
   * @returns {boolean} True se a condição é atendida
   */
  evaluateCondition(input, context = {}) {
    // Se não houver condição, sempre retorna true
    if (!this.condition) {
      return true;
    }

    // Se for uma função, executa com input e contexto
    if (typeof this.condition === 'function') {
      return this.condition(input, context);
    }

    // Se for string, compara com o input
    if (typeof this.condition === 'string') {
      if (input === null || input === undefined) {
        return false;
      }
      return input.toString().toLowerCase().includes(this.condition.toLowerCase());
    }

    // Se for um objeto com operadores, avalia
    if (typeof this.condition === 'object') {
      return this.evaluateComplexCondition(this.condition, input, context);
    }

    return false;
  }

  /**
   * Avalia condições complexas com operadores
   * @param {Object} condition - Objeto com operadores
   * @param {*} input - Entrada do usuário
   * @param {Object} context - Contexto da sessão
   * @returns {boolean}
   */
  evaluateComplexCondition(condition, input, context) {
    // Exemplo: { operator: 'equals', value: 'sim' }
    if (condition.operator && condition.value !== undefined) {
      switch (condition.operator) {
        case 'equals':
          return input === condition.value;
        case 'notEquals':
          return input !== condition.value;
        case 'includes':
          return String(input).includes(String(condition.value));
        case 'gt':
          return Number(input) > Number(condition.value);
        case 'lt':
          return Number(input) < Number(condition.value);
        case 'gte':
          return Number(input) >= Number(condition.value);
        case 'lte':
          return Number(input) <= Number(condition.value);
        case 'regex':
          return new RegExp(condition.value).test(String(input));
        default:
          return false;
      }
    }

    return false;
  }

  /**
   * Converte a aresta para JSON
   */
  toJSON() {
    return {
      from: this.from,
      to: this.to,
      condition: this.condition,
      label: this.label
    };
  }

  /**
   * Cria uma instância de Edge a partir de um objeto
   */
  static fromObject(data) {
    return new Edge(data);
  }
}

module.exports = {
  Edge
};

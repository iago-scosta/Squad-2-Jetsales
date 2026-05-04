/**
 * Modelo de Nó (Estado) do Fluxo
 * Representa um ponto no fluxo de conversa
 */

const NODE_TYPES = {
  MESSAGE: 'message',    // Envia uma mensagem ao usuário
  INPUT: 'input',        // Recebe entrada do usuário
  CHOICE: 'choice',      // Apresenta opções para escolher
  API: 'api',            // Faz uma chamada à API
  SET: 'set',            // Define valores no contexto
  END: 'end',            // Encerra o fluxo
  CONDITION: 'condition' // Avalia uma condição
};

class Node {
  constructor(data) {
    this.id = data.id;
    this.type = data.type;
    this.message = data.message || null;
    this.variable = data.variable || null;
    this.options = data.options || null;
    this.delay = data.delay || 0;
    this.url = data.url || null;
    this.saveAs = data.saveAs || null;
    this.key = data.key || null;
    this.value = data.value || null;
    this.condition = data.condition || null;
  }

  /**
   * Valida se o nó tem todos os campos obrigatórios
   * @returns {Object} { valid: boolean, errors: Array }
   */
  validate() {
    const errors = [];

    if (!this.id || this.id.trim() === '') {
      errors.push('ID do nó é obrigatório');
    }

    if (!this.type || !Object.values(NODE_TYPES).includes(this.type)) {
      errors.push(`Tipo de nó inválido: ${this.type}`);
    }

    switch (this.type) {
      case NODE_TYPES.MESSAGE:
        if (!this.message) {
          errors.push('Nó MESSAGE deve ter um message');
        }
        break;

      case NODE_TYPES.INPUT:
        if (!this.variable) {
          errors.push('Nó INPUT deve ter um variable');
        }
        break;

      case NODE_TYPES.API:
        if (!this.url) {
          errors.push('Nó API deve ter um url');
        }
        if (!this.saveAs) {
          errors.push('Nó API deve ter um saveAs');
        }
        break;

      case NODE_TYPES.SET:
        if (!this.key) {
          errors.push('Nó SET deve ter um key');
        }
        break;

      case NODE_TYPES.CHOICE:
        if (!Array.isArray(this.options) || this.options.length === 0) {
          errors.push('Nó CHOICE deve ter options');
        }
        break;
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Converte o nó para JSON
   */
  toJSON() {
    return {
      id: this.id,
      type: this.type,
      message: this.message,
      variable: this.variable,
      options: this.options,
      delay: this.delay,
      url: this.url,
      saveAs: this.saveAs,
      key: this.key,
      value: this.value,
      condition: this.condition
    };
  }

  /**
   * Cria uma instância de Node a partir de um objeto
   */
  static fromObject(data) {
    return new Node(data);
  }
}

module.exports = {
  Node,
  NODE_TYPES
};

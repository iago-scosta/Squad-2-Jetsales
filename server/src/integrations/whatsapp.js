function normalizePhone(phone) {
  return String(phone || "").replace(/\D/g, "");
}

function buildFakeWhatsappReply(message, flowReply) {
  if (flowReply) {
    return flowReply;
  }

  const text = String(message || "").toLowerCase();

  if (text.includes("preco") || text.includes("valor")) {
    return "Recebemos sua pergunta sobre preco. Nosso time comercial pode continuar esse atendimento.";
  }

  if (text.includes("suporte")) {
    return "Entendi que voce precisa de suporte. Vamos registrar o atendimento e seguir por aqui.";
  }

  return "Ola! Recebemos sua mensagem e vamos continuar esse atendimento no ambiente de demonstracao.";
}

module.exports = {
  normalizePhone,
  buildFakeWhatsappReply,
};

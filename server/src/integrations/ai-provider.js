function buildFakeAiResponse(message) {
  const text = String(message || "").toLowerCase();

  if (text.includes("preco") || text.includes("valor")) {
    return "Resposta simulada da IA para ambiente academico.";
  }

  if (text.includes("suporte")) {
    return "Resposta simulada da IA para ambiente academico.";
  }

  return "Resposta simulada da IA para ambiente academico.";
}

module.exports = {
  buildFakeAiResponse,
};

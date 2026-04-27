function getInitialNode(nodes, edges) {
  if (!nodes.length) {
    return null;
  }

  const targetNodeIds = new Set(edges.map((edge) => edge.target_node_id));

  return nodes.find((node) => !targetNodeIds.has(node.id)) || nodes[0];
}

function previewFirstMessage(nodes, edges) {
  const initialNode = getInitialNode(nodes, edges);

  if (!initialNode || initialNode.type !== "message") {
    return null;
  }

  if (
    !initialNode.data ||
    typeof initialNode.data.text !== "string" ||
    !initialNode.data.text.trim()
  ) {
    return null;
  }

  return initialNode.data.text.trim();
}

function buildFakeResponse(message) {
  return `Ola! Recebemos sua mensagem: ${message}. Em breve o fluxo real sera executado.`;
}

module.exports = {
  getInitialNode,
  previewFirstMessage,
  buildFakeResponse,
};

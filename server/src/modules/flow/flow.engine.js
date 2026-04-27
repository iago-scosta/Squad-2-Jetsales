function getStartNode(nodes) {
  if (!Array.isArray(nodes) || nodes.length === 0) {
    return null;
  }

  return nodes.find((node) => node.type === "start") || nodes[0];
}

function readNodeMessage(node) {
  if (!node || !node.data || typeof node.data !== "object") {
    return null;
  }

  if (typeof node.data.text === "string" && node.data.text.trim()) {
    return node.data.text.trim();
  }

  if (typeof node.data.prompt === "string" && node.data.prompt.trim()) {
    return node.data.prompt.trim();
  }

  return null;
}

function matchesCondition(edge, message) {
  if (!edge.condition_type || edge.condition_value === null) {
    return true;
  }

  const text = String(message || "").trim().toLowerCase();
  const expected = String(edge.condition_value).trim().toLowerCase();

  if (!expected) {
    return true;
  }

  if (edge.condition_type === "equals") {
    return text === expected;
  }

  if (edge.condition_type === "contains") {
    return text.includes(expected);
  }

  return true;
}

function pickNextEdge(currentNode, edges, message) {
  const outgoingEdges = edges.filter(
    (edge) => edge.source_node_id === currentNode.id
  );

  if (outgoingEdges.length === 0) {
    return null;
  }

  return outgoingEdges.find((edge) => matchesCondition(edge, message)) || outgoingEdges[0];
}

function runFlow({ nodes, edges, message, maxSteps = 15 }) {
  let currentNode = getStartNode(nodes);
  let steps = 0;

  while (currentNode && steps < maxSteps) {
    steps += 1;

    if (
      currentNode.type === "message" ||
      currentNode.type === "input" ||
      currentNode.type === "end"
    ) {
      return {
        node: currentNode,
        response:
          readNodeMessage(currentNode) || "Fluxo encontrado, mas sem mensagem configurada.",
      };
    }

    const nextEdge = pickNextEdge(currentNode, edges, message);

    if (!nextEdge) {
      return null;
    }

    currentNode = nodes.find((node) => node.id === nextEdge.target_node_id) || null;
  }

  return null;
}

module.exports = {
  getStartNode,
  runFlow,
};

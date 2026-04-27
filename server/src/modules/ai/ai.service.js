const { buildFakeAiResponse } = require("../../integrations/ai-provider");
const {
  validateRequiredId,
  validateRequiredText,
} = require("../../utils/validation");
const conversationService = require("../conversation/conversation.service");

async function respond(data) {
  const conversationId = validateRequiredId(
    data.conversation_id,
    "conversation_id"
  );
  const message = validateRequiredText(data.message, "message");
  const response = buildFakeAiResponse(message);

  await conversationService.findOne(conversationId);
  await conversationService.createMessage(conversationId, {
    direction: "out",
    content: response,
    metadata: {
      source: "fake-ai",
    },
  });

  return {
    response,
    fallback_used: false,
  };
}

module.exports = {
  respond,
};

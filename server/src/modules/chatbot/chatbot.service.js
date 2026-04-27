const createHttpError = require("../../utils/http-error");
const {
  validateRequiredText,
  validateOptionalText,
  validateOptionalBoolean,
  validateRequiredUuid,
} = require("../../utils/validation");
const chatbotRepository = require("./chatbot.repository");

async function findOne(id) {
  const chatbotId = validateRequiredUuid(id, "id");
  const chatbot = await chatbotRepository.findById(chatbotId);

  if (!chatbot) {
    throw createHttpError(404, "chatbot nao encontrado");
  }

  return chatbot;
}

async function create(data) {
  const name = validateRequiredText(data.name, "name");
  const organizationId = validateRequiredText(
    data.organization_id,
    "organization_id"
  );
  const type = validateOptionalText(data.type, "type") || "whatsapp";

  return chatbotRepository.create({
    name,
    organization_id: organizationId,
    type,
    is_active: true,
  });
}

async function findAll() {
  return chatbotRepository.findAll();
}

async function update(id, data) {
  const chatbot = await findOne(id);
  const nextData = {
    organization_id:
      data.organization_id !== undefined
        ? validateRequiredText(data.organization_id, "organization_id")
        : chatbot.organization_id,
    name:
      data.name !== undefined
        ? validateRequiredText(data.name, "name")
        : chatbot.name,
    type:
      data.type !== undefined
        ? validateRequiredText(data.type, "type")
        : chatbot.type,
    is_active:
      data.is_active !== undefined
        ? validateOptionalBoolean(data.is_active, "is_active")
        : chatbot.is_active,
  };

  return chatbotRepository.update(chatbot.id, nextData);
}

async function remove(id) {
  const chatbot = await findOne(id);

  await chatbotRepository.remove(chatbot.id);

  return chatbot;
}

module.exports = {
  create,
  findAll,
  findOne,
  update,
  remove,
};

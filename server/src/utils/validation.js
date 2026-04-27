const createHttpError = require("./http-error");

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function validateRequiredText(value, fieldName) {
  if (typeof value !== "string" || !value.trim()) {
    throw createHttpError(400, `${fieldName} e obrigatorio`);
  }

  return value.trim();
}

function validateOptionalText(value, fieldName) {
  if (value === undefined) {
    return undefined;
  }

  return validateRequiredText(value, fieldName);
}

function validateRequiredUuid(value, fieldName) {
  const text = validateRequiredText(value, fieldName);

  if (!uuidPattern.test(text)) {
    throw createHttpError(400, `${fieldName} invalido`);
  }

  return text;
}

function validateOptionalBoolean(value, fieldName) {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "boolean") {
    throw createHttpError(400, `${fieldName} precisa ser booleano`);
  }

  return value;
}

function validateRequiredObject(value, fieldName) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw createHttpError(400, `${fieldName} e obrigatorio`);
  }

  return value;
}

function validateOptionalInteger(value, fieldName, defaultValue) {
  if (value === undefined) {
    return defaultValue;
  }

  if (!Number.isInteger(value)) {
    throw createHttpError(400, `${fieldName} precisa ser numerico`);
  }

  return value;
}

module.exports = {
  validateRequiredText,
  validateOptionalText,
  validateRequiredUuid,
  validateOptionalBoolean,
  validateRequiredObject,
  validateOptionalInteger,
};

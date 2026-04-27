const createHttpError = require("./http-error");

function validationError(message) {
  return createHttpError(400, message, "VALIDATION_ERROR");
}

function validateRequiredText(value, fieldName) {
  if (typeof value !== "string" || !value.trim()) {
    throw validationError(`${fieldName} e obrigatorio`);
  }

  return value.trim();
}

function validateOptionalText(value, fieldName) {
  if (value === undefined) {
    return undefined;
  }

  return validateRequiredText(value, fieldName);
}

function validateRequiredEnum(value, allowedValues, fieldName) {
  const text = validateRequiredText(value, fieldName);

  if (!allowedValues.includes(text)) {
    throw validationError(
      `${fieldName} precisa ser um destes valores: ${allowedValues.join(", ")}`
    );
  }

  return text;
}

function validateOptionalEnum(value, allowedValues, fieldName) {
  if (value === undefined) {
    return undefined;
  }

  return validateRequiredEnum(value, allowedValues, fieldName);
}

function validateOptionalBoolean(value, fieldName) {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "boolean") {
    throw validationError(`${fieldName} precisa ser booleano`);
  }

  return value;
}

function validateRequiredObject(value, fieldName) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw validationError(`${fieldName} e obrigatorio`);
  }

  return value;
}

function validateOptionalObject(value, fieldName, defaultValue = undefined) {
  if (value === undefined) {
    return defaultValue;
  }

  return validateRequiredObject(value, fieldName);
}

function validateOptionalInteger(value, fieldName, defaultValue) {
  if (value === undefined) {
    return defaultValue;
  }

  if (!Number.isInteger(value)) {
    throw validationError(`${fieldName} precisa ser numerico`);
  }

  return value;
}

function validateRequiredId(value, fieldName) {
  return validateRequiredText(value, fieldName);
}

module.exports = {
  validateRequiredText,
  validateOptionalText,
  validateRequiredEnum,
  validateOptionalEnum,
  validateOptionalBoolean,
  validateRequiredObject,
  validateOptionalObject,
  validateOptionalInteger,
  validateRequiredId,
  validationError,
};

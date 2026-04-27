function errorMiddleware(error, req, res, next) {
  const statusCode = Number.isInteger(error.statusCode)
    ? error.statusCode
    : Number.isInteger(error.status)
      ? error.status
      : 500;
  const message =
    statusCode >= 500
      ? "Erro interno do servidor"
      : error.message || "Erro ao processar a requisicao";
  let code = error.code;

  if (!code) {
    if (statusCode === 400) {
      code = "VALIDATION_ERROR";
    } else if (statusCode === 404) {
      code = "NOT_FOUND";
    } else {
      code = "INTERNAL_ERROR";
    }
  }

  if (statusCode === 500) {
    console.error(error);
  }

  res.status(statusCode).json({
    error: {
      message,
      code,
    },
  });
}

module.exports = errorMiddleware;

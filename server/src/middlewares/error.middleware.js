function errorMiddleware(error, req, res, next) {
  const statusCode = error.statusCode || 500;
  const message =
    error.expose || statusCode < 500
      ? error.message || "erro inesperado"
      : "erro interno do servidor";

  if (statusCode === 500) {
    console.error(error);
  }

  res.status(statusCode).json({ erro: message });
}

module.exports = errorMiddleware;

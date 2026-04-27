function errorMiddleware(error, req, res, next) {
  const statusCode = error.statusCode || 500;
  const message =
    statusCode === 500
      ? "erro interno do servidor"
      : error.message || "erro inesperado";

  if (statusCode === 500) {
    console.error(error);
  }

  res.status(statusCode).json({ erro: message });
}

module.exports = errorMiddleware;

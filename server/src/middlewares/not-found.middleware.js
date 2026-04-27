const createHttpError = require("../utils/http-error");

function notFoundMiddleware(req, res, next) {
  next(createHttpError(404, "rota nao encontrada"));
}

module.exports = notFoundMiddleware;

function errorMiddleware(err, req, res, next) {
  console.error(err.stack);

  const statusCode = err.statusCode || 500;

  const message = err.message || "An internal server error occurred.";

  res.status(statusCode).json({
    status: "error",
    statusCode,
    message,
  });
}

module.exports = errorMiddleware;
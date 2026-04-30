const AppError = require("./appError");

module.exports = (err, req, res, next) => {
  // Mongoose validation errors
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
    err = new AppError(message, 400);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    err = new AppError(`${field} already exists`, 409);
  }

  const statusCode = err.statusCode || 500;
  const status = err.statusCode && err.statusCode < 500 ? 'fail' : 'error';

  res.status(statusCode).json({
    status,
    message: err.message || "Internal Server Error"
  });
};
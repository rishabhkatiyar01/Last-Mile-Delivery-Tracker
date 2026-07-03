const ApiError = require('../utils/ApiError');

const errorHandler = (err, req, res, next) => {
  console.error('ERROR LOGGED:', err);
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || error instanceof Error ? 400 : 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, false, err.stack);
  }

  const response = {
    success: false,
    message: error.message,
    errors: error.errors || [],
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  res.status(error.statusCode || 500).json(response);
};

module.exports = errorHandler;

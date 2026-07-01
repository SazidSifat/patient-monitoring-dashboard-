function validateSensorData(req, res, next) {
  if (!req.body || Object.keys(req.body).length === 0) {
    const error = new Error('No data provided');
    error.status = 400;
    return next(error);
  }
  next();
}

function errorHandler(err, req, res, next) {
  console.error(`[Error Handler] ${err.message}`);
  
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Internal Server Error'
  });
}

module.exports = {
  validateSensorData,
  errorHandler
};

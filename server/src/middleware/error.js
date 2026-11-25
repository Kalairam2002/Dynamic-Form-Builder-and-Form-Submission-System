const { HttpError } = require('../utils/errors');

function notFound(req, res, next) {
  next(new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

// Express only treats this as an error handler because it takes 4 arguments, so keep `next`.
function errorHandler(err, req, res, next) {
  if (err instanceof HttpError) {
    const body = { message: err.message };
    if (err.errors) body.errors = err.errors;
    return res.status(err.status).json(body);
  }

  // Thrown by express.json() for malformed or oversized bodies.
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Request body is not valid JSON' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Request body is too large' });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid id' });
  }
  if (err.code === 11000) {
    return res.status(409).json({ message: 'A record with this value already exists' });
  }

  console.error(err);
  res.status(500).json({ message: 'Something went wrong, please try again later' });
}

module.exports = { notFound, errorHandler };

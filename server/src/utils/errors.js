class HttpError extends Error {
  constructor(status, message, errors) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

// Passes rejected promises to the error middleware, so controllers don't need try/catch.
function catchAsync(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

module.exports = { HttpError, catchAsync };

const rateLimit = require('express-rate-limit');

function createLimiter(windowMs, limit, message, extraOptions = {}) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { message },
    ...extraOptions,
  });
}

const generalLimiter = createLimiter(
  15 * 60 * 1000,
  300,
  'Too many requests, please try again in a few minutes'
);

// Only failed attempts count, so a user who logs in normally is never blocked.
const loginLimiter = createLimiter(
  15 * 60 * 1000,
  10,
  'Too many login attempts, please try again in 15 minutes',
  { skipSuccessfulRequests: true }
);

const submissionLimiter = createLimiter(
  60 * 1000,
  10,
  'You are submitting too quickly, please wait a minute and try again'
);

module.exports = { generalLimiter, loginLimiter, submissionLimiter };

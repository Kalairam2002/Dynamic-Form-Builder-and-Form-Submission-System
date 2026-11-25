const jwt = require('jsonwebtoken');
const { HttpError } = require('../utils/errors');

function readToken(req) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  return token;
}

function verifyToken(token) {
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return { id: payload.sub, role: payload.role };
  } catch {
    return null;
  }
}

function requireAuth(req, res, next) {
  const token = readToken(req);
  if (!token) return next(new HttpError(401, 'Please log in to continue'));

  const user = verifyToken(token);
  if (!user) return next(new HttpError(401, 'Your session has expired, please log in again'));

  req.user = user;
  next();
}

// For routes that are public but show more to the owner, like draft forms.
// A missing or invalid token just means the request is treated as a visitor.
function optionalAuth(req, res, next) {
  const token = readToken(req);
  if (token) req.user = verifyToken(token);
  next();
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return next(new HttpError(403, 'You do not have permission to do this'));
  }
  next();
}

const adminOnly = [requireAuth, requireAdmin];

module.exports = { optionalAuth, adminOnly };

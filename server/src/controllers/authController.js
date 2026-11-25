const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { HttpError, catchAsync } = require('../utils/errors');

function createToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
}

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  // typeof checks also block operator objects like { "$gt": "" }
  if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
    throw new HttpError(400, 'Email and password are required');
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
  const isValid = user && (await user.checkPassword(password));

  // Same message for both cases so the response does not reveal which emails exist.
  if (!isValid) throw new HttpError(401, 'Invalid email or password');

  res.json({ token: createToken(user), user: user.toJSON() });
});

module.exports = { login };

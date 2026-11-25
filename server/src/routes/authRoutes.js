const express = require('express');
const { login } = require('../controllers/authController');
const { loginLimiter } = require('../middleware/rateLimit');

const router = express.Router();

router.post('/login', loginLimiter, login);

module.exports = router;

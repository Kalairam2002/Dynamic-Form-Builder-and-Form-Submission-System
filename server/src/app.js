const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const authRoutes = require('./routes/authRoutes');
const formRoutes = require('./routes/formRoutes');
const { generalLimiter } = require('./middleware/rateLimit');
const { notFound, errorHandler } = require('./middleware/error');

const app = express();

// Behind a load balancer or reverse proxy the client IP comes from X-Forwarded-For,
// which the rate limiters need. Set TRUST_PROXY to the number of proxies in front.
if (process.env.TRUST_PROXY) {
  app.set('trust proxy', Number(process.env.TRUST_PROXY));
}

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use('/api', generalLimiter);
app.use(express.json({ limit: '100kb' }));

// Removes keys starting with $ or containing a dot, so payloads like

app.use(mongoSanitize());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/forms', formRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;

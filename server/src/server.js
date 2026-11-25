const app = require('./app');
const connectDB = require('./config/db');

const requiredEnv = ['MONGO_URI', 'JWT_SECRET', 'CLIENT_URL'];

async function start() {
  const missing = requiredEnv.filter((name) => !process.env[name]);
  if (missing.length) {
    console.error(`Missing environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }

  await connectDB(process.env.MONGO_URI);

  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});

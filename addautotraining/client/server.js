// Wrapper to reuse the main app defined in the repository root `server.js`.
const { app } = require('../server');

const PORT = process.env.PORT || 5002;

if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`Client-wrapper running on port ${PORT}`);
  });

  const shutdown = () => {
    console.log('Shutting down client wrapper server');
    server.close(() => {
      console.log('Client wrapper server closed');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

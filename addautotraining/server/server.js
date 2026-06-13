// Wrapper to reuse the main app defined in the repository root `server.js`.
// This file starts the canonical app on an alternate port when invoked.
const { app, startServer } = require('../server');

const PORT = process.env.PORT || 5001;

if (require.main === module) {
  // If this wrapper is executed directly, start a new HTTP server on a different port.
  const server = app.listen(PORT, () => {
    console.log(`Server-wrapper running on port ${PORT}`);
  });

  const shutdown = () => {
    console.log('Shutting down wrapper server');
    server.close(() => {
      console.log('Wrapper server closed');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

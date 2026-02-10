import app from './app';
import { config } from './config/environment';
import { tradeScheduler } from './schedulers/tradeScheduler';

const PORT = config.port;

const server = app.listen(PORT, () => {
  console.log(`[Server] Running in ${config.nodeEnv} mode`);
  console.log(`[Server] Server is running on http://localhost:${PORT}`);
  console.log(`[Server] API documentation available at http://localhost:${PORT}/api`);

  // Start trade scheduler
  tradeScheduler.startScheduler();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Server] SIGTERM signal received: closing HTTP server');
  tradeScheduler.stopScheduler();
  server.close(() => {
    console.log('[Server] HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('[Server] SIGINT signal received: closing HTTP server');
  tradeScheduler.stopScheduler();
  server.close(() => {
    console.log('[Server] HTTP server closed');
    process.exit(0);
  });
});

// Unhandled rejection
process.on('unhandledRejection', (reason: Error) => {
  console.error('[Server] Unhandled Rejection at:', reason);
  process.exit(1);
});

export default server;

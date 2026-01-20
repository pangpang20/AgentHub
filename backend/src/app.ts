import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { requestLogger } from './middleware/logging';
import { notFoundHandler, errorHandler } from './middleware/error';
import config from './config';
import { connectRedis } from './config/redis';
import apiRouter from './api/index';
import authRouter from './api/auth';
import agentRouter from './api/agents';
import conversationRouter from './api/conversations';
import knowledgeBaseRouter from './api/knowledge-base';
import pluginRouter from './api/plugins';
import templateRouter from './api/templates';
import userRouter from './api/users';
import { healthCheck, readinessCheck, livenessCheck } from './api/health';

const createApp = (): Application => {
  const app = express();

  // Security middleware
  app.use(helmet());

  // CORS configuration - allow multiple origins for development
  const allowedOrigins = [
    'http://localhost:3000',
    config.frontendUrl,
  ];

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
    })
  );

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logging
  app.use(requestLogger);

  // Health check endpoints
  app.get('/health', healthCheck);
  app.get('/health/readiness', readinessCheck);
  app.get('/health/liveness', livenessCheck);

  // API routes
  app.use('/v1', apiRouter);
  app.use('/v1/auth', authRouter);
  app.use('/v1/agents', agentRouter);
  app.use('/v1/conversations', conversationRouter);
  app.use('/v1/knowledge-base', knowledgeBaseRouter);
  app.use('/v1/plugins', pluginRouter);
  app.use('/v1/templates', templateRouter);
  app.use('/v1/users', userRouter);

  // 404 handler
  app.use(notFoundHandler);

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
};

const startServer = async (): Promise<void> => {
  try {
    console.log('Starting server...');
    console.log('Connecting to Redis...');
    // Connect to Redis
    await connectRedis();
    console.log('Redis connection completed');

    const app = createApp();
    console.log('Express app created');

    app.listen(config.port, () => {
      console.log(`🚀 Server is running on port ${config.port}`);
      console.log(`📝 Environment: ${config.nodeEnv}`);
      console.log(`🔗 Frontend URL: ${config.frontendUrl}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start server if this file is run directly
if (require.main === module) {
  startServer();
}

export { createApp, startServer };
export default createApp;

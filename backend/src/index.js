/**
 * DevSecOps AI Guardian - Main Backend Entry Point
 *
 * This is the core backend server that powers the AI-driven security,
 * code quality, and DevOps automation platform using Amazon Kiro.
 */

import express from 'express';
import cors from 'cors';
import http from 'http';
import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';
import { createYoga } from 'graphql-yoga';
import { schema } from './api/schema.js';
import { logger } from './utils/logger.js';
import { AgentOrchestrator } from './agents/orchestrator.js';
import { initDatabase } from './utils/database.js';
import { initRedis } from './utils/redis.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// GraphQL API
const yoga = createYoga({
  schema,
  graphqlEndpoint: '/api/graphql',
  context: ({ request }) => ({
    request,
    user: request.user // Set by auth middleware
  })
});
app.use('/api/graphql', yoga);

// REST API Routes
import securityRoutes from './api/routes/security.js';
import qualityRoutes from './api/routes/quality.js';
import devopsRoutes from './api/routes/devops.js';
import webhookRoutes from './api/routes/webhooks.js';
import analyticsRoutes from './api/routes/analytics.js';

app.use('/api/security', securityRoutes);
app.use('/api/quality', qualityRoutes);
app.use('/api/devops', devopsRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/analytics', analyticsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Create HTTP server
const server = http.createServer(app);

// WebSocket server for real-time updates
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws, req) => {
  logger.info('WebSocket client connected', { ip: req.socket.remoteAddress });

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      logger.debug('WebSocket message received:', data);

      // Handle different message types
      switch (data.type) {
        case 'subscribe':
          ws.subscriptions = data.topics || [];
          ws.send(JSON.stringify({ type: 'subscribed', topics: ws.subscriptions }));
          break;

        case 'scan':
          // Trigger security scan
          const result = await AgentOrchestrator.executeScan(data.payload);
          ws.send(JSON.stringify({ type: 'scan_result', data: result }));
          break;

        default:
          ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
      }
    } catch (error) {
      logger.error('WebSocket message error:', error);
      ws.send(JSON.stringify({ type: 'error', message: error.message }));
    }
  });

  ws.on('close', () => {
    logger.info('WebSocket client disconnected');
  });

  ws.on('error', (error) => {
    logger.error('WebSocket error:', error);
  });
});

// Broadcast function for sending updates to all connected clients
export function broadcast(topic, data) {
  wss.clients.forEach(client => {
    if (client.readyState === 1 && (!client.subscriptions || client.subscriptions.includes(topic))) {
      client.send(JSON.stringify({ topic, data }));
    }
  });
}

// Initialize services
async function initialize() {
  try {
    logger.info('Initializing DevSecOps AI Guardian...');

    // Initialize database connection
    await initDatabase();
    logger.info('✓ Database connected');

    // Initialize Redis connection
    await initRedis();
    logger.info('✓ Redis connected');

    // Initialize AI Agent Orchestrator
    await AgentOrchestrator.initialize();
    logger.info('✓ AI Agent Orchestrator initialized');

    logger.info('✓ All services initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize services:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(async () => {
    logger.info('HTTP server closed');
    await AgentOrchestrator.shutdown();
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received: closing HTTP server');
  server.close(async () => {
    logger.info('HTTP server closed');
    await AgentOrchestrator.shutdown();
    process.exit(0);
  });
});

// Start server
async function start() {
  await initialize();

  server.listen(PORT, () => {
    logger.info(`🚀 DevSecOps AI Guardian Backend running on port ${PORT}`);
    logger.info(`📊 GraphQL API: http://localhost:${PORT}/api/graphql`);
    logger.info(`🔌 WebSocket: ws://localhost:${PORT}/ws`);
    logger.info(`🏥 Health check: http://localhost:${PORT}/health`);
    logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

start().catch(error => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});

export default app;

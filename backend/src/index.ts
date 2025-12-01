import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { typeDefs } from './graphql/schema';
import { resolvers } from './graphql/resolvers';
import { connectDatabase } from './database/connection';
import { connectRedis } from './config/redis';
import { logger } from './utils/logger';
import { authenticateToken } from './middleware/auth';

dotenv.config();

const PORT = process.env.PORT || 4000;
const app = express();
const httpServer = createServer(app);

// Socket.IO setup for real-time features
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production',
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.',
});

app.use('/graphql', limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Apollo Server setup
const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    let user = null;

    if (token) {
      try {
        user = authenticateToken(token);
      } catch (error) {
        logger.warn('Invalid token in request');
      }
    }

    return { user, io };
  },
  introspection: process.env.NODE_ENV !== 'production',
  formatError: (error) => {
    logger.error('GraphQL Error:', error);
    return error;
  },
});

// Socket.IO event handlers
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  socket.on('join-challenge', (challengeId: string) => {
    socket.join(`challenge-${challengeId}`);
    logger.info(`Socket ${socket.id} joined challenge ${challengeId}`);
  });

  socket.on('leave-challenge', (challengeId: string) => {
    socket.leave(`challenge-${challengeId}`);
    logger.info(`Socket ${socket.id} left challenge ${challengeId}`);
  });

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Start server
async function startServer() {
  try {
    // Connect to database
    await connectDatabase();
    logger.info('Database connected successfully');

    // Connect to Redis
    await connectRedis();
    logger.info('Redis connected successfully');

    // Start Apollo Server
    await apolloServer.start();
    apolloServer.applyMiddleware({
      app: app as any,
      cors: false,
      path: '/graphql'
    });

    // Start HTTP server
    httpServer.listen(PORT, () => {
      logger.info(`Server running on http://localhost:${PORT}`);
      logger.info(`GraphQL endpoint: http://localhost:${PORT}${apolloServer.graphqlPath}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    logger.info('HTTP server closed');
  });
});

startServer();

export { io };

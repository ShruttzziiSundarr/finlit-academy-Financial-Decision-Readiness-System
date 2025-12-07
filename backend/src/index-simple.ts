import express, { Request, Response } from 'express';
import { ApolloServer } from 'apollo-server-express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { typeDefs } from './graphql/schema';
import { resolvers } from './graphql/resolvers';
import { connectDatabase } from './database/connection';
import { authenticateToken } from './middleware/auth';

dotenv.config();

const PORT = process.env.PORT || 4000;
const app = express();
const httpServer = createServer(app);

// Middleware
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production',
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: process.env.FRONTEND_URL
    ? ['http://localhost:3000', 'http://localhost:3001', process.env.FRONTEND_URL]
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
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
        console.warn('Invalid token in request');
      }
    }

    return { user, io: null };
  },
  introspection: true,
  formatError: (error) => {
    console.error('GraphQL Error:', error);
    return error;
  },
});

// Start server
async function startServer() {
  try {
    // Connect to database
    await connectDatabase();
    console.log('✅ Database connected successfully');

    // Start Apollo Server
    await apolloServer.start();
    apolloServer.applyMiddleware({
      app: app as any,
      cors: false,
      path: '/graphql'
    });

    // Start HTTP server
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 GraphQL endpoint: http://localhost:${PORT}${apolloServer.graphqlPath}`);
      console.log('');
      console.log('✅ Backend is ready!');
      console.log('👉 Go to http://localhost:3000 to test the app');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    console.error('');
    console.error('Troubleshooting:');
    console.error('1. Check DATABASE_URL in backend/.env');
    console.error('2. Make sure database is accessible');
    console.error('3. Run: npm run db:migrate');
    process.exit(1);
  }
}

startServer();
 
 

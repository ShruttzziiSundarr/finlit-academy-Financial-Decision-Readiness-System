# FinLit Academy - System Architecture

## Overview

FinLit Academy is a full-stack gamified financial literacy platform built with modern web technologies. The system follows a microservices-inspired architecture with clear separation between frontend, backend, and data layers.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
├─────────────────────────────────────────────────────────────┤
│  Next.js 14 (React)  │  PWA Support  │  Responsive Design   │
│  - App Router        │  - Service    │  - Mobile First      │
│  - SSR/SSG          │    Workers    │  - Tailwind CSS      │
│  - Client State     │  - Manifest   │  - Dark Mode         │
└──────────────┬──────────────────────────────────────────────┘
               │
               │ HTTPS / WSS
               │
┌──────────────▼──────────────────────────────────────────────┐
│                      API Gateway Layer                       │
├─────────────────────────────────────────────────────────────┤
│  Express.js  │  Apollo Server  │  Socket.IO  │  Middleware │
│  - CORS      │  - GraphQL API  │  - Real-time│  - Auth     │
│  - Rate      │  - Subscriptions│  - Events   │  - Logging  │
│    Limiting  │  - Resolvers    │             │  - Helmet   │
└──────────────┬──────────────────────────────────────────────┘
               │
               │
┌──────────────▼──────────────────────────────────────────────┐
│                    Business Logic Layer                      │
├─────────────────────────────────────────────────────────────┤
│  UserService    │  PortfolioService  │  BudgetService      │
│  CourseService  │  ChallengeService  │  ChatService        │
│  - Auth Logic   │  - Trade Execution │  - AI Integration   │
│  - Validation   │  - Market Data     │  - NLP Processing   │
└──────────────┬──────────────────────────────────────────────┘
               │
               │
┌──────────────▼──────────────────────────────────────────────┐
│                      Data Layer                              │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL          │  Redis Cache    │  External APIs     │
│  - User Data         │  - Sessions     │  - OpenAI API      │
│  - Portfolios        │  - Stock Quotes │  - Alpha Vantage   │
│  - Transactions      │  - Rate Limits  │  - Plaid API       │
│  - Learning Data     │                 │                    │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend Stack

**Framework:** Next.js 14
- Server-side rendering (SSR) for SEO
- Static site generation (SSG) for performance
- App Router for file-based routing
- Image optimization

**UI Layer:**
- React 18 with hooks
- Tailwind CSS for styling
- shadcn/ui components
- Radix UI primitives
- Lucide icons

**Data Management:**
- Apollo Client for GraphQL
- Zustand for local state
- Socket.io-client for real-time features

**Visualization:**
- Chart.js for standard charts
- D3.js for custom visualizations
- Recharts for responsive charts

**PWA Features:**
- Service workers
- Web manifest
- Offline support
- Push notifications

### Backend Stack

**Runtime:** Node.js 18+
- TypeScript for type safety
- ES2020+ features

**API Layer:**
- Express.js web framework
- Apollo Server for GraphQL
- GraphQL subscriptions
- REST endpoints (health checks)

**Real-time:**
- Socket.io for WebSocket connections
- Event-driven architecture
- Room-based broadcasting

**Security:**
- Helmet.js for HTTP headers
- CORS configuration
- JWT authentication
- bcrypt password hashing
- Rate limiting

**Logging & Monitoring:**
- Winston for structured logging
- Error tracking
- Performance metrics

### Data Layer

**Primary Database:** PostgreSQL 14+
- Relational data model
- ACID compliance
- Complex queries with joins
- Indexes for performance

**Cache Layer:** Redis 7+
- Session storage
- Stock quote caching
- Rate limit counters
- Pub/Sub for real-time features

**External Services:**
- OpenAI API (GPT-4) - AI chatbot
- Alpha Vantage - Stock market data
- Plaid API - Banking integration (optional)

## Data Models

### Core Entities

1. **User**
   - Authentication credentials
   - Profile information
   - Progress tracking
   - Achievements

2. **Portfolio**
   - Holdings (stocks owned)
   - Transactions history
   - Cash balance
   - Performance metrics

3. **Budget**
   - Categories with allocations
   - Expenses tracking
   - Savings goals
   - Recurring expenses

4. **Course**
   - Modules (VIDEO, ARTICLE, QUIZ, SIMULATION)
   - Difficulty levels
   - User progress
   - Completion tracking

5. **Challenge**
   - Type (BUDGET, INVEST, SAVE, QUIZ)
   - Participants
   - Leaderboard
   - Scoring system

6. **Chat Session**
   - Message history
   - AI responses
   - Context preservation

## Key Features Implementation

### 1. Interactive Budgeting Simulator

**Components:**
- Category-based budget allocation
- Real-time expense tracking
- Visual analytics (pie charts, bar charts)
- Savings goal tracking
- Recurring expense handling

**Tech:**
- Chart.js for visualizations
- React state for interactivity
- GraphQL mutations for persistence

### 2. Stock Market Simulation

**Features:**
- Virtual $100,000 starting capital
- Real market data (15-min delay)
- Buy/sell transactions
- Portfolio performance tracking
- Historical data visualization

**Tech:**
- Alpha Vantage API for quotes
- Redis caching (1-min TTL)
- PostgreSQL for transaction log
- Line charts for performance

### 3. AI Financial Advisor

**Capabilities:**
- Natural language understanding
- Context-aware responses
- Financial education focus
- Session-based conversations

**Tech:**
- OpenAI GPT-4 API
- RAG (Retrieval Augmented Generation)
- Chat history in PostgreSQL
- Streaming responses

### 4. Adaptive Learning System

**ML Components:**
- Collaborative filtering for course recommendations
- Progress tracking analytics
- Difficulty adjustment based on performance
- Personalized learning paths

**Tech:**
- User-course interaction matrix
- TensorFlow.js for client-side ML
- Cosine similarity for recommendations

### 5. Community Challenges

**Features:**
- Weekly challenges
- Real-time leaderboards
- Score tracking
- Achievements system

**Tech:**
- WebSocket for live updates
- PostgreSQL for leaderboard queries
- Socket.io rooms for challenge groups

## Security Architecture

### Authentication Flow

```
1. User submits credentials
2. Server validates with bcrypt
3. JWT token generated
4. Token sent to client
5. Client includes token in requests
6. Server validates token middleware
7. User context attached to request
```

### Security Measures

1. **API Security:**
   - JWT authentication
   - Rate limiting (100 req/15min)
   - CORS whitelist
   - Input validation with Joi
   - SQL injection prevention (parameterized queries)
   - XSS protection

2. **Data Security:**
   - Password hashing (bcrypt, 10 rounds)
   - Secure session storage
   - HTTPS in production
   - Environment variable secrets

3. **Frontend Security:**
   - CSP headers
   - XSS sanitization
   - Secure cookie flags
   - No sensitive data in localStorage

## Performance Optimizations

### Frontend

1. **Code Splitting:**
   - Dynamic imports for routes
   - Component lazy loading
   - Reduced initial bundle size

2. **Caching:**
   - Apollo Client cache
   - Image optimization
   - Static page generation

3. **Rendering:**
   - SSR for critical pages
   - SSG for static content
   - Client-side hydration

### Backend

1. **Database:**
   - Connection pooling (max 20)
   - Indexed queries
   - Query optimization
   - N+1 prevention

2. **Caching:**
   - Redis for stock quotes (1min TTL)
   - Session caching
   - Query result caching

3. **API:**
   - GraphQL field-level resolution
   - DataLoader for batching
   - Response compression

## Scalability Considerations

### Horizontal Scaling

1. **Stateless Backend:**
   - No in-memory sessions
   - Redis for shared state
   - Load balancer ready

2. **Database Scaling:**
   - Read replicas for queries
   - Write to primary
   - Connection pooling

3. **Cache Distribution:**
   - Redis Cluster
   - Consistent hashing
   - Failover support

### Vertical Scaling

1. **Resource Optimization:**
   - Memory usage monitoring
   - CPU profiling
   - Database query optimization

2. **Background Jobs:**
   - Bull queue for async tasks
   - Portfolio value calculations
   - Email notifications
   - Data aggregation

## Monitoring & Observability

### Metrics to Track

1. **Application Metrics:**
   - Request rate
   - Response time (p50, p95, p99)
   - Error rate
   - Active users

2. **Business Metrics:**
   - Daily active users
   - Course completions
   - Challenge participation
   - Portfolio transactions

3. **Infrastructure Metrics:**
   - CPU usage
   - Memory usage
   - Database connections
   - Redis hit rate

### Logging Strategy

- Structured JSON logs
- Log levels (debug, info, warn, error)
- Request/response logging
- Error stack traces
- User action tracking

## Future Enhancements

1. **Mobile Apps:**
   - React Native app
   - Native features
   - Push notifications

2. **Advanced ML:**
   - Sentiment analysis on spending
   - Predictive analytics
   - Anomaly detection

3. **Social Features:**
   - Friend system
   - Study groups
   - Social sharing

4. **Gamification:**
   - More achievement types
   - Badges and rewards
   - Level system
   - Streaks and bonuses

5. **Content Expansion:**
   - More courses
   - Video content
   - Live webinars
   - Expert Q&A sessions

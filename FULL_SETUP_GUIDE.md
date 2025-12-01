# 🚀 Full-Fledged Real-Time Setup Guide

## Overview

To make this work in **real-time** with **persistent data storage**, you need:

1. **PostgreSQL Database** - Stores all user data, portfolios, budgets, transactions
2. **Redis Cache** - Handles real-time data and WebSocket sessions
3. **Backend API** - Node.js server with GraphQL
4. **Real-time WebSockets** - Socket.io for live updates
5. **External APIs** - Stock data, AI chatbot

---

## 🗄️ Data Storage Architecture

### **Where Data Gets Stored:**

```
┌─────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                   │
│  (Persistent Storage - All User Data Lives Here)        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ├─ users                    (User accounts)            │
│  ├─ user_progress           (Learning stats)            │
│  ├─ portfolios              (Virtual portfolios)        │
│  ├─ holdings                (Stock positions)           │
│  ├─ transactions            (Trade history)             │
│  ├─ portfolio_history       (Daily snapshots)           │
│  ├─ budgets                 (Budget configurations)     │
│  ├─ budget_categories       (Spending categories)       │
│  ├─ expenses                (All expenses)              │
│  ├─ courses                 (Course catalog)            │
│  ├─ modules                 (Course content)            │
│  ├─ user_course_progress    (Learning progress)        │
│  ├─ challenges              (Competitions)              │
│  ├─ challenge_participants  (User scores)               │
│  ├─ chat_sessions           (AI chat history)          │
│  └─ chat_messages           (AI conversations)          │
│                                                          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                      Redis Cache                         │
│  (Temporary/Fast Storage - Real-time Data)               │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ├─ Session tokens          (User authentication)       │
│  ├─ Stock quotes            (Cached for 1 minute)       │
│  ├─ Rate limit counters     (API throttling)            │
│  ├─ WebSocket sessions      (Active connections)        │
│  └─ Pub/Sub channels        (Real-time events)          │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Data Flow Example

### **Budget Simulator - How Data Flows:**

```
User adds expense in UI
    ↓
Frontend sends GraphQL mutation
    ↓
Backend receives request
    ↓
Validates user authentication (JWT)
    ↓
Inserts expense into PostgreSQL → expenses table
    ↓
Updates category spent amount
    ↓
Broadcasts update via WebSocket (Socket.io)
    ↓
All connected clients receive real-time update
    ↓
Frontend updates charts automatically
```

### **Portfolio - How Real-time Works:**

```
User clicks "BUY" button
    ↓
GraphQL mutation: executeTrade
    ↓
Backend:
  1. Fetches current stock price (Alpha Vantage API)
  2. Caches price in Redis (1 min TTL)
  3. Validates user has enough cash
  4. Inserts transaction into PostgreSQL
  5. Updates holdings table
  6. Updates cash balance
  7. Emits WebSocket event: "portfolio-updated"
    ↓
Frontend receives WebSocket event
    ↓
Refetches portfolio data
    ↓
Charts update automatically
    ↓
Other users in same challenge see leaderboard update
```

---

## 🛠️ Complete Setup Instructions

### **Part 1: Install Prerequisites**

#### **1. PostgreSQL (Database)**

**Download & Install:**
- Windows: https://www.postgresql.org/download/windows/
- During installation:
  - Set password for `postgres` user (remember this!)
  - Default port: 5432
  - Install pgAdmin (GUI tool)

**Verify Installation:**
```bash
psql --version
# Should show: psql (PostgreSQL) 14.x
```

**Create Database:**
```bash
# Method 1: Command line
createdb -U postgres finlit_academy

# Method 2: Using psql
psql -U postgres
CREATE DATABASE finlit_academy;
\q
```

#### **2. Redis (Cache/Real-time)**

**Option A: Using WSL (Recommended for Windows)**
```bash
# Install WSL if not already installed
wsl --install

# Open WSL terminal
wsl

# Install Redis
sudo apt update
sudo apt install redis-server

# Start Redis
sudo service redis-server start

# Test
redis-cli ping
# Should respond: PONG
```

**Option B: Using Memurai (Windows Native)**
- Download: https://www.memurai.com/
- Install and start service
- Test: `redis-cli ping`

**Verify Redis:**
```bash
redis-cli
ping
# Should respond: PONG
exit
```

---

### **Part 2: Backend Setup**

#### **1. Install Backend Dependencies**

```bash
cd c:\Users\Shrut\OneDrive\Desktop\COLLEGE\projects\Project\backend
npm install --legacy-peer-deps
```

#### **2. Configure Environment Variables**

Edit `backend\.env`:

```env
# Server
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:3000

# PostgreSQL Database
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/finlit_academy
DB_HOST=localhost
DB_PORT=5432
DB_NAME=finlit_academy
DB_USER=postgres
DB_PASSWORD=YOUR_ACTUAL_POSTGRES_PASSWORD_HERE

# Redis
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT (for authentication)
JWT_SECRET=your_super_secret_key_change_this_12345
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=30d

# OpenAI (Optional - for AI chatbot)
OPENAI_API_KEY=
# Get at: https://platform.openai.com/api-keys

# Alpha Vantage (Optional - for real stock data)
ALPHA_VANTAGE_API_KEY=
# Get free key at: https://www.alphavantage.co/support/#api-key

# Feature Flags
ENABLE_AI_CHATBOT=false
ENABLE_PLAID_INTEGRATION=false
```

**Replace:**
- `YOUR_ACTUAL_POSTGRES_PASSWORD_HERE` with your actual password
- Optionally add API keys later

#### **3. Create Database Tables**

```bash
# Make sure PostgreSQL is running

# Run the schema SQL file
psql -U postgres -d finlit_academy -f src/database/schema.sql

# Or use pgAdmin:
# 1. Open pgAdmin
# 2. Connect to finlit_academy database
# 3. Open Query Tool
# 4. Copy-paste contents of src/database/schema.sql
# 5. Execute
```

**Verify Tables Created:**
```bash
psql -U postgres -d finlit_academy
\dt
# Should list 18 tables
\q
```

#### **4. Start Backend Server**

```bash
cd backend
npm run dev
```

**Expected Output:**
```
Server running on http://localhost:4000
GraphQL endpoint: http://localhost:4000/graphql
Database connected successfully
Redis connected successfully
```

---

### **Part 3: Frontend Setup (Already Done!)**

Your frontend is already running on port 3000. If not:

```bash
cd frontend
npm run dev
```

---

## 🔄 Real-Time Features Explained

### **1. WebSocket Real-Time Updates**

**How it works:**

```javascript
// Backend broadcasts event
io.to(`user-${userId}`).emit('portfolio-updated', portfolioData);

// Frontend listens
socket.on('portfolio-updated', (data) => {
  // Automatically refresh portfolio
  refetchPortfolio();
});
```

**What's Real-Time:**
- ✅ Portfolio value updates when stocks change
- ✅ Leaderboard updates when someone completes challenge
- ✅ Budget updates when expenses are added
- ✅ AI chat responses stream in real-time

### **2. Stock Price Updates**

**Implementation:**

```javascript
// Backend caches stock prices
async getStockQuote(symbol) {
  // Check Redis cache
  const cached = await redis.get(`stock:${symbol}`);
  if (cached) return cached;

  // Fetch from API
  const quote = await alphaVantage.getQuote(symbol);

  // Cache for 1 minute
  await redis.setex(`stock:${symbol}`, 60, JSON.stringify(quote));

  return quote;
}
```

**Result:**
- Stock prices update every 1 minute
- Reduces API calls (free tier has limits)
- Fast response times

### **3. Challenge Leaderboards**

**How it updates:**

```javascript
// User submits score
await submitChallengeResult(challengeId, score);

// Backend updates database
UPDATE challenge_participants SET score = $1 WHERE...

// Broadcast to all participants
io.to(`challenge-${challengeId}`).emit('leaderboard-updated', newLeaderboard);

// All clients update automatically
```

---

## 📈 Data Persistence Examples

### **Example 1: User Creates Budget**

```javascript
// Frontend
mutation {
  createExpense(input: {
    categoryId: "cat-123"
    description: "Groceries"
    amount: 85.50
    date: "2024-01-15"
    recurring: false
  }) {
    id
    amount
  }
}

// Backend inserts into PostgreSQL
INSERT INTO expenses (category_id, description, amount, date, recurring)
VALUES ('cat-123', 'Groceries', 85.50, '2024-01-15', false)
RETURNING *;

// Data is now permanently stored
// User can close browser and come back - data persists
```

### **Example 2: User Buys Stock**

```javascript
// Frontend
mutation {
  executeTrade(input: {
    symbol: "AAPL"
    shares: 10
    type: BUY
  }) {
    id
    totalAmount
  }
}

// Backend process:
1. Check current cash: SELECT cash_balance FROM portfolios WHERE user_id = $1
2. Get stock price: (from Redis cache or Alpha Vantage API)
3. Validate: cash >= (shares * price)
4. Insert transaction: INSERT INTO transactions (...)
5. Update holdings: INSERT INTO holdings (...) ON CONFLICT UPDATE
6. Update cash: UPDATE portfolios SET cash_balance = cash_balance - $1
7. Emit WebSocket: io.emit('portfolio-updated')

// All data stored in PostgreSQL
// Transaction history preserved forever
```

### **Example 3: AI Chat History**

```javascript
// User sends message
mutation {
  sendMessage(input: {
    sessionId: "session-123"
    message: "How should I invest $1000?"
  }) {
    id
    content
  }
}

// Backend:
1. Insert user message: INSERT INTO chat_messages (session_id, role, content)
2. Call OpenAI API with conversation history
3. Get AI response
4. Insert AI response: INSERT INTO chat_messages (session_id, role, content)
5. Return to user

// Full conversation saved to database
// User can view chat history anytime
```

---

## 🎯 Making It Production-Ready

### **1. Add Seed Data (Optional)**

Create `backend/src/database/seed.ts`:

```typescript
// Sample courses
INSERT INTO courses (title, description, difficulty, estimated_minutes)
VALUES
  ('Financial Basics', 'Learn the fundamentals', 'BEGINNER', 30),
  ('Investing 101', 'Introduction to investing', 'BEGINNER', 45);

// Sample challenges
INSERT INTO challenges (title, description, type, difficulty, points, start_date, end_date, status)
VALUES
  ('Budget Master', 'Stay under budget for a week', 'BUDGET', 'EASY', 100, NOW(), NOW() + INTERVAL '7 days', 'ACTIVE');
```

Run:
```bash
npm run db:seed
```

### **2. Set Up Cron Jobs (Automated Tasks)**

The backend includes `node-cron` for scheduled tasks:

```javascript
// Update stock prices every minute
cron.schedule('*/1 * * * *', async () => {
  await updateCachedStockPrices();
});

// Calculate daily portfolio snapshots at midnight
cron.schedule('0 0 * * *', async () => {
  await snapshotAllPortfolios();
});

// Update challenge statuses
cron.schedule('*/5 * * * *', async () => {
  await updateChallengeStatuses();
});
```

### **3. Enable External APIs**

#### **Alpha Vantage (Stock Data)**

1. Get free API key: https://www.alphavantage.co/support/#api-key
2. Add to `backend/.env`:
   ```env
   ALPHA_VANTAGE_API_KEY=YOUR_KEY_HERE
   ```
3. Restart backend

**Result:** Real stock prices instead of mock data!

#### **OpenAI (AI Chatbot)**

1. Get API key: https://platform.openai.com/api-keys
2. Add to `backend/.env`:
   ```env
   OPENAI_API_KEY=sk-YOUR_KEY_HERE
   ENABLE_AI_CHATBOT=true
   ```
3. Restart backend

**Result:** Real AI responses to financial questions!

---

## 🔒 Security Best Practices

### **1. Environment Variables**

Never commit `.env` files to Git:
```bash
# Already in .gitignore
.env
.env.local
```

### **2. Database Security**

```sql
-- Create separate user for app (not using postgres superuser)
CREATE USER finlit_app WITH PASSWORD 'strong_password';
GRANT ALL PRIVILEGES ON DATABASE finlit_academy TO finlit_app;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO finlit_app;
```

Update `backend/.env`:
```env
DB_USER=finlit_app
DB_PASSWORD=strong_password
```

### **3. API Rate Limiting**

Already configured in backend:
```javascript
// 100 requests per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
```

---

## 📊 Monitoring & Debugging

### **1. Check Database**

```bash
# Connect to database
psql -U postgres -d finlit_academy

# View users
SELECT * FROM users LIMIT 5;

# View portfolios
SELECT * FROM portfolios;

# View transactions
SELECT * FROM transactions ORDER BY timestamp DESC LIMIT 10;

# Check table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### **2. Check Redis**

```bash
# Connect to Redis
redis-cli

# View all keys
KEYS *

# Check specific key
GET stock:AAPL

# View key with TTL
TTL stock:AAPL

# Clear all cache (careful!)
FLUSHALL
```

### **3. Backend Logs**

Logs are written to:
- `backend/logs/combined.log` - All logs
- `backend/logs/error.log` - Errors only

Monitor in real-time:
```bash
tail -f backend/logs/combined.log
```

---

## 🚀 Testing the Full Stack

### **1. Register a User**

Open: http://localhost:4000/graphql

```graphql
mutation {
  register(input: {
    email: "test@example.com"
    username: "testuser"
    password: "Password123!"
    firstName: "Test"
    lastName: "User"
  }) {
    token
    user {
      id
      email
    }
  }
}
```

Copy the `token` from response.

### **2. Test Authenticated Request**

Add HTTP Headers in GraphQL Playground:
```json
{
  "Authorization": "Bearer YOUR_TOKEN_HERE"
}
```

Query:
```graphql
query {
  portfolio {
    totalValue
    cashBalance
    holdings {
      symbol
      shares
    }
  }
}
```

### **3. Execute a Trade**

```graphql
mutation {
  executeTrade(input: {
    symbol: "AAPL"
    shares: 5
    type: BUY
  }) {
    id
    symbol
    shares
    totalAmount
  }
}
```

### **4. Check Database**

```bash
psql -U postgres -d finlit_academy
SELECT * FROM transactions;
SELECT * FROM holdings;
```

You should see your trade!

---

## 🎓 Summary

### **What Makes It Real-Time:**

1. **WebSockets** - Instant bidirectional communication
2. **Redis Pub/Sub** - Event broadcasting to all connected clients
3. **Stock API Caching** - 1-minute TTL for live-ish data
4. **GraphQL Subscriptions** - Real-time data streaming

### **Where Data Is Stored:**

1. **PostgreSQL** - All persistent data (users, portfolios, budgets, etc.)
2. **Redis** - Temporary cache and sessions
3. **External APIs** - Stock prices, AI responses (fetched on-demand)

### **How to Start Everything:**

```bash
# Terminal 1: PostgreSQL (auto-starts as service usually)
# Terminal 2: Redis
wsl
sudo service redis-server start

# Terminal 3: Backend
cd backend
npm run dev

# Terminal 4: Frontend
cd frontend
npm run dev
```

---

## 🎯 Next Steps

1. **Add Seed Data** - Populate with sample courses and challenges
2. **Get API Keys** - Enable real stock data and AI
3. **Test Real-Time** - Open multiple browser tabs, see updates
4. **Deploy** - Use Vercel (frontend) + Railway (backend + database)

---

## 📞 Quick Reference

**Frontend:** http://localhost:3000
**Backend API:** http://localhost:4000
**GraphQL Playground:** http://localhost:4000/graphql
**Database:** PostgreSQL on localhost:5432
**Cache:** Redis on localhost:6379

**Database Name:** `finlit_academy`
**Tables:** 18 total
**Sample Data:** Add with `npm run db:seed`

---

**You now have a complete understanding of how to make this production-ready!** 🚀

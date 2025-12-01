# 🚀 Quick Setup Guide - No Database Required!

This is a simplified setup to get the app running quickly for demo purposes.

## Option 1: Frontend Only (Fastest - 5 minutes)

This gets the UI running with mock data - perfect for demonstrating the interface!

### Step 1: Install Node.js
If not installed: Download from https://nodejs.org/ (version 18+)

### Step 2: Install Frontend Dependencies
```bash
cd c:\Users\Shrut\OneDrive\Desktop\COLLEGE\projects\Project\frontend
npm install
```

### Step 3: Start Frontend
```bash
npm run dev
```

### Step 4: Open Browser
Visit: http://localhost:3000

**What you'll see:**
✅ Landing page with features
✅ Dashboard with stats
✅ Budget simulator with charts
✅ Portfolio simulator with mock data

**Note:** Backend features (API, database) won't work, but all UI components will display!

---

## Option 2: Full Setup (Complete - 30 minutes)

### Prerequisites
1. **Node.js 18+** - https://nodejs.org/
2. **PostgreSQL 14+** - https://www.postgresql.org/download/windows/
3. **Redis** (Optional) - Can run without it initially

### Step-by-Step

#### 1. Install Frontend
```bash
cd c:\Users\Shrut\OneDrive\Desktop\COLLEGE\projects\Project\frontend
npm install
```

If you get errors, try:
```bash
npm install --legacy-peer-deps
```

#### 2. Install Backend (Simplified)
```bash
cd ..\backend
npm install --legacy-peer-deps
```

If TensorFlow or other packages fail:
```bash
# Install without optional dependencies
npm install --no-optional --legacy-peer-deps
```

#### 3. Setup Database
```bash
# Create database
createdb finlit_academy

# Or using psql
psql -U postgres
CREATE DATABASE finlit_academy;
\q
```

#### 4. Configure Environment

**Backend (.env):**
```bash
cd backend
copy .env.example .env
```

Edit `backend\.env` - **ONLY CHANGE THESE LINES:**
```env
DB_PASSWORD=your_postgres_password
JWT_SECRET=any_random_string_here_12345
ENABLE_AI_CHATBOT=false
```

**Frontend (.env.local):**
```bash
cd ..\frontend
copy .env.example .env.local
```

No changes needed in frontend/.env.local for basic setup!

#### 5. Setup Database Tables

**Option A: Using psql**
```bash
psql -U postgres -d finlit_academy -f backend/src/database/schema.sql
```

**Option B: Manual (if above fails)**
```bash
psql -U postgres -d finlit_academy
```
Then copy-paste the contents of `backend/src/database/schema.sql`

#### 6. Start Backend
```bash
cd backend
npm run dev
```

Should see: "Server running on http://localhost:4000"

#### 7. Start Frontend (New Terminal)
```bash
cd ..\frontend
npm run dev
```

Should see: "ready - started server on http://localhost:3000"

#### 8. Access App
- Frontend: http://localhost:3000
- GraphQL: http://localhost:4000/graphql

---

## Common Errors & Fixes

### Error: "Cannot find module"
```bash
# Clear everything and reinstall
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Error: "Python not found" or "node-gyp" errors
**Solution:** Install without native modules
```bash
npm install --legacy-peer-deps --no-optional
```

Or skip the problematic packages:
```bash
# In backend, temporarily remove from package.json:
# - @tensorflow/tfjs-node
# - bcryptjs (use 'bcrypt' if needed)
# Then run npm install
```

### Error: "Port 3000 already in use"
```bash
# Kill the process
npx kill-port 3000

# Or use different port
npm run dev -- -p 3001
```

### Error: "EACCES permission denied"
```bash
# Run as administrator or:
npm cache clean --force
npm install --legacy-peer-deps
```

### Error: Database connection fails
```bash
# Check PostgreSQL is running
# Windows: Check Services (services.msc)
# Look for "postgresql" service

# Test connection
psql -U postgres -d finlit_academy
```

### Error: "Redis connection failed"
**Solution:** You can run without Redis initially!

Edit `backend/src/index.ts` and comment out Redis:
```typescript
// await connectRedis();
// logger.info('Redis connected successfully');
```

---

## Minimal Working Setup (No Database!)

If you just want to see the frontend working:

### Create Simple Mock Backend

Create `backend/simple-server.js`:
```javascript
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.listen(4000, () => {
  console.log('Mock server running on http://localhost:4000');
});
```

Install minimal dependencies:
```bash
cd backend
npm install express cors
node simple-server.js
```

Then run frontend:
```bash
cd ../frontend
npm run dev
```

**This gives you:**
- ✅ Working UI
- ✅ All pages viewable
- ✅ Mock data displayed
- ✅ Perfect for demo/presentation

---

## Recommended: Frontend-Only Demo

For JPMorgan presentation, I recommend **Frontend-Only** setup:

**Why?**
- ✅ Installs in 5 minutes
- ✅ No database complexity
- ✅ Shows UI/UX skills
- ✅ Demonstrates design
- ✅ All visualizations work

**Just run:**
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```

Then show:
1. Landing page design
2. Dashboard layout
3. Budget simulator with charts
4. Portfolio interface
5. Responsive design

**Mention in interview:**
"This is the frontend demo with mock data. The full-stack version includes PostgreSQL database, GraphQL API, Redis caching, and real-time WebSocket features - all documented in the codebase."

---

## Quick Test Commands

```bash
# Check Node version
node --version

# Check npm version
npm --version

# Check if PostgreSQL installed
psql --version

# Test database connection
psql -U postgres -c "SELECT version();"

# Check if port is available
netstat -ano | findstr :3000
netstat -ano | findstr :4000

# Clear npm cache
npm cache clean --force

# Install with verbose logging
npm install --legacy-peer-deps --verbose
```

---

## What to Show in Demo

### Frontend Running (Port 3000)
1. **Landing Page** - Clean design, feature showcase
2. **Dashboard** - Stats cards, navigation
3. **Budget Simulator** - Interactive charts
4. **Portfolio** - Table, line chart, mock trades

### Backend Running (Port 4000)
1. **GraphQL Playground** - Schema documentation
2. **Query Example** - Show type system
3. **Database Schema** - Explain table structure
4. **Architecture** - Discuss scalability

---

## Priority Installation Order

**Level 1: Must Have (5 min)**
- Frontend only
- Shows UI completely

**Level 2: Nice to Have (15 min)**
- Frontend + Backend (no DB)
- Shows API structure

**Level 3: Full Demo (30 min)**
- Frontend + Backend + PostgreSQL
- Complete functionality

**Start with Level 1, add more if time permits!**

---

## Emergency: Can't Install Anything?

**Solution:** Use the code as documentation!

Show the interviewer:
1. File structure (well organized)
2. Code quality (TypeScript, comments)
3. Documentation (7 MD files)
4. Architecture diagrams in docs
5. Explain each component

Say: *"I can walk you through the architecture and codebase. The complete setup requires PostgreSQL and Redis, but I can demonstrate the code structure and explain the implementation."*

---

## Success Indicators

✅ You've succeeded when you see:

**Frontend:**
```
ready - started server on 0.0.0.0:3000
○ Compiling / ...
✓ Compiled / in XXXms
```

**Backend:**
```
Server running on http://localhost:4000
GraphQL endpoint: http://localhost:4000/graphql
Database connected successfully
```

**Browser:**
- Page loads at localhost:3000
- No console errors (F12)
- Charts display correctly
- Navigation works

---

## Need Help?

1. Try **Frontend-Only** first (easiest)
2. Read error messages carefully
3. Google specific errors
4. Check Node version (must be 18+)
5. Use `--legacy-peer-deps` flag

**Pro Tip:** For the interview, frontend-only is perfectly acceptable. You can explain the backend architecture verbally using the documentation!

Good luck! 🚀

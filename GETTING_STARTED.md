# 🚀 Getting Started with FinLit Academy

This guide will walk you through setting up and running the FinLit Academy platform with full authentication and database functionality.

## 📋 Prerequisites

Before you begin, make sure you have the following installed:

1. **Node.js 18+** - [Download here](https://nodejs.org/)
2. **PostgreSQL 14+** - [Download here](https://www.postgresql.org/download/)
3. **Git** - [Download here](https://git-scm.com/)

Optional (for full real-time features):
- **Redis** - For caching and real-time updates

---

## 🎯 Quick Start (15 minutes)

### Step 1: Install PostgreSQL

**Windows:**
1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Run the installer
3. **Remember the password you set for the `postgres` user**
4. Accept default port (5432)
5. Install pgAdmin (included in installer)

**Verify installation:**
```bash
psql --version
# Should show: psql (PostgreSQL) 14.x or higher
```

### Step 2: Create Database

Open Command Prompt or PowerShell and run:

```bash
# Option 1: Using createdb command
createdb -U postgres finlit_academy

# Option 2: Using psql
psql -U postgres
CREATE DATABASE finlit_academy;
\q
```

Enter your PostgreSQL password when prompted.

### Step 3: Configure Backend

1. Navigate to the backend folder:
```bash
cd c:\Users\Shrut\OneDrive\Desktop\COLLEGE\projects\Project\backend
```

2. Open the `.env` file (already created for you)

3. **IMPORTANT**: Update these two lines with your actual PostgreSQL password:
```env
DB_PASSWORD=YOUR_ACTUAL_POSTGRES_PASSWORD_HERE
DATABASE_URL=postgresql://postgres:YOUR_ACTUAL_POSTGRES_PASSWORD_HERE@localhost:5432/finlit_academy
```

Replace `YOUR_ACTUAL_POSTGRES_PASSWORD_HERE` with the password you set during PostgreSQL installation.

### Step 4: Install Backend Dependencies

```bash
# Make sure you're in the backend folder
cd backend

# Install dependencies
npm install --legacy-peer-deps
```

This will take 2-3 minutes.

### Step 5: Setup Database Tables

```bash
# Run the migration script to create all tables
npm run db:migrate
```

You should see:
```
✅ Database connection successful!
✅ Schema file loaded!
✅ All tables created successfully!
✅ Found 18 tables
```

### Step 6: Add Sample Data (Optional but Recommended)

```bash
npm run db:seed
```

This adds:
- 5 sample courses
- 6 learning modules
- 5 active challenges

### Step 7: Start Backend Server

```bash
npm run dev
```

Expected output:
```
Server running on http://localhost:4000
GraphQL endpoint: http://localhost:4000/graphql
Database connected successfully
```

**Keep this terminal window open!**

### Step 8: Install Frontend Dependencies

Open a **NEW terminal window** and run:

```bash
cd c:\Users\Shrut\OneDrive\Desktop\COLLEGE\projects\Project\frontend
npm install --legacy-peer-deps
```

### Step 9: Start Frontend Server

```bash
npm run dev
```

Expected output:
```
ready - started server on http://localhost:3000
```

### Step 10: Open the App

Open your browser and go to:
```
http://localhost:3000
```

You should see the FinLit Academy landing page!

---

## 🎉 Your First Actions

### 1. Create an Account

1. Click "Get Started Free" on the homepage
2. Fill in the registration form:
   - First Name: Your first name
   - Last Name: Your last name
   - Email: your.email@example.com
   - Username: yourusername
   - Password: (at least 8 characters)
3. Click "Create Account"

**What happens behind the scenes:**
- Your password is hashed with bcrypt (10 rounds)
- A new user record is created in PostgreSQL
- A portfolio is automatically created with $100,000 virtual cash
- A default budget is initialized
- You receive a JWT token (valid for 7 days)
- You're automatically logged in and redirected to the dashboard

### 2. Explore the Dashboard

After registration, you'll see:
- **Quick Stats**: Your learning progress and portfolio value
- **Budget Simulator**: Practice managing monthly budgets
- **Portfolio Simulator**: Trade stocks with virtual money
- **Learning Center**: Access courses and modules
- **Challenges**: Compete and earn points

### 3. Try the Budget Simulator

1. Click on "Budget Simulator" from the dashboard
2. See your $5,000 monthly income
3. View budget categories (Housing, Food, Transportation, etc.)
4. See interactive Pie Chart (allocation) and Bar Chart (spent vs allocated)
5. Monitor your remaining budget

### 4. Try the Portfolio Simulator

1. Click on "Portfolio Simulator" from the dashboard
2. See your $100,000 virtual cash
3. View current holdings (mock data initially)
4. See portfolio performance chart
5. Practice buying/selling stocks (connects to real API when configured)

---

## 🔍 Verify Everything is Working

### Check Database

Open pgAdmin or use psql:

```bash
psql -U postgres -d finlit_academy

# View all tables
\dt

# Check your user was created
SELECT * FROM users;

# Check your portfolio
SELECT * FROM portfolios;

# Exit
\q
```

### Check Backend API

Open your browser and go to:
```
http://localhost:4000/graphql
```

You should see the GraphQL Playground. Try this query:

```graphql
query {
  __schema {
    types {
      name
    }
  }
}
```

### Check Frontend

1. **Homepage** (http://localhost:3000) - Should show landing page
2. **Login** (http://localhost:3000/login) - Should show login form
3. **Signup** (http://localhost:3000/signup) - Should show registration form
4. **Dashboard** (http://localhost:3000/dashboard) - Should redirect to login if not authenticated
5. After login - Should show dashboard with navbar

---

## 🛠️ Troubleshooting

### Error: "Database connection failed"

**Problem**: Can't connect to PostgreSQL

**Solutions**:
1. Check PostgreSQL is running:
   - Windows: Open Services (services.msc), look for "postgresql" service
   - Should be "Running"

2. Verify credentials in `backend/.env`:
   - Check DB_PASSWORD matches your PostgreSQL password
   - Check DB_HOST is "localhost"
   - Check DB_PORT is "5432"

3. Test connection manually:
   ```bash
   psql -U postgres -d finlit_academy
   ```

### Error: "Port 4000 already in use"

**Problem**: Something else is using port 4000

**Solution**:
```bash
# Kill the process using port 4000
npx kill-port 4000

# Or change the port in backend/.env
PORT=4001
```

### Error: "Port 3000 already in use"

**Problem**: Something else is using port 3000

**Solution**:
```bash
# Kill the process
npx kill-port 3000

# Or run on different port
npm run dev -- -p 3001
```

### Error: "Module not found"

**Problem**: Dependencies not installed properly

**Solution**:
```bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Error: "Migration failed"

**Problem**: Database tables couldn't be created

**Solutions**:
1. Make sure database exists:
   ```bash
   psql -U postgres -l | grep finlit_academy
   ```

2. If not, create it:
   ```bash
   createdb -U postgres finlit_academy
   ```

3. Run migration again:
   ```bash
   npm run db:migrate
   ```

### Frontend shows blank page or errors

**Problem**: Check browser console (F12)

**Common issues**:
1. Backend not running - Start backend first
2. Wrong API URL - Check `frontend/.env.local` has correct URL
3. CORS error - Backend should allow localhost:3000

---

## 📊 What Data Gets Stored?

### PostgreSQL Database (Persistent)

**18 tables storing:**
- `users` - User accounts
- `portfolios` - Virtual investment portfolios ($100k starting balance)
- `holdings` - Stock positions
- `transactions` - Trade history
- `budgets` - Budget configurations
- `budget_categories` - Spending categories
- `expenses` - All expenses
- `courses` - Course catalog
- `modules` - Course content
- `user_course_progress` - Learning progress
- `challenges` - Competitions
- `challenge_participants` - User scores
- `chat_sessions` - AI chat conversations
- `chat_messages` - Individual messages

### Redis (Optional - Real-time Features)

- Stock price cache (1-minute TTL)
- Session tokens
- Rate limit counters
- WebSocket sessions

---

## 🎓 Understanding the Authentication Flow

### Registration:
```
User fills signup form
    ↓
Frontend sends GraphQL mutation: register
    ↓
Backend validates input
    ↓
Password hashed with bcrypt (10 rounds)
    ↓
User inserted into PostgreSQL users table
    ↓
Portfolio created with $100,000
    ↓
Budget created with default categories
    ↓
JWT token generated (expires in 7 days)
    ↓
Token + user data returned to frontend
    ↓
Token stored in localStorage
    ↓
User redirected to dashboard
```

### Login:
```
User enters email + password
    ↓
Frontend sends GraphQL mutation: login
    ↓
Backend queries users table by email
    ↓
Password compared with bcrypt
    ↓
If valid: Generate new JWT token
    ↓
Return token + user data
    ↓
Frontend stores token in localStorage
    ↓
Redirect to dashboard
```

### Protected Routes:
```
User navigates to /dashboard
    ↓
ProtectedRoute component checks localStorage for token
    ↓
If no token: Redirect to /login
    ↓
If token exists: Decode and check expiration
    ↓
If expired: Redirect to /login
    ↓
If valid: Render dashboard
```

---

## 🔧 Development Commands

### Backend

```bash
# Start development server (with auto-reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Database migration (create tables)
npm run db:migrate

# Database seed (add sample data)
npm run db:seed
```

### Frontend

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server (after build)
npm start

# Run tests
npm test

# Lint code
npm run lint
```

---

## 🌟 What's Next?

### Enable Real Stock Data

1. Get free API key from Alpha Vantage: https://www.alphavantage.co/support/#api-key
2. Add to `backend/.env`:
   ```env
   ALPHA_VANTAGE_API_KEY=YOUR_KEY_HERE
   ```
3. Restart backend
4. Portfolio will now show real stock prices!

### Enable AI Chatbot

1. Get API key from OpenAI: https://platform.openai.com/api-keys
2. Add to `backend/.env`:
   ```env
   OPENAI_API_KEY=sk-YOUR_KEY_HERE
   ENABLE_AI_CHATBOT=true
   ```
3. Restart backend
4. AI Financial Coach will work!

### Setup Redis (Optional)

For full real-time features:

1. **Windows (WSL)**:
   ```bash
   wsl --install
   wsl
   sudo apt update
   sudo apt install redis-server
   sudo service redis-server start
   redis-cli ping  # Should respond: PONG
   ```

2. **Windows (Memurai)**:
   - Download: https://www.memurai.com/
   - Install and start service

3. Restart backend - Redis will be automatically used

---

## 🎯 Success Checklist

- ✅ PostgreSQL installed and running
- ✅ Database `finlit_academy` created
- ✅ Backend `.env` configured with correct password
- ✅ Backend dependencies installed
- ✅ Database tables created (18 tables)
- ✅ Sample data seeded
- ✅ Backend running on port 4000
- ✅ Frontend dependencies installed
- ✅ Frontend running on port 3000
- ✅ Can access homepage at localhost:3000
- ✅ Can register new account
- ✅ Can login successfully
- ✅ Dashboard loads after login
- ✅ Can access budget and portfolio pages
- ✅ Navbar shows user name and logout button

---

## 📞 Common Commands Quick Reference

```bash
# Start everything
cd backend && npm run dev
# (New terminal)
cd frontend && npm run dev

# Reset database
psql -U postgres -d finlit_academy
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
\q
npm run db:migrate
npm run db:seed

# Check database
psql -U postgres -d finlit_academy
SELECT * FROM users;
\q

# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules
npm install --legacy-peer-deps
```

---

## 🎊 Congratulations!

You now have a fully functional financial literacy platform with:

✅ User authentication (register/login)
✅ Protected routes
✅ PostgreSQL database with 18 tables
✅ GraphQL API
✅ Interactive budget simulator
✅ Stock portfolio simulator
✅ Sample courses and challenges
✅ Professional UI with responsive design

**Ready for JPMorgan interview!** 🚀

---

## 📖 Additional Documentation

- `README.md` - Project overview
- `ARCHITECTURE.md` - System design and architecture
- `FEATURES.md` - Detailed feature specifications
- `API_REFERENCE.md` - GraphQL API documentation
- `FULL_SETUP_GUIDE.md` - Complete production setup
- `DEPLOYMENT.md` - Deploy to production (Vercel, Railway, AWS)
- `JPM_PRESENTATION.md` - Interview presentation guide

---

Need help? Check the troubleshooting section or refer to the full documentation files.

Good luck! 🎉

# 🚀 Quick Setup with Supabase (No Local Database!)

Get your app working in **10 minutes** without installing PostgreSQL locally.

## Step 1: Create Free Supabase Account (2 minutes)

1. Go to: **https://supabase.com**
2. Click **"Start your project"**
3. Sign up with GitHub (easiest) or email
4. Click **"New Project"**

Fill in:
- **Name**: `finlit-academy`
- **Database Password**: Choose a strong password (save it!)
- **Region**: Choose closest to you
- **Pricing Plan**: FREE

Click **"Create new project"** - wait 2 minutes for setup

## Step 2: Get Your Database URL (1 minute)

1. In your Supabase project dashboard, click **"Settings"** (gear icon) in left sidebar
2. Click **"Database"**
3. Scroll to **"Connection string"**
4. Select **"URI"** tab
5. Copy the connection string - it looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
   ```
6. Replace `[YOUR-PASSWORD]` with the password you chose in Step 1

## Step 3: Update Backend .env File (30 seconds)

Open `backend/.env` and update this line:

```env
DATABASE_URL=postgresql://postgres:YOUR_SUPABASE_PASSWORD@db.xxx.supabase.co:5432/postgres
```

Replace with YOUR actual Supabase connection string from Step 2.

Also set these:
```env
REDIS_URL=
# Leave Redis empty - we'll skip it for MVP
```

## Step 4: Install Backend Dependencies (2 minutes)

Open terminal in the backend folder:

```bash
cd backend
npm install --legacy-peer-deps
```

Wait for installation to complete.

## Step 5: Create Database Tables (30 seconds)

Still in backend folder:

```bash
npm run db:migrate
```

You should see:
```
✅ Database connection successful!
✅ All tables created successfully!
✅ Found 18 tables
```

## Step 6: Add Sample Data (Optional, 20 seconds)

```bash
npm run db:seed
```

This adds:
- 5 sample courses
- 6 learning modules
- 5 active challenges

## Step 7: Start Backend Server (10 seconds)

```bash
npm run dev
```

You should see:
```
Server running on http://localhost:4000
GraphQL endpoint: http://localhost:4000/graphql
Database connected successfully
```

**Keep this terminal open!**

## Step 8: Test It! (1 minute)

### Frontend is already running on http://localhost:3000

1. **Go to http://localhost:3000**
2. **Click "Get Started Free"**
3. **Fill in the signup form:**
   - First Name: John
   - Last Name: Doe
   - Email: john@example.com
   - Username: johndoe
   - Password: password123
4. **Click "Create Account"**

**What happens:**
- Your data is stored in Supabase (cloud PostgreSQL)
- You get a $100,000 virtual portfolio
- You're logged in and redirected to dashboard
- You can now use budget and portfolio simulators!

## ✅ Success Checklist

- ✅ Supabase project created
- ✅ Database URL in backend/.env
- ✅ Backend dependencies installed
- ✅ Database tables created (npm run db:migrate)
- ✅ Backend running on port 4000
- ✅ Frontend running on port 3000
- ✅ Can register new account
- ✅ Can login successfully
- ✅ Dashboard loads after login

## 🎉 You're Done!

Your app is now fully functional with:
- ✅ Cloud database (Supabase PostgreSQL)
- ✅ User authentication
- ✅ Protected routes
- ✅ Budget simulator
- ✅ Portfolio simulator
- ✅ Real data persistence

**No local database installation needed!**

## 🔍 Verify Data in Supabase

1. Go to your Supabase dashboard
2. Click **"Table Editor"** in left sidebar
3. You'll see all 18 tables
4. Click **"users"** table to see registered users
5. Click **"portfolios"** to see the $100k virtual cash

## 🚨 Troubleshooting

### Error: "Database connection failed"

**Fix**: Check DATABASE_URL in `backend/.env`
- Make sure you replaced `[YOUR-PASSWORD]` with actual password
- Make sure no spaces before or after the URL

### Error: "Port 4000 already in use"

**Fix**:
```bash
npx kill-port 4000
npm run dev
```

### Error: "Module not found"

**Fix**:
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

## 📊 What's Stored in Supabase

Everything is stored remotely in Supabase's cloud:
- User accounts
- Virtual portfolios ($100k starting balance)
- Budget configurations
- Expense tracking
- Stock transactions
- Course progress
- Challenge participation

**No data on your computer** - it's all in the cloud!

## 💰 Cost

**FREE** - Supabase free tier includes:
- 500 MB database
- 1 GB file storage
- 2 GB bandwidth
- Unlimited API requests
- No credit card required

Perfect for your MVP and demo!

---

Need help? Check the main [GETTING_STARTED.md](GETTING_STARTED.md) for more details.

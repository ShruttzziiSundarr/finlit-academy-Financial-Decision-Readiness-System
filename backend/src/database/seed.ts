import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

// Use DATABASE_URL if available, otherwise fall back to individual connection params
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'finlit_academy',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
      }
);

async function seed() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // Test connection
    console.log('📡 Testing database connection...');
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful!\n');

    // Check if data already exists
    const existingCourses = await pool.query('SELECT COUNT(*) FROM courses');
    const existingChallenges = await pool.query('SELECT COUNT(*) FROM challenges');

    if (parseInt(existingCourses.rows[0].count) === 0) {
      // Seed Courses
      console.log('📚 Seeding courses...');
      await pool.query(`
        INSERT INTO courses (title, description, difficulty, estimated_minutes, created_at)
        VALUES
          ('Financial Basics 101', 'Learn the fundamentals of personal finance including budgeting, saving, and basic investment concepts.', 'BEGINNER', 30, NOW()),
          ('Investing for Beginners', 'Introduction to stock market investing, understanding stocks, bonds, and portfolio diversification.', 'BEGINNER', 45, NOW()),
          ('Advanced Portfolio Management', 'Learn advanced strategies for portfolio management, risk assessment, and asset allocation.', 'INTERMEDIATE', 60, NOW()),
          ('Understanding Credit', 'Master credit scores, credit cards, loans, and how to manage debt effectively.', 'BEGINNER', 25, NOW()),
          ('Retirement Planning', 'Comprehensive guide to 401(k)s, IRAs, and planning for retirement.', 'INTERMEDIATE', 50, NOW());
      `);
      console.log('✅ Courses seeded!\n');
    } else {
      console.log('ℹ️  Courses already exist, skipping...\n');
    }

    // Seed Modules for courses
    const existingModules = await pool.query('SELECT COUNT(*) FROM modules');
    if (parseInt(existingModules.rows[0].count) === 0) {
      console.log('📖 Seeding course modules...');

      // Get course IDs
      const courses = await pool.query('SELECT id, title FROM courses ORDER BY created_at');

      if (courses.rows.length > 0) {
        const course1 = courses.rows[0]; // Financial Basics 101
        const course2 = courses.rows[1]; // Investing for Beginners

        await pool.query(`
          INSERT INTO modules (course_id, title, content, type, order_index, created_at)
          VALUES
            ($1, 'What is Personal Finance?', 'Personal finance is the process of planning and managing personal financial activities such as income generation, spending, saving, investing, and protection. It involves making informed decisions about money to achieve your financial goals.

Key components include:
- Budgeting: Tracking income and expenses
- Saving: Setting aside money for future needs
- Investing: Growing wealth over time
- Debt Management: Handling loans responsibly
- Risk Management: Protecting assets with insurance

Understanding these basics is the first step toward financial independence.', 'ARTICLE', 1, NOW()),
            ($1, 'Creating Your First Budget', 'A budget is a plan for your money. It helps you track where your money comes from and where it goes. Here is how to create an effective budget:

Step 1: Calculate your total monthly income
Step 2: List all your monthly expenses
Step 3: Categorize expenses (needs vs wants)
Step 4: Set spending limits for each category
Step 5: Track your actual spending
Step 6: Adjust as needed

Popular budgeting methods:
- 50/30/20 Rule: 50% needs, 30% wants, 20% savings
- Zero-Based Budget: Every dollar has a purpose
- Envelope System: Cash in envelopes for each category

Start small and be consistent. Your budget will improve over time!', 'ARTICLE', 2, NOW()),
            ($1, 'The Power of Saving', 'Saving money is crucial for financial security and achieving long-term goals. Here are key strategies to save effectively:

Why Save?
- Emergency fund for unexpected expenses
- Future large purchases (home, car)
- Retirement planning
- Financial freedom and reduced stress

How to Start:
1. Pay yourself first: Save before spending
2. Automate savings: Set up automatic transfers
3. Start with 10% of income
4. Use high-yield savings accounts
5. Track your progress

The compound effect: Small amounts saved regularly can grow significantly over time. Even $50/month can become $30,000+ in 20 years with compound interest!', 'ARTICLE', 3, NOW()),

            ($2, 'Introduction to Stock Market', 'The stock market is where buyers and sellers trade shares of public companies. Understanding the basics is essential for successful investing.

What are Stocks?
Stocks represent ownership in a company. When you buy stock, you become a shareholder with potential for:
- Capital gains (price increases)
- Dividend income (company profits shared)
- Voting rights in company decisions

How Does the Stock Market Work?
- Companies list shares on exchanges (NYSE, NASDAQ)
- Investors buy/sell through brokers
- Prices fluctuate based on supply and demand
- Market opens 9:30 AM - 4:00 PM ET on weekdays

Key Terms:
- Bull Market: Prices rising (positive sentiment)
- Bear Market: Prices falling (negative sentiment)
- Index: Measurement of market performance (S&P 500, Dow Jones)', 'ARTICLE', 1, NOW()),
            ($2, 'Understanding Stock Types', 'Different types of stocks serve different investment goals. Learn about the main categories:

Common Stock:
- Most popular type
- Voting rights
- Variable dividends
- Higher risk, higher potential return

Preferred Stock:
- Fixed dividends
- Priority over common stock
- Limited voting rights
- More stable, lower growth

By Market Cap:
- Large-cap: Established companies ($10B+)
- Mid-cap: Growing companies ($2B-$10B)
- Small-cap: Smaller companies (under $2B)

By Sector:
- Technology, Healthcare, Finance, Energy, etc.
- Diversify across sectors to reduce risk

Growth vs Value:
- Growth stocks: High potential, higher risk
- Value stocks: Undervalued, stable dividends', 'ARTICLE', 2, NOW()),
            ($2, 'Building Your Portfolio', 'Portfolio construction is about balancing risk and return through diversification.

Diversification Principles:
1. Don''t put all eggs in one basket
2. Mix different asset types
3. Spread across sectors and geographies
4. Consider your time horizon
5. Rebalance regularly

Asset Allocation:
The mix of stocks, bonds, and cash based on:
- Age and time horizon
- Risk tolerance
- Financial goals

Example Portfolios:
- Aggressive (age 25): 90% stocks, 10% bonds
- Moderate (age 45): 60% stocks, 40% bonds
- Conservative (age 65): 30% stocks, 70% bonds

Dollar-Cost Averaging:
Invest fixed amounts regularly regardless of price. This reduces the impact of market volatility and removes emotional decision-making.

Remember: Start early, stay consistent, think long-term!', 'ARTICLE', 3, NOW());
        `, [course1.id, course2.id]);

        console.log('✅ Modules seeded!\n');
      }
    } else {
      console.log('ℹ️  Modules already exist, skipping...\n');
    }

    // Note: Budget categories are created automatically when users register
    // See user.service.ts for the default budget setup

    if (parseInt(existingChallenges.rows[0].count) === 0) {
      // Seed Challenges
      console.log('🏆 Seeding challenges...');
      await pool.query(`
        INSERT INTO challenges (title, description, type, difficulty, points, start_date, end_date, status, created_at)
        VALUES
          ('Budget Master Challenge', 'Track your expenses and stay within budget for 30 days', 'BUDGET', 'EASY', 100, NOW(), NOW() + INTERVAL '30 days', 'ACTIVE', NOW()),
          ('Portfolio Builder', 'Build a diversified portfolio worth $25,000 with positive returns', 'INVEST', 'MEDIUM', 250, NOW(), NOW() + INTERVAL '60 days', 'ACTIVE', NOW()),
          ('Trading Pro', 'Execute 20 profitable trades in the stock market simulator', 'INVEST', 'HARD', 500, NOW(), NOW() + INTERVAL '90 days', 'ACTIVE', NOW()),
          ('Savings Sprint', 'Save $5,000 in your virtual account within 2 months', 'SAVE', 'MEDIUM', 200, NOW(), NOW() + INTERVAL '60 days', 'ACTIVE', NOW()),
          ('Quiz Champion', 'Complete all 5 beginner courses and pass all quizzes', 'QUIZ', 'EASY', 150, NOW(), NOW() + INTERVAL '45 days', 'ACTIVE', NOW());
      `);
      console.log('✅ Challenges seeded!\n');
    } else {
      console.log('ℹ️  Challenges already exist, skipping...\n');
    }

    // Count records
    const courseCount = await pool.query('SELECT COUNT(*) FROM courses');
    const moduleCount = await pool.query('SELECT COUNT(*) FROM modules');
    const challengeCount = await pool.query('SELECT COUNT(*) FROM challenges');

    console.log('📊 Seeding Summary:');
    console.log(`   - Courses: ${courseCount.rows[0].count}`);
    console.log(`   - Modules: ${moduleCount.rows[0].count}`);
    console.log(`   - Challenges: ${challengeCount.rows[0].count}`);

    console.log('\n✨ Database seeding completed successfully! ✨');
    console.log('\nYour database now has:');
    console.log('✅ 5 sample courses');
    console.log('✅ 6 learning modules');
    console.log('✅ 5 active challenges');
    console.log('\nNext step: Run npm run dev to start the backend server\n');
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    console.error('\nTroubleshooting:');
    console.error('1. Make sure you ran npm run db:migrate first');
    console.error('2. Check PostgreSQL is running');
    console.error('3. Verify credentials in backend/.env\n');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();

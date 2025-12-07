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
    const challengeCount = await pool.query('SELECT COUNT(*) FROM challenges');

    console.log('📊 Seeding Summary:');
    console.log(`   - Courses: ${courseCount.rows[0].count}`);
    console.log(`   - Challenges: ${challengeCount.rows[0].count}`);

    console.log('\n✨ Database seeding completed successfully! ✨');
    console.log('\nYour database now has:');
    console.log('✅ 5 sample courses');
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

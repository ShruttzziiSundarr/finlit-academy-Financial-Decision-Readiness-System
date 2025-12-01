import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'finlit_academy',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

async function seed() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // Test connection
    console.log('📡 Testing database connection...');
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful!\n');

    // Seed Courses
    console.log('📚 Seeding courses...');
    await pool.query(`
      INSERT INTO courses (id, title, description, difficulty, estimated_minutes, created_at)
      VALUES
        ('course-1', 'Financial Basics 101', 'Learn the fundamentals of personal finance including budgeting, saving, and basic investment concepts.', 'BEGINNER', 30, NOW()),
        ('course-2', 'Investing for Beginners', 'Introduction to stock market investing, understanding stocks, bonds, and portfolio diversification.', 'BEGINNER', 45, NOW()),
        ('course-3', 'Advanced Portfolio Management', 'Learn advanced strategies for portfolio management, risk assessment, and asset allocation.', 'INTERMEDIATE', 60, NOW()),
        ('course-4', 'Understanding Credit', 'Master credit scores, credit cards, loans, and how to manage debt effectively.', 'BEGINNER', 25, NOW()),
        ('course-5', 'Retirement Planning', 'Comprehensive guide to 401(k)s, IRAs, and planning for retirement.', 'INTERMEDIATE', 50, NOW())
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log('✅ Courses seeded!\n');

    // Seed Modules
    console.log('📖 Seeding course modules...');
    await pool.query(`
      INSERT INTO modules (id, course_id, title, content, order_index, duration_minutes, created_at)
      VALUES
        ('module-1-1', 'course-1', 'What is Personal Finance?', 'Personal finance is the process of planning and managing personal financial activities...', 1, 10, NOW()),
        ('module-1-2', 'course-1', 'Creating Your First Budget', 'A budget is a plan for your money. Learn how to create an effective budget...', 2, 10, NOW()),
        ('module-1-3', 'course-1', 'The Power of Saving', 'Discover why saving money is crucial and learn strategies to save effectively...', 3, 10, NOW()),
        ('module-2-1', 'course-2', 'Introduction to Stock Market', 'The stock market is where buyers and sellers trade shares of public companies...', 1, 15, NOW()),
        ('module-2-2', 'course-2', 'Understanding Stock Types', 'Learn about common stock, preferred stock, and different equity classifications...', 2, 15, NOW()),
        ('module-2-3', 'course-2', 'Building Your Portfolio', 'Portfolio construction principles and diversification strategies...', 3, 15, NOW())
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log('✅ Modules seeded!\n');

    // Seed Challenges
    console.log('🏆 Seeding challenges...');
    await pool.query(`
      INSERT INTO challenges (id, title, description, type, difficulty, points, start_date, end_date, status, created_at)
      VALUES
        ('challenge-1', 'Budget Master Challenge', 'Track your expenses and stay within budget for 30 days', 'BUDGET', 'EASY', 100, NOW(), NOW() + INTERVAL '30 days', 'ACTIVE', NOW()),
        ('challenge-2', 'Portfolio Builder', 'Build a diversified portfolio worth $25,000 with positive returns', 'PORTFOLIO', 'MEDIUM', 250, NOW(), NOW() + INTERVAL '60 days', 'ACTIVE', NOW()),
        ('challenge-3', 'Trading Pro', 'Execute 20 profitable trades in the stock market simulator', 'PORTFOLIO', 'HARD', 500, NOW(), NOW() + INTERVAL '90 days', 'ACTIVE', NOW()),
        ('challenge-4', 'Savings Sprint', 'Save $5,000 in your virtual account within 2 months', 'BUDGET', 'MEDIUM', 200, NOW(), NOW() + INTERVAL '60 days', 'ACTIVE', NOW()),
        ('challenge-5', 'Course Completion Marathon', 'Complete all 5 beginner courses and pass all quizzes', 'LEARNING', 'EASY', 150, NOW(), NOW() + INTERVAL '45 days', 'ACTIVE', NOW())
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log('✅ Challenges seeded!\n');

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

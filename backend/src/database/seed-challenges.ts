import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

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

async function seedChallenges() {
  console.log('⚔️  SEEDING BATTLE ARENA CHALLENGES...\n');

  try {
    // Test connection
    console.log('📡 Testing database connection...');
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful!\n');

    // Create challenges table if it doesn't exist
    console.log('🏗️  Creating challenges table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS challenges (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        type VARCHAR(50) NOT NULL,
        difficulty VARCHAR(50) NOT NULL,
        points INTEGER NOT NULL,
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP NOT NULL,
        status VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create challenge_participants table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS challenge_participants (
        id SERIAL PRIMARY KEY,
        challenge_id INTEGER REFERENCES challenges(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        score INTEGER DEFAULT 0,
        completed_at TIMESTAMP,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(challenge_id, user_id)
      )
    `);
    console.log('✅ Tables created successfully!\n');

    // Clear existing challenges (for development)
    await pool.query('DELETE FROM challenge_participants');
    await pool.query('DELETE FROM challenges');
    console.log('🗑️  Cleared existing challenges\n');

    // Seed Active Challenges
    console.log('⚔️  Creating ACTIVE battles...');
    const activeChallenges = [
      {
        title: '30-Day Budget Master Challenge',
        description: 'Stay within your budget for 30 consecutive days. Track every expense and prove your discipline!',
        type: 'BUDGET',
        difficulty: 'MEDIUM',
        points: 500,
        status: 'ACTIVE',
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Started 7 days ago
        endDate: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000), // Ends in 23 days
      },
      {
        title: 'Stock Market Warrior - Week 1',
        description: 'Make 5 profitable trades this week. Beat the market and claim victory!',
        type: 'INVEST',
        difficulty: 'HARD',
        points: 750,
        status: 'ACTIVE',
        startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Emergency Fund Sprint',
        description: 'Save $1,000 in your emergency fund within 14 days. Small victories lead to big wins!',
        type: 'SAVE',
        difficulty: 'EASY',
        points: 300,
        status: 'ACTIVE',
        startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Financial Literacy Quiz Battle',
        description: 'Test your knowledge! Answer 50 financial literacy questions and score 80%+ to win.',
        type: 'QUIZ',
        difficulty: 'MEDIUM',
        points: 400,
        status: 'ACTIVE',
        startDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      },
    ];

    for (const challenge of activeChallenges) {
      await pool.query(
        `INSERT INTO challenges (title, description, type, difficulty, points, start_date, end_date, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          challenge.title,
          challenge.description,
          challenge.type,
          challenge.difficulty,
          challenge.points,
          challenge.startDate,
          challenge.endDate,
          challenge.status,
        ]
      );
      console.log(`  ✅ ${challenge.title}`);
    }

    // Seed Upcoming Challenges
    console.log('\n🔮 Creating UPCOMING battles...');
    const upcomingChallenges = [
      {
        title: 'Debt Destroyer Marathon',
        description: 'Create and execute a debt payoff plan. Eliminate $500 of debt this month!',
        type: 'SAVE',
        difficulty: 'HARD',
        points: 1000,
        status: 'UPCOMING',
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Investment Diversification Challenge',
        description: 'Build a balanced portfolio across 5+ different sectors. Become a true investor!',
        type: 'INVEST',
        difficulty: 'MEDIUM',
        points: 600,
        status: 'UPCOMING',
        startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 24 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Zero-Waste Budget Week',
        description: 'Spend ZERO on non-essentials for 7 days. Extreme discipline = extreme rewards!',
        type: 'BUDGET',
        difficulty: 'HARD',
        points: 800,
        status: 'UPCOMING',
        startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      },
    ];

    for (const challenge of upcomingChallenges) {
      await pool.query(
        `INSERT INTO challenges (title, description, type, difficulty, points, start_date, end_date, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          challenge.title,
          challenge.description,
          challenge.type,
          challenge.difficulty,
          challenge.points,
          challenge.startDate,
          challenge.endDate,
          challenge.status,
        ]
      );
      console.log(`  ✅ ${challenge.title}`);
    }

    // Seed Completed Challenges
    console.log('\n🏆 Creating COMPLETED battles...');
    const completedChallenges = [
      {
        title: 'First Steps Financial Quiz',
        description: 'Complete the beginner financial literacy quiz with 70%+ score.',
        type: 'QUIZ',
        difficulty: 'EASY',
        points: 200,
        status: 'COMPLETED',
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Weekly Savings Champion',
        description: 'Save $100 per week for 4 consecutive weeks.',
        type: 'SAVE',
        difficulty: 'EASY',
        points: 250,
        status: 'COMPLETED',
        startDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    ];

    for (const challenge of completedChallenges) {
      await pool.query(
        `INSERT INTO challenges (title, description, type, difficulty, points, start_date, end_date, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          challenge.title,
          challenge.description,
          challenge.type,
          challenge.difficulty,
          challenge.points,
          challenge.startDate,
          challenge.endDate,
          challenge.status,
        ]
      );
      console.log(`  ✅ ${challenge.title}`);
    }

    console.log('\n✨ BATTLE ARENA SEEDING COMPLETED! ✨');
    console.log('\n📊 Summary:');
    console.log(`   - ${activeChallenges.length} ACTIVE battles ready to join`);
    console.log(`   - ${upcomingChallenges.length} UPCOMING battles on the horizon`);
    console.log(`   - ${completedChallenges.length} COMPLETED battles for reference`);
    console.log('\n🎮 Users can now join battles and compete for glory!\n');

  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    console.error('\nTroubleshooting:');
    console.error('1. Check PostgreSQL is running');
    console.error('2. Verify credentials in backend/.env');
    console.error('3. Ensure users table exists (run db:migrate first)\n');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedChallenges();

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

async function seedBossBattles() {
  console.log('🐉 SEEDING FINANCIAL BOSS BATTLES...\n');

  try {
    console.log('📡 Testing database connection...');
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful!\n');

    // Create boss_battles table
    console.log('🏗️  Creating boss_battles table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS boss_battles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        topic VARCHAR(100) NOT NULL,
        difficulty VARCHAR(50) NOT NULL,
        max_health INTEGER NOT NULL,
        damage_per_correct INTEGER NOT NULL,
        total_questions INTEGER NOT NULL,
        reward_points INTEGER NOT NULL,
        avatar_url TEXT,
        personality TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create user_boss_battles table (tracks user progress)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_boss_battles (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        boss_id INTEGER REFERENCES boss_battles(id) ON DELETE CASCADE,
        current_health INTEGER NOT NULL,
        questions_asked INTEGER DEFAULT 0,
        questions_correct INTEGER DEFAULT 0,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,
        status VARCHAR(50) DEFAULT 'IN_PROGRESS',
        conversation_history JSONB DEFAULT '[]',
        UNIQUE(user_id, boss_id, completed_at)
      )
    `);

    // Create boss_achievements table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS boss_achievements (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        boss_id INTEGER REFERENCES boss_battles(id) ON DELETE CASCADE,
        defeated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        final_score INTEGER NOT NULL,
        time_taken INTEGER NOT NULL,
        UNIQUE(user_id, boss_id)
      )
    `);

    console.log('✅ Tables created successfully!\n');

    // Clear existing bosses
    await pool.query('DELETE FROM boss_achievements');
    await pool.query('DELETE FROM user_boss_battles');
    await pool.query('DELETE FROM boss_battles');
    console.log('🗑️  Cleared existing boss battles\n');

    // Seed Boss Characters
    console.log('🐉 Creating legendary financial bosses...\n');

    const bosses = [
      {
        name: 'Budget Dragon',
        title: 'Guardian of Spending Discipline',
        description: 'A fierce dragon who hoards knowledge about budgeting and expense tracking. Defeat them to master the art of budget management!',
        topic: 'BUDGETING',
        difficulty: 'EASY',
        maxHealth: 100,
        damagePerCorrect: 20,
        totalQuestions: 5,
        rewardPoints: 300,
        avatarUrl: '🐉',
        personality: 'Wise and patient, but strict about financial discipline. Loves to test knowledge with practical budgeting scenarios.',
      },
      {
        name: 'Investment Wizard',
        title: 'Master of Market Magic',
        description: 'A mystical wizard who sees the future of markets. Prove your investment knowledge to unlock their ancient secrets!',
        topic: 'INVESTING',
        difficulty: 'MEDIUM',
        maxHealth: 150,
        damagePerCorrect: 30,
        totalQuestions: 5,
        rewardPoints: 500,
        avatarUrl: '🧙‍♂️',
        personality: 'Cryptic and mysterious, speaks in market metaphors. Tests deep understanding of stocks, bonds, and portfolio management.',
      },
      {
        name: 'Debt Demon',
        title: 'Crusher of Credit Scores',
        description: 'An evil demon that feeds on debt and poor credit decisions. Banish them by mastering debt management strategies!',
        topic: 'DEBT_MANAGEMENT',
        difficulty: 'HARD',
        maxHealth: 200,
        damagePerCorrect: 40,
        totalQuestions: 5,
        rewardPoints: 750,
        avatarUrl: '👹',
        personality: 'Aggressive and challenging, tries to trick users into bad financial decisions. Tests advanced debt payoff strategies.',
      },
      {
        name: 'Savings Sorcerer',
        title: 'Keeper of Emergency Funds',
        description: 'A benevolent sorcerer who guards the secrets of building wealth through savings. Learn from their wisdom!',
        topic: 'SAVINGS',
        difficulty: 'EASY',
        maxHealth: 100,
        damagePerCorrect: 20,
        totalQuestions: 5,
        rewardPoints: 300,
        avatarUrl: '🧙‍♀️',
        personality: 'Encouraging and supportive, teaches the importance of emergency funds and long-term savings strategies.',
      },
      {
        name: 'Tax Titan',
        title: 'Lord of Deductions',
        description: 'A massive titan who knows every tax law and deduction. Defeat them to become a tax strategy expert!',
        topic: 'TAXES',
        difficulty: 'HARD',
        maxHealth: 200,
        damagePerCorrect: 40,
        totalQuestions: 5,
        rewardPoints: 800,
        avatarUrl: '⚡',
        personality: 'Formal and precise, speaks in tax code. Tests knowledge of deductions, credits, and tax-efficient strategies.',
      },
      {
        name: 'Crypto Knight',
        title: 'Protector of the Blockchain',
        description: 'A futuristic knight wielding the power of cryptocurrency. Master blockchain basics to claim victory!',
        topic: 'CRYPTOCURRENCY',
        difficulty: 'MEDIUM',
        maxHealth: 150,
        damagePerCorrect: 30,
        totalQuestions: 5,
        rewardPoints: 600,
        avatarUrl: '🤖',
        personality: 'Tech-savvy and modern, speaks about DeFi and blockchain. Tests understanding of crypto fundamentals and risks.',
      },
      {
        name: 'Retirement Reaper',
        title: 'Harbinger of Future Planning',
        description: 'A mysterious reaper who controls time and retirement futures. Prove your long-term planning skills!',
        topic: 'RETIREMENT',
        difficulty: 'MEDIUM',
        maxHealth: 150,
        damagePerCorrect: 30,
        totalQuestions: 5,
        rewardPoints: 550,
        avatarUrl: '💀',
        personality: 'Philosophical and forward-thinking, emphasizes compound interest and 401k strategies.',
      },
      {
        name: 'Credit Card Chaos',
        title: 'Emperor of Interest Rates',
        description: 'A chaotic entity born from credit card debt. Defeat them by mastering credit card management!',
        topic: 'CREDIT',
        difficulty: 'EASY',
        maxHealth: 100,
        damagePerCorrect: 20,
        totalQuestions: 5,
        rewardPoints: 350,
        avatarUrl: '💳',
        personality: 'Fast-paced and tricky, tries to confuse with APR calculations. Tests credit score knowledge and responsible usage.',
      },
    ];

    for (const boss of bosses) {
      await pool.query(
        `INSERT INTO boss_battles (
          name, title, description, topic, difficulty,
          max_health, damage_per_correct, total_questions,
          reward_points, avatar_url, personality
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          boss.name,
          boss.title,
          boss.description,
          boss.topic,
          boss.difficulty,
          boss.maxHealth,
          boss.damagePerCorrect,
          boss.totalQuestions,
          boss.rewardPoints,
          boss.avatarUrl,
          boss.personality,
        ]
      );
      console.log(`  ✅ ${boss.avatarUrl} ${boss.name} - ${boss.title}`);
    }

    console.log('\n✨ BOSS BATTLES SEEDING COMPLETED! ✨');
    console.log('\n📊 Summary:');
    console.log(`   - ${bosses.length} legendary bosses created`);
    console.log(`   - Topics: Budgeting, Investing, Debt, Savings, Taxes, Crypto, Retirement, Credit`);
    console.log(`   - Difficulties: ${bosses.filter(b => b.difficulty === 'EASY').length} Easy, ${bosses.filter(b => b.difficulty === 'MEDIUM').length} Medium, ${bosses.filter(b => b.difficulty === 'HARD').length} Hard`);
    console.log('\n🎮 Users can now battle financial bosses and earn legendary rewards!\n');

  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedBossBattles();

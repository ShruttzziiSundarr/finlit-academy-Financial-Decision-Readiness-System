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

async function addBudgetCategories() {
  console.log('🔧 Adding budget categories to existing users...\n');

  try {
    // Test connection
    console.log('📡 Testing database connection...');
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful!\n');

    // Get all budgets that don't have categories
    const budgetsResult = await pool.query(`
      SELECT b.id, b.user_id, u.email
      FROM budgets b
      JOIN users u ON b.user_id = u.id
      LEFT JOIN budget_categories bc ON bc.budget_id = b.id
      GROUP BY b.id, b.user_id, u.email
      HAVING COUNT(bc.id) = 0
    `);

    if (budgetsResult.rows.length === 0) {
      console.log('✅ All budgets already have categories!\n');
      return;
    }

    console.log(`📊 Found ${budgetsResult.rows.length} budget(s) without categories\n`);

    for (const budget of budgetsResult.rows) {
      console.log(`  Adding categories for user: ${budget.email}`);

      await pool.query(
        `INSERT INTO budget_categories (budget_id, name, allocated_amount, color, icon)
         VALUES
           ($1, 'Housing', 1200, '#3b82f6', '🏠'),
           ($1, 'Food & Groceries', 500, '#10b981', '🛒'),
           ($1, 'Transportation', 300, '#f59e0b', '🚗'),
           ($1, 'Utilities', 200, '#8b5cf6', '💡'),
           ($1, 'Entertainment', 250, '#ec4899', '🎮'),
           ($1, 'Healthcare', 150, '#14b8a6', '⚕️'),
           ($1, 'Savings', 400, '#6366f1', '💎'),
           ($1, 'Other', 100, '#64748b', '📦')`,
        [budget.id]
      );

      console.log(`  ✅ Added 8 categories for ${budget.email}`);
    }

    // Update budget totals
    console.log('\n💰 Updating budget totals...');
    await pool.query(`
      UPDATE budgets
      SET total_income = 5000,
          savings_goal = 1000
      WHERE total_income = 0
    `);

    console.log('\n✨ Migration completed successfully! ✨');
    console.log(`\n📊 Summary:`);
    console.log(`   - Updated ${budgetsResult.rows.length} budget(s)`);
    console.log(`   - Added 8 categories to each budget`);
    console.log(`   - Set default income to $5,000`);
    console.log(`   - Set default savings goal to $1,000\n`);

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    console.error('\nTroubleshooting:');
    console.error('1. Check PostgreSQL is running');
    console.error('2. Verify credentials in backend/.env');
    console.error('3. Make sure database schema is up to date\n');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

addBudgetCategories();

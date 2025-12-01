import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'finlit_academy',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

async function migrate() {
  console.log('🚀 Starting database migration...\n');

  try {
    // Test connection
    console.log('📡 Testing database connection...');
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful!\n');

    // Read schema file
    console.log('📖 Reading schema.sql...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    console.log('✅ Schema file loaded!\n');

    // Execute schema
    console.log('🔨 Creating tables...');
    await pool.query(schema);
    console.log('✅ All tables created successfully!\n');

    // Verify tables
    console.log('🔍 Verifying tables...');
    const result = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log(`✅ Found ${result.rows.length} tables:\n`);
    result.rows.forEach((row) => {
      console.log(`   - ${row.table_name}`);
    });

    console.log('\n✨ Migration completed successfully! ✨');
    console.log('\nNext steps:');
    console.log('1. Run: npm run db:seed (to add sample data)');
    console.log('2. Run: npm run dev (to start the backend server)\n');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    console.error('\nTroubleshooting:');
    console.error('1. Check PostgreSQL is running');
    console.error('2. Verify credentials in backend/.env');
    console.error('3. Ensure database "finlit_academy" exists');
    console.error('4. Run: createdb finlit_academy\n');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();

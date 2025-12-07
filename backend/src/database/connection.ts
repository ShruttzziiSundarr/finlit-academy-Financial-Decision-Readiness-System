import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { logger } from '../utils/logger';

dotenv.config();

export const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
        ssl: { rejectUnauthorized: false },
      }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'finlit_academy',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      }
);

pool.on('error', (err) => {
  logger.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export async function connectDatabase(): Promise<void> {
  try {
    const client = await pool.connect();
    logger.info('Database connection established successfully');
    logger.info(`Connected to ${process.env.DB_NAME || 'finlit_academy'} on ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}`);
    client.release();
  } catch (error) {
    logger.error('Failed to connect to database:', error);
    logger.error('Please check:');
    logger.error('1. PostgreSQL is running');
    logger.error('2. Database credentials in .env are correct');
    logger.error('3. Database exists and is accessible');
    throw error;
  }
}

export async function query(text: string, params?: any[]) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  logger.debug('Executed query', { text, duration, rows: res.rowCount });
  return res;
}

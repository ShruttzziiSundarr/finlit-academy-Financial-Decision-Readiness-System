import bcrypt from 'bcryptjs';
import { query } from '../database/connection';
import { generateToken, generateRefreshToken, verifyRefreshToken } from '../middleware/auth';
import { UserInputError, AuthenticationError } from 'apollo-server-express';
import { logger } from '../utils/logger';

interface RegisterInput {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface LoginInput {
  email: string;
  password: string;
}

export class UserService {
  async register(input: RegisterInput) {
    try {
      // Validate input
      if (!input.email || !input.username || !input.password) {
        throw new UserInputError('Missing required fields');
      }

      // Check if user exists
      const existingUser = await query(
        'SELECT id FROM users WHERE email = $1 OR username = $2',
        [input.email, input.username]
      );

      if (existingUser.rows.length > 0) {
        throw new UserInputError('User already exists');
      }

      // Hash password
      const passwordHash = await bcrypt.hash(input.password, 10);

      // Create user
      const result = await query(
        `INSERT INTO users (email, username, password_hash, first_name, last_name)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, email, username, first_name, last_name, created_at, updated_at`,
        [input.email, input.username, passwordHash, input.firstName, input.lastName]
      );

      const user = result.rows[0];

      // Initialize user progress
      await query(
        'INSERT INTO user_progress (user_id) VALUES ($1)',
        [user.id]
      );

      // Create initial portfolio
      await query(
        'INSERT INTO portfolios (user_id) VALUES ($1)',
        [user.id]
      );

      // Create initial budget
      const budgetResult = await query(
        'INSERT INTO budgets (user_id, name, total_income, savings_goal) VALUES ($1, $2, $3, $4) RETURNING id',
        [user.id, 'My Budget', 5000, 1000]
      );

      const budgetId = budgetResult.rows[0].id;

      // Create default budget categories
      await query(
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
        [budgetId]
      );

      // Generate tokens
      const token = generateToken({ userId: user.id, email: user.email });
      const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

      logger.info(`New user registered: ${user.email}`);

      return {
        token,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.first_name,
          lastName: user.last_name,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
        },
      };
    } catch (error) {
      logger.error('Registration error:', error);
      throw error;
    }
  }

  async login(input: LoginInput) {
    try {
      // Find user
      const result = await query(
        'SELECT id, email, username, password_hash, first_name, last_name, created_at, updated_at FROM users WHERE email = $1',
        [input.email]
      );

      if (result.rows.length === 0) {
        throw new AuthenticationError('Invalid credentials');
      }

      const user = result.rows[0];

      // Verify password
      const validPassword = await bcrypt.compare(input.password, user.password_hash);
      if (!validPassword) {
        throw new AuthenticationError('Invalid credentials');
      }

      // Generate tokens
      const token = generateToken({ userId: user.id, email: user.email });
      const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

      logger.info(`User logged in: ${user.email}`);

      return {
        token,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.first_name,
          lastName: user.last_name,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
        },
      };
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  async getUserById(userId: string) {
    try {
      const result = await query(
        'SELECT id, email, username, first_name, last_name, avatar, created_at, updated_at FROM users WHERE id = $1',
        [userId]
      );

      if (result.rows.length === 0) {
        throw new UserInputError('User not found');
      }

      const user = result.rows[0];
      return {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        avatar: user.avatar,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      };
    } catch (error) {
      logger.error('Get user error:', error);
      throw error;
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = verifyRefreshToken(refreshToken);

      // Generate new tokens
      const newToken = generateToken({ userId: payload.userId, email: payload.email });
      const newRefreshToken = generateRefreshToken({ userId: payload.userId, email: payload.email });

      // Get user data
      const user = await this.getUserById(payload.userId);

      return {
        token: newToken,
        refreshToken: newRefreshToken,
        user,
      };
    } catch (error) {
      logger.error('Refresh token error:', error);
      throw error;
    }
  }
}

import { query } from '../database/connection';
import { UserInputError } from 'apollo-server-express';
import { logger } from '../utils/logger';

export class BudgetService {
  async getBudget(userId: string) {
    try {
      const budgetResult = await query(
        'SELECT * FROM budgets WHERE user_id = $1',
        [userId]
      );

      if (budgetResult.rows.length === 0) {
        throw new UserInputError('Budget not found');
      }

      const budget = budgetResult.rows[0];

      const categoriesResult = await query(
        'SELECT * FROM budget_categories WHERE budget_id = $1',
        [budget.id]
      );

      const categories = await Promise.all(
        categoriesResult.rows.map(async (category) => {
          const expensesResult = await query(
            'SELECT SUM(amount) as total FROM expenses WHERE category_id = $1',
            [category.id]
          );

          const spentAmount = parseFloat(expensesResult.rows[0].total || '0');

          return {
            id: category.id,
            name: category.name,
            allocatedAmount: parseFloat(category.allocated_amount),
            spentAmount,
            color: category.color,
            icon: category.icon,
          };
        })
      );

      const expensesResult = await query(
        `SELECT e.* FROM expenses e
         JOIN budget_categories bc ON e.category_id = bc.id
         WHERE bc.budget_id = $1
         ORDER BY e.date DESC LIMIT 100`,
        [budget.id]
      );

      return {
        id: budget.id,
        userId: budget.user_id,
        name: budget.name,
        totalIncome: parseFloat(budget.total_income),
        categories,
        expenses: expensesResult.rows.map(e => ({
          id: e.id,
          categoryId: e.category_id,
          description: e.description,
          amount: parseFloat(e.amount),
          date: e.date,
          recurring: e.recurring,
          frequency: e.frequency,
        })),
        savingsGoal: parseFloat(budget.savings_goal),
        currentSavings: parseFloat(budget.current_savings),
      };
    } catch (error) {
      logger.error('Get budget error:', error);
      throw error;
    }
  }

  async createExpense(userId: string, input: any) {
    try {
      const result = await query(
        `INSERT INTO expenses (category_id, description, amount, date, recurring, frequency)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [input.categoryId, input.description, input.amount, input.date, input.recurring, input.frequency]
      );

      return {
        id: result.rows[0].id,
        categoryId: result.rows[0].category_id,
        description: result.rows[0].description,
        amount: parseFloat(result.rows[0].amount),
        date: result.rows[0].date,
        recurring: result.rows[0].recurring,
        frequency: result.rows[0].frequency,
      };
    } catch (error) {
      logger.error('Create expense error:', error);
      throw error;
    }
  }

  async updateExpense(id: string, input: any) {
    try {
      const result = await query(
        `UPDATE expenses
         SET description = $1, amount = $2, date = $3, recurring = $4, frequency = $5
         WHERE id = $6
         RETURNING *`,
        [input.description, input.amount, input.date, input.recurring, input.frequency, id]
      );

      if (result.rows.length === 0) {
        throw new UserInputError('Expense not found');
      }

      return {
        id: result.rows[0].id,
        categoryId: result.rows[0].category_id,
        description: result.rows[0].description,
        amount: parseFloat(result.rows[0].amount),
        date: result.rows[0].date,
        recurring: result.rows[0].recurring,
        frequency: result.rows[0].frequency,
      };
    } catch (error) {
      logger.error('Update expense error:', error);
      throw error;
    }
  }

  async deleteExpense(id: string) {
    try {
      const result = await query('DELETE FROM expenses WHERE id = $1', [id]);
      return result.rowCount > 0;
    } catch (error) {
      logger.error('Delete expense error:', error);
      throw error;
    }
  }
}

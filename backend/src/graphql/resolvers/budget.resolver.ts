import { BudgetService } from '../../services/budget.service';
import { AuthenticationError } from 'apollo-server-express';

const budgetService = new BudgetService();

export const budgetResolvers = {
  Query: {
    budget: async (_: any, __: any, context: any) => {
      if (!context.user) {
        throw new AuthenticationError('Not authenticated');
      }
      return budgetService.getBudget(context.user.userId);
    },
  },
  Mutation: {
    createExpense: async (_: any, { input }: any, context: any) => {
      if (!context.user) {
        throw new AuthenticationError('Not authenticated');
      }
      return budgetService.createExpense(context.user.userId, input);
    },
    updateExpense: async (_: any, { id, input }: any, context: any) => {
      if (!context.user) {
        throw new AuthenticationError('Not authenticated');
      }
      return budgetService.updateExpense(id, input);
    },
    deleteExpense: async (_: any, { id }: { id: string }, context: any) => {
      if (!context.user) {
        throw new AuthenticationError('Not authenticated');
      }
      return budgetService.deleteExpense(id);
    },
  },
};

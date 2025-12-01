import { PortfolioService } from '../../services/portfolio.service';
import { AuthenticationError } from 'apollo-server-express';

const portfolioService = new PortfolioService();

export const portfolioResolvers = {
  Query: {
    portfolio: async (_: any, __: any, context: any) => {
      if (!context.user) {
        throw new AuthenticationError('Not authenticated');
      }
      return portfolioService.getPortfolio(context.user.userId);
    },
    stockQuote: async (_: any, { symbol }: { symbol: string }) => {
      return portfolioService.getStockQuote(symbol);
    },
    searchStocks: async (_: any, { query }: { query: string }) => {
      return portfolioService.searchStocks(query);
    },
    marketNews: async (_: any, { limit = 10 }: { limit?: number }) => {
      return portfolioService.getMarketNews(limit);
    },
  },
  Mutation: {
    executeTrade: async (_: any, { input }: any, context: any) => {
      if (!context.user) {
        throw new AuthenticationError('Not authenticated');
      }
      const transaction = await portfolioService.executeTrade(
        context.user.userId,
        input
      );

      // Emit real-time update via Socket.IO
      context.io.to(`user-${context.user.userId}`).emit('portfolio-updated');

      return transaction;
    },
  },
  Subscription: {
    portfolioUpdated: {
      subscribe: (_: any, { userId }: { userId: string }, context: any) => {
        // Implementation would use PubSub for real-time updates
        return context.pubsub.asyncIterator([`PORTFOLIO_UPDATED_${userId}`]);
      },
    },
  },
};

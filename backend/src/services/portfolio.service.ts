import { query } from '../database/connection';
import { UserInputError } from 'apollo-server-express';
import { logger } from '../utils/logger';
import { cacheGet, cacheSet } from '../config/redis';
import axios from 'axios';

interface TradeInput {
  symbol: string;
  shares: number;
  type: 'BUY' | 'SELL';
}

export class PortfolioService {
  async getPortfolio(userId: string) {
    try {
      // Get portfolio
      const portfolioResult = await query(
        'SELECT * FROM portfolios WHERE user_id = $1',
        [userId]
      );

      if (portfolioResult.rows.length === 0) {
        throw new UserInputError('Portfolio not found');
      }

      const portfolio = portfolioResult.rows[0];

      // Get holdings
      const holdingsResult = await query(
        'SELECT * FROM holdings WHERE portfolio_id = $1',
        [portfolio.id]
      );

      // Get current prices and calculate values
      const holdings = await Promise.all(
        holdingsResult.rows.map(async (holding) => {
          const quote = await this.getStockQuote(holding.symbol);
          const totalValue = holding.shares * quote.price;
          const gainLoss = totalValue - (holding.shares * holding.avg_cost_per_share);
          const gainLossPercent = (gainLoss / (holding.shares * holding.avg_cost_per_share)) * 100;

          return {
            id: holding.id,
            symbol: holding.symbol,
            name: holding.name,
            shares: parseFloat(holding.shares),
            avgCostPerShare: parseFloat(holding.avg_cost_per_share),
            currentPrice: quote.price,
            totalValue,
            gainLoss,
            gainLossPercent,
          };
        })
      );

      // Calculate total portfolio value
      const holdingsValue = holdings.reduce((sum, h) => sum + h.totalValue, 0);
      const totalValue = holdingsValue + parseFloat(portfolio.cash_balance);

      // Get transactions
      const transactionsResult = await query(
        'SELECT * FROM transactions WHERE portfolio_id = $1 ORDER BY timestamp DESC LIMIT 50',
        [portfolio.id]
      );

      // Get historical data
      const historicalResult = await query(
        'SELECT * FROM portfolio_history WHERE portfolio_id = $1 ORDER BY date DESC LIMIT 30',
        [portfolio.id]
      );

      const previousValue = historicalResult.rows.length > 1
        ? parseFloat(historicalResult.rows[1].total_value)
        : totalValue;

      const dailyChange = totalValue - previousValue;
      const dailyChangePercent = (dailyChange / previousValue) * 100;

      const initialValue = 100000; // Starting virtual capital
      const totalGainLoss = totalValue - initialValue;
      const totalGainLossPercent = (totalGainLoss / initialValue) * 100;

      return {
        id: portfolio.id,
        userId: portfolio.user_id,
        totalValue,
        cashBalance: parseFloat(portfolio.cash_balance),
        holdings,
        transactions: transactionsResult.rows.map(t => ({
          id: t.id,
          type: t.type,
          symbol: t.symbol,
          shares: parseFloat(t.shares),
          pricePerShare: parseFloat(t.price_per_share),
          totalAmount: parseFloat(t.total_amount),
          timestamp: t.timestamp,
        })),
        performanceData: {
          totalGainLoss,
          totalGainLossPercent,
          dailyChange,
          dailyChangePercent,
          historicalData: historicalResult.rows.map(h => ({
            date: h.date,
            value: parseFloat(h.total_value),
          })),
        },
      };
    } catch (error) {
      logger.error('Get portfolio error:', error);
      throw error;
    }
  }

  async getStockQuote(symbol: string) {
    try {
      // Check cache first
      const cacheKey = `stock:${symbol}`;
      const cached = await cacheGet(cacheKey);
      if (cached) {
        return cached;
      }

      // Fetch from Alpha Vantage API
      const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
      const response = await axios.get(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`
      );

      const data = response.data['Global Quote'];
      if (!data) {
        throw new UserInputError('Stock symbol not found');
      }

      const quote = {
        symbol: data['01. symbol'],
        name: symbol, // In production, fetch company name separately
        price: parseFloat(data['05. price']),
        change: parseFloat(data['09. change']),
        changePercent: parseFloat(data['10. change percent'].replace('%', '')),
        volume: parseInt(data['06. volume']),
        marketCap: 0, // Would need separate API call
        dayHigh: parseFloat(data['03. high']),
        dayLow: parseFloat(data['04. low']),
        yearHigh: 0, // Would need historical data
        yearLow: 0,
      };

      // Cache for 1 minute
      await cacheSet(cacheKey, quote, 60);

      return quote;
    } catch (error) {
      logger.error('Get stock quote error:', error);
      // Return mock data for demo purposes
      return {
        symbol,
        name: symbol,
        price: 100 + Math.random() * 50,
        change: -5 + Math.random() * 10,
        changePercent: -2 + Math.random() * 4,
        volume: 1000000,
        marketCap: 10000000000,
        dayHigh: 105,
        dayLow: 95,
        yearHigh: 150,
        yearLow: 80,
      };
    }
  }

  async searchStocks(searchQuery: string) {
    try {
      const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
      const response = await axios.get(
        `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${searchQuery}&apikey=${apiKey}`
      );

      const matches = response.data.bestMatches || [];
      return matches.slice(0, 10).map((match: any) => ({
        symbol: match['1. symbol'],
        name: match['2. name'],
        price: 0, // Would need separate quote call
        change: 0,
        changePercent: 0,
        volume: 0,
        marketCap: 0,
        dayHigh: 0,
        dayLow: 0,
        yearHigh: 0,
        yearLow: 0,
      }));
    } catch (error) {
      logger.error('Search stocks error:', error);
      return [];
    }
  }

  async getMarketNews(limit: number = 10) {
    try {
      // In production, integrate with news API
      // For now, return mock data
      return [];
    } catch (error) {
      logger.error('Get market news error:', error);
      return [];
    }
  }

  async executeTrade(userId: string, input: TradeInput) {
    try {
      // Get portfolio
      const portfolioResult = await query(
        'SELECT * FROM portfolios WHERE user_id = $1',
        [userId]
      );

      if (portfolioResult.rows.length === 0) {
        throw new UserInputError('Portfolio not found');
      }

      const portfolio = portfolioResult.rows[0];

      // Get current stock price
      const quote = await this.getStockQuote(input.symbol);
      const totalAmount = input.shares * quote.price;

      if (input.type === 'BUY') {
        // Check if enough cash
        if (parseFloat(portfolio.cash_balance) < totalAmount) {
          throw new UserInputError('Insufficient funds');
        }

        // Update cash balance
        await query(
          'UPDATE portfolios SET cash_balance = cash_balance - $1 WHERE id = $2',
          [totalAmount, portfolio.id]
        );

        // Update or create holding
        const holdingResult = await query(
          'SELECT * FROM holdings WHERE portfolio_id = $1 AND symbol = $2',
          [portfolio.id, input.symbol]
        );

        if (holdingResult.rows.length > 0) {
          const holding = holdingResult.rows[0];
          const newShares = parseFloat(holding.shares) + input.shares;
          const newAvgCost = ((parseFloat(holding.avg_cost_per_share) * parseFloat(holding.shares)) +
            (quote.price * input.shares)) / newShares;

          await query(
            'UPDATE holdings SET shares = $1, avg_cost_per_share = $2 WHERE id = $3',
            [newShares, newAvgCost, holding.id]
          );
        } else {
          await query(
            'INSERT INTO holdings (portfolio_id, symbol, name, shares, avg_cost_per_share) VALUES ($1, $2, $3, $4, $5)',
            [portfolio.id, input.symbol, quote.name, input.shares, quote.price]
          );
        }
      } else {
        // SELL
        const holdingResult = await query(
          'SELECT * FROM holdings WHERE portfolio_id = $1 AND symbol = $2',
          [portfolio.id, input.symbol]
        );

        if (holdingResult.rows.length === 0) {
          throw new UserInputError('Stock not owned');
        }

        const holding = holdingResult.rows[0];
        if (parseFloat(holding.shares) < input.shares) {
          throw new UserInputError('Insufficient shares');
        }

        // Update cash balance
        await query(
          'UPDATE portfolios SET cash_balance = cash_balance + $1 WHERE id = $2',
          [totalAmount, portfolio.id]
        );

        // Update or remove holding
        const newShares = parseFloat(holding.shares) - input.shares;
        if (newShares === 0) {
          await query('DELETE FROM holdings WHERE id = $1', [holding.id]);
        } else {
          await query(
            'UPDATE holdings SET shares = $1 WHERE id = $2',
            [newShares, holding.id]
          );
        }
      }

      // Record transaction
      const transactionResult = await query(
        `INSERT INTO transactions (portfolio_id, type, symbol, shares, price_per_share, total_amount)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [portfolio.id, input.type, input.symbol, input.shares, quote.price, totalAmount]
      );

      logger.info(`Trade executed: ${input.type} ${input.shares} ${input.symbol} for user ${userId}`);

      return {
        id: transactionResult.rows[0].id,
        type: transactionResult.rows[0].type,
        symbol: transactionResult.rows[0].symbol,
        shares: parseFloat(transactionResult.rows[0].shares),
        pricePerShare: parseFloat(transactionResult.rows[0].price_per_share),
        totalAmount: parseFloat(transactionResult.rows[0].total_amount),
        timestamp: transactionResult.rows[0].timestamp,
      };
    } catch (error) {
      logger.error('Execute trade error:', error);
      throw error;
    }
  }
}

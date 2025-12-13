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
      const apiKey = process.env.ALPHA_VANTAGE_API_KEY;

      // Try to use Alpha Vantage API if key is available
      if (apiKey && apiKey !== '' && apiKey !== 'your_alpha_vantage_api_key_here') {
        try {
          // Check cache first (5 minute TTL)
          const cacheKey = `stock:${symbol}`;
          const cached = await cacheGet(cacheKey);
          if (cached) {
            return JSON.parse(cached);
          }

          // Fetch from Alpha Vantage
          const response = await axios.get(
            `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`
          );

          const quote = response.data['Global Quote'];
          if (quote && quote['05. price']) {
            const stockData = {
              symbol: quote['01. symbol'],
              name: quote['01. symbol'], // Alpha Vantage doesn't provide company name in quote
              price: parseFloat(quote['05. price']),
              change: parseFloat(quote['09. change']),
              changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
              volume: parseInt(quote['06. volume']),
              dayHigh: parseFloat(quote['03. high']),
              dayLow: parseFloat(quote['04. low']),
              marketCap: 0, // Not available in this endpoint
              yearHigh: 0,
              yearLow: 0,
            };

            // Cache for 5 minutes (300 seconds)
            await cacheSet(cacheKey, JSON.stringify(stockData), 300);

            logger.info(`Fetched real-time quote for ${symbol} from Alpha Vantage`);
            return stockData;
          }
        } catch (apiError) {
          logger.warn(`Alpha Vantage API error for ${symbol}, falling back to mock data:`, apiError);
        }
      }

      // Fallback to mock stock data
      const mockStocks: { [key: string]: any } = {
        'AAPL': { symbol: 'AAPL', name: 'Apple Inc.', price: 178.50, change: 2.35, changePercent: 1.33 },
        'MSFT': { symbol: 'MSFT', name: 'Microsoft Corporation', price: 378.91, change: -1.20, changePercent: -0.32 },
        'GOOGL': { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 140.15, change: 3.45, changePercent: 2.52 },
        'AMZN': { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 151.94, change: 1.88, changePercent: 1.25 },
        'TSLA': { symbol: 'TSLA', name: 'Tesla Inc.', price: 242.84, change: -5.62, changePercent: -2.26 },
        'META': { symbol: 'META', name: 'Meta Platforms Inc.', price: 484.03, change: 8.12, changePercent: 1.71 },
        'NVDA': { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 495.22, change: 12.50, changePercent: 2.59 },
        'JPM': { symbol: 'JPM', name: 'JPMorgan Chase & Co.', price: 182.45, change: -0.85, changePercent: -0.46 },
        'V': { symbol: 'V', name: 'Visa Inc.', price: 273.61, change: 2.10, changePercent: 0.77 },
        'WMT': { symbol: 'WMT', name: 'Walmart Inc.', price: 67.89, change: 0.45, changePercent: 0.67 },
        'DIS': { symbol: 'DIS', name: 'Walt Disney Company', price: 92.35, change: -1.15, changePercent: -1.23 },
        'NFLX': { symbol: 'NFLX', name: 'Netflix Inc.', price: 485.73, change: 6.20, changePercent: 1.29 },
        'INTC': { symbol: 'INTC', name: 'Intel Corporation', price: 42.88, change: 0.32, changePercent: 0.75 },
        'AMD': { symbol: 'AMD', name: 'Advanced Micro Devices', price: 118.95, change: -2.45, changePercent: -2.02 },
        'PYPL': { symbol: 'PYPL', name: 'PayPal Holdings Inc.', price: 61.34, change: 1.20, changePercent: 2.00 },
      };

      // Return mock data if available, otherwise generate random data
      const stock = mockStocks[symbol.toUpperCase()];
      if (stock) {
        return {
          ...stock,
          volume: 1000000 + Math.floor(Math.random() * 5000000),
          marketCap: 100000000000 + Math.floor(Math.random() * 900000000000),
          dayHigh: stock.price + 5,
          dayLow: stock.price - 5,
          yearHigh: stock.price + 50,
          yearLow: stock.price - 50,
        };
      }

      // For unknown symbols, return generated mock data
      return {
        symbol,
        name: symbol,
        price: 50 + Math.random() * 200,
        change: -10 + Math.random() * 20,
        changePercent: -5 + Math.random() * 10,
        volume: 1000000 + Math.floor(Math.random() * 5000000),
        marketCap: 10000000000 + Math.floor(Math.random() * 90000000000),
        dayHigh: 0,
        dayLow: 0,
        yearHigh: 0,
        yearLow: 0,
      };
    } catch (error) {
      logger.error('Get stock quote error:', error);
      throw error;
    }
  }

  async searchStocks(searchQuery: string) {
    try {
      const apiKey = process.env.ALPHA_VANTAGE_API_KEY;

      // Try to use Alpha Vantage API if key is available
      if (apiKey && apiKey !== '' && apiKey !== 'your_alpha_vantage_api_key_here') {
        try {
          // Use Symbol Search endpoint
          const response = await axios.get(
            `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${searchQuery}&apikey=${apiKey}`
          );

          const matches = response.data.bestMatches;
          if (matches && matches.length > 0) {
            // Get quotes for top 5 matches
            const results = await Promise.all(
              matches.slice(0, 5).map(async (match: any) => {
                try {
                  const quote = await this.getStockQuote(match['1. symbol']);
                  return {
                    symbol: match['1. symbol'],
                    name: match['2. name'],
                    price: quote.price,
                    change: quote.change,
                    changePercent: quote.changePercent,
                  };
                } catch {
                  // If quote fails, return basic info
                  return {
                    symbol: match['1. symbol'],
                    name: match['2. name'],
                    price: 0,
                    change: 0,
                    changePercent: 0,
                  };
                }
              })
            );

            logger.info(`Alpha Vantage search returned ${results.length} results for "${searchQuery}"`);
            return results;
          }
        } catch (apiError) {
          logger.warn(`Alpha Vantage search API error, falling back to mock data:`, apiError);
        }
      }

      // Fallback to mock popular stocks
      const mockStocks = [
        { symbol: 'AAPL', name: 'Apple Inc.', price: 178.50, change: 2.35, changePercent: 1.33 },
        { symbol: 'MSFT', name: 'Microsoft Corporation', price: 378.91, change: -1.20, changePercent: -0.32 },
        { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 140.15, change: 3.45, changePercent: 2.52 },
        { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 151.94, change: 1.88, changePercent: 1.25 },
        { symbol: 'TSLA', name: 'Tesla Inc.', price: 242.84, change: -5.62, changePercent: -2.26 },
        { symbol: 'META', name: 'Meta Platforms Inc.', price: 484.03, change: 8.12, changePercent: 1.71 },
        { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 495.22, change: 12.50, changePercent: 2.59 },
        { symbol: 'JPM', name: 'JPMorgan Chase & Co.', price: 182.45, change: -0.85, changePercent: -0.46 },
        { symbol: 'V', name: 'Visa Inc.', price: 273.61, change: 2.10, changePercent: 0.77 },
        { symbol: 'WMT', name: 'Walmart Inc.', price: 67.89, change: 0.45, changePercent: 0.67 },
        { symbol: 'DIS', name: 'Walt Disney Company', price: 92.35, change: -1.15, changePercent: -1.23 },
        { symbol: 'NFLX', name: 'Netflix Inc.', price: 485.73, change: 6.20, changePercent: 1.29 },
        { symbol: 'INTC', name: 'Intel Corporation', price: 42.88, change: 0.32, changePercent: 0.75 },
        { symbol: 'AMD', name: 'Advanced Micro Devices', price: 118.95, change: -2.45, changePercent: -2.02 },
        { symbol: 'PYPL', name: 'PayPal Holdings Inc.', price: 61.34, change: 1.20, changePercent: 2.00 },
      ];

      // Filter stocks based on search query
      const query = searchQuery.toLowerCase();
      const filtered = mockStocks.filter(stock =>
        stock.symbol.toLowerCase().includes(query) ||
        stock.name.toLowerCase().includes(query)
      );

      return filtered.slice(0, 10).map(stock => ({
        symbol: stock.symbol,
        name: stock.name,
        price: stock.price,
        change: stock.change,
        changePercent: stock.changePercent,
      }));
    } catch (error) {
      logger.error('Search stocks error:', error);
      return [];
    }
  }

  async getMarketNews(_limit: number = 10) {
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

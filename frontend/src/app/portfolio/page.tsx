'use client';

import { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Search,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  ShoppingCart,
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const GET_PORTFOLIO = gql`
  query GetPortfolio {
    portfolio {
      id
      totalValue
      cashBalance
      holdings {
        id
        symbol
        name
        shares
        avgCostPerShare
        currentPrice
        totalValue
        gainLoss
        gainLossPercent
      }
      transactions {
        id
        type
        symbol
        shares
        pricePerShare
        totalAmount
        timestamp
      }
      performanceData {
        totalGainLoss
        totalGainLossPercent
        dailyChange
        dailyChangePercent
      }
    }
  }
`;

const SEARCH_STOCKS = gql`
  query SearchStocks($query: String!) {
    searchStocks(query: $query) {
      symbol
      name
      price
      change
      changePercent
    }
  }
`;

const EXECUTE_TRADE = gql`
  mutation ExecuteTrade($input: TradeInput!) {
    executeTrade(input: $input) {
      id
      type
      symbol
      shares
      pricePerShare
      totalAmount
    }
  }
`;

export default function PortfolioPage() {
  return (
    <ProtectedRoute>
      <PortfolioContent />
    </ProtectedRoute>
  );
}

function PortfolioContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStock, setSelectedStock] = useState<any>(null);
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');
  const [shares, setShares] = useState('');
  const [showTradeModal, setShowTradeModal] = useState(false);

  const { data: portfolioData, loading, error, refetch } = useQuery(GET_PORTFOLIO);
  const { data: searchData, loading: searching } = useQuery(SEARCH_STOCKS, {
    variables: { query: searchQuery },
    skip: searchQuery.length < 2,
  });

  const [executeTrade, { loading: trading }] = useMutation(EXECUTE_TRADE, {
    onCompleted: () => {
      refetch();
      setShowTradeModal(false);
      setShares('');
      setSelectedStock(null);
    },
  });

  const handleTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStock || !shares) return;

    try {
      await executeTrade({
        variables: {
          input: {
            symbol: selectedStock.symbol,
            shares: parseFloat(shares),
            type: tradeType,
          },
        },
      });
    } catch (err) {
      console.error('Trade error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex items-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading portfolio...</span>
        </div>
      </div>
    );
  }

  if (error || !portfolioData?.portfolio) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Unable to load portfolio
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Please try refreshing the page
          </p>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      </div>
    );
  }

  const portfolio = portfolioData.portfolio;
  const holdings = portfolio.holdings || [];
  const performance = portfolio.performanceData || {};
  const totalInvested = portfolio.totalValue - portfolio.cashBalance;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Stock Trading Simulator</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Virtual Portfolio</span>
          </div>
        </div>

        {/* Portfolio Summary */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <Wallet className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                ${portfolio.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cash Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${portfolio.cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Gain/Loss</CardTitle>
              {performance.totalGainLoss >= 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-500" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${performance.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {performance.totalGainLoss >= 0 ? '+' : ''}${performance.totalGainLoss?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
              </div>
              <p className="text-xs text-gray-500">
                {performance.totalGainLossPercent >= 0 ? '+' : ''}{performance.totalGainLossPercent?.toFixed(2) || '0.00'}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Change</CardTitle>
              {performance.dailyChange >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${performance.dailyChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {performance.dailyChange >= 0 ? '+' : ''}${performance.dailyChange?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
              </div>
              <p className="text-xs text-gray-500">
                {performance.dailyChangePercent >= 0 ? '+' : ''}{performance.dailyChangePercent?.toFixed(2) || '0.00'}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Stock Search and Trade */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Search & Trade Stocks</CardTitle>
            <CardDescription>Search for stocks and execute trades with your virtual cash</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search stocks (e.g., AAPL, GOOGL, MSFT)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                  />
                </div>
              </div>

              {searching && <div className="text-sm text-gray-500">Searching...</div>}

              {searchData?.searchStocks && searchData.searchStocks.length > 0 && (
                <div className="border rounded-lg divide-y dark:border-gray-700">
                  {searchData.searchStocks.map((stock: any) => (
                    <div
                      key={stock.symbol}
                      className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                      onClick={() => {
                        setSelectedStock(stock);
                        setShowTradeModal(true);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">{stock.symbol}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{stock.name}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">${stock.price.toFixed(2)}</div>
                          <div className={`text-sm ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Trade Modal */}
        {showTradeModal && selectedStock && (
          <Card className="mb-8 border-2 border-blue-500">
            <CardHeader>
              <CardTitle>Trade {selectedStock.symbol}</CardTitle>
              <CardDescription>{selectedStock.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTrade} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Trade Type</label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={tradeType === 'BUY' ? 'default' : 'outline'}
                      onClick={() => setTradeType('BUY')}
                      className="flex-1"
                    >
                      Buy
                    </Button>
                    <Button
                      type="button"
                      variant={tradeType === 'SELL' ? 'default' : 'outline'}
                      onClick={() => setTradeType('SELL')}
                      className="flex-1"
                    >
                      Sell
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Number of Shares</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={shares}
                    onChange={(e) => setShares(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                    placeholder="0"
                    required
                  />
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current Price:</span>
                    <span className="font-semibold">${selectedStock.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Cost:</span>
                    <span className="font-semibold">
                      ${(parseFloat(shares || '0') * selectedStock.price).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Available Cash:</span>
                    <span className="font-semibold text-green-600">
                      ${portfolio.cashBalance.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={trading} className="flex-1">
                    {trading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        {tradeType === 'BUY' ? 'Buy' : 'Sell'} Shares
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowTradeModal(false);
                      setSelectedStock(null);
                      setShares('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Holdings */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Holdings</CardTitle>
            <CardDescription>Stocks you currently own</CardDescription>
          </CardHeader>
          <CardContent>
            {holdings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b dark:border-gray-700">
                      <th className="text-left p-3">Symbol</th>
                      <th className="text-left p-3">Name</th>
                      <th className="text-right p-3">Shares</th>
                      <th className="text-right p-3">Avg Cost</th>
                      <th className="text-right p-3">Current Price</th>
                      <th className="text-right p-3">Total Value</th>
                      <th className="text-right p-3">Gain/Loss</th>
                      <th className="text-right p-3">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holdings.map((holding: any) => (
                      <tr key={holding.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="p-3 font-semibold">{holding.symbol}</td>
                        <td className="p-3">{holding.name}</td>
                        <td className="p-3 text-right">{holding.shares}</td>
                        <td className="p-3 text-right">${holding.avgCostPerShare.toFixed(2)}</td>
                        <td className="p-3 text-right">${holding.currentPrice.toFixed(2)}</td>
                        <td className="p-3 text-right font-semibold">${holding.totalValue.toFixed(2)}</td>
                        <td className={`p-3 text-right font-semibold ${holding.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {holding.gainLoss >= 0 ? '+' : ''}${holding.gainLoss.toFixed(2)}
                        </td>
                        <td className={`p-3 text-right ${holding.gainLossPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {holding.gainLossPercent >= 0 ? '+' : ''}{holding.gainLossPercent.toFixed(2)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  No holdings yet
                </h3>
                <p className="text-gray-500">
                  Search for stocks above and make your first trade!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your trading history</CardDescription>
          </CardHeader>
          <CardContent>
            {portfolio.transactions && portfolio.transactions.length > 0 ? (
              <div className="space-y-3">
                {portfolio.transactions.slice(0, 10).map((transaction: any) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-700"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${transaction.type === 'BUY' ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
                        {transaction.type === 'BUY' ? (
                          <ArrowUpRight className="w-4 h-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold">{transaction.symbol}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {transaction.shares} shares @ ${transaction.pricePerShare.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-semibold ${transaction.type === 'BUY' ? 'text-red-600' : 'text-green-600'}`}>
                        {transaction.type === 'BUY' ? '-' : '+'}${transaction.totalAmount.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(transaction.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No transactions yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

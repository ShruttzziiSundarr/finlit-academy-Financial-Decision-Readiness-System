'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card } from '@/components/ui/card';
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
import { TrendingUp, TrendingDown, DollarSign, Search } from 'lucide-react';

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

export default function PortfolioPage() {
  return (
    <ProtectedRoute>
      <PortfolioContent />
    </ProtectedRoute>
  );
}

function PortfolioContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStock, setSelectedStock] = useState<string | null>(null);

  const portfolioData = {
    totalValue: 103450.75,
    cashBalance: 23450.75,
    totalGainLoss: 3450.75,
    totalGainLossPercent: 3.45,
    dailyChange: 1250.30,
    dailyChangePercent: 1.22,
  };

  const holdings = [
    {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      shares: 50,
      avgCost: 150.00,
      currentPrice: 175.50,
      totalValue: 8775.00,
      gainLoss: 1275.00,
      gainLossPercent: 17.00,
    },
    {
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      shares: 25,
      avgCost: 120.00,
      currentPrice: 140.25,
      totalValue: 3506.25,
      gainLoss: 506.25,
      gainLossPercent: 16.88,
    },
    {
      symbol: 'MSFT',
      name: 'Microsoft Corp.',
      shares: 30,
      avgCost: 280.00,
      currentPrice: 315.75,
      totalValue: 9472.50,
      gainLoss: 1072.50,
      gainLossPercent: 12.77,
    },
    {
      symbol: 'TSLA',
      name: 'Tesla Inc.',
      shares: 20,
      avgCost: 200.00,
      currentPrice: 245.80,
      totalValue: 4916.00,
      gainLoss: 916.00,
      gainLossPercent: 22.90,
    },
    {
      symbol: 'AMZN',
      name: 'Amazon.com Inc.',
      shares: 15,
      avgCost: 130.00,
      currentPrice: 155.25,
      totalValue: 2328.75,
      gainLoss: 378.75,
      gainLossPercent: 19.42,
    },
  ];

  const historicalData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Portfolio Value',
        data: [100000, 101500, 99800, 102000, 103200, 103450.75],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const recentTransactions = [
    { id: 1, type: 'BUY', symbol: 'AAPL', shares: 10, price: 175.50, date: '2024-01-15', total: 1755.00 },
    { id: 2, type: 'SELL', symbol: 'MSFT', shares: 5, price: 315.75, date: '2024-01-14', total: 1578.75 },
    { id: 3, type: 'BUY', symbol: 'GOOGL', shares: 15, price: 140.25, date: '2024-01-12', total: 2103.75 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Stock Market Portfolio</h1>

        {/* Portfolio Summary */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="text-sm text-gray-600 mb-1">Total Value</div>
            <div className="text-2xl font-bold">
              ${portfolioData.totalValue.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
              <TrendingUp className="w-4 h-4" />
              {portfolioData.dailyChangePercent}% today
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-sm text-gray-600 mb-1">Cash Balance</div>
            <div className="text-2xl font-bold">
              ${portfolioData.cashBalance.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500 mt-1">Available to trade</div>
          </Card>

          <Card className="p-6">
            <div className="text-sm text-gray-600 mb-1">Total Gain/Loss</div>
            <div className="text-2xl font-bold text-green-600">
              +${portfolioData.totalGainLoss.toLocaleString()}
            </div>
            <div className="text-sm text-green-600 mt-1">
              +{portfolioData.totalGainLossPercent}%
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-sm text-gray-600 mb-1">Daily Change</div>
            <div className="text-2xl font-bold text-green-600">
              +${portfolioData.dailyChange.toLocaleString()}
            </div>
            <div className="text-sm text-green-600 mt-1">
              +{portfolioData.dailyChangePercent}%
            </div>
          </Card>
        </div>

        {/* Performance Chart */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Portfolio Performance</h2>
          <Line
            data={historicalData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  display: false,
                },
              },
              scales: {
                y: {
                  beginAtZero: false,
                  ticks: {
                    callback: (value) => `$${value.toLocaleString()}`,
                  },
                },
              },
            }}
          />
        </Card>

        {/* Search and Trade */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Search & Trade</h2>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search stocks (e.g., AAPL, GOOGL)"
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button>Search</Button>
          </div>
        </Card>

        {/* Holdings */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Your Holdings</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Symbol</th>
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-right py-3 px-4">Shares</th>
                  <th className="text-right py-3 px-4">Avg Cost</th>
                  <th className="text-right py-3 px-4">Current Price</th>
                  <th className="text-right py-3 px-4">Total Value</th>
                  <th className="text-right py-3 px-4">Gain/Loss</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((holding) => (
                  <tr key={holding.symbol} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="py-3 px-4 font-bold">{holding.symbol}</td>
                    <td className="py-3 px-4">{holding.name}</td>
                    <td className="py-3 px-4 text-right">{holding.shares}</td>
                    <td className="py-3 px-4 text-right">${holding.avgCost.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right">${holding.currentPrice.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-bold">
                      ${holding.totalValue.toLocaleString()}
                    </td>
                    <td className={`py-3 px-4 text-right ${holding.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {holding.gainLoss >= 0 ? '+' : ''}${holding.gainLoss.toLocaleString()}
                      <br />
                      <span className="text-sm">
                        ({holding.gainLoss >= 0 ? '+' : ''}{holding.gainLossPercent.toFixed(2)}%)
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="outline">Buy</Button>
                        <Button size="sm" variant="outline">Sell</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Recent Transactions */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`px-3 py-1 rounded ${
                      transaction.type === 'BUY'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {transaction.type}
                  </div>
                  <div>
                    <div className="font-bold">{transaction.symbol}</div>
                    <div className="text-sm text-gray-600">
                      {transaction.shares} shares @ ${transaction.price}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">${transaction.total.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">{transaction.date}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

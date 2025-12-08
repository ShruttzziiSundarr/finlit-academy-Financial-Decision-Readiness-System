'use client';

import { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PlusCircle,
  Loader2,
  DollarSign,
  Target,
} from 'lucide-react';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const GET_BUDGET = gql`
  query GetBudget {
    budget {
      id
      name
      totalIncome
      savingsGoal
      currentSavings
      categories {
        id
        name
        allocatedAmount
        spentAmount
        color
        icon
      }
      expenses {
        id
        categoryId
        description
        amount
        date
        recurring
      }
    }
  }
`;

const CREATE_EXPENSE = gql`
  mutation CreateExpense($input: CreateExpenseInput!) {
    createExpense(input: $input) {
      id
      description
      amount
      date
    }
  }
`;

export default function BudgetPage() {
  return (
    <ProtectedRoute>
      <BudgetContent />
    </ProtectedRoute>
  );
}

function BudgetContent() {
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    recurring: false,
  });

  const { data, loading, error, refetch } = useQuery(GET_BUDGET);
  const [createExpense, { loading: creating }] = useMutation(CREATE_EXPENSE, {
    onCompleted: () => {
      refetch();
      setShowAddExpense(false);
      setExpenseForm({
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        recurring: false,
      });
    },
  });

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !expenseForm.amount || !expenseForm.description) return;

    try {
      await createExpense({
        variables: {
          input: {
            categoryId: selectedCategory,
            description: expenseForm.description,
            amount: parseFloat(expenseForm.amount),
            date: expenseForm.date,
            recurring: expenseForm.recurring,
          },
        },
      });
    } catch (err) {
      console.error('Error creating expense:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex items-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading budget...</span>
        </div>
      </div>
    );
  }

  if (error || !data?.budget) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Unable to load budget
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Please try refreshing the page
          </p>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      </div>
    );
  }

  const budget = data.budget;
  const categories = budget.categories || [];
  const totalAllocated = categories.reduce((sum: number, cat: any) => sum + cat.allocatedAmount, 0);
  const totalSpent = categories.reduce((sum: number, cat: any) => sum + cat.spentAmount, 0);
  const remaining = budget.totalIncome - totalSpent;
  const savingsProgress = budget.savingsGoal > 0
    ? (budget.currentSavings / budget.savingsGoal) * 100
    : 0;

  const pieData = {
    labels: categories.map((c: any) => c.name),
    datasets: [
      {
        data: categories.map((c: any) => c.allocatedAmount),
        backgroundColor: categories.map((c: any) => c.color || '#3b82f6'),
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const barData = {
    labels: categories.map((c: any) => c.name),
    datasets: [
      {
        label: 'Allocated',
        data: categories.map((c: any) => c.allocatedAmount),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
      {
        label: 'Spent',
        data: categories.map((c: any) => c.spentAmount),
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Budget Manager</h1>
          <Button onClick={() => setShowAddExpense(!showAddExpense)}>
            <PlusCircle className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${budget.totalIncome.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                ${totalSpent.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Remaining</CardTitle>
              <Wallet className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${remaining >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                ${remaining.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Savings Goal</CardTitle>
              <Target className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {savingsProgress.toFixed(0)}%
              </div>
              <p className="text-xs text-gray-500 mt-1">
                ${budget.currentSavings.toLocaleString()} / ${budget.savingsGoal.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Add Expense Form */}
        {showAddExpense && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Add New Expense</CardTitle>
              <CardDescription>Track your spending by adding expenses</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddExpense} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map((cat: any) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      value={expenseForm.amount}
                      onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <input
                      type="text"
                      value={expenseForm.description}
                      onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                      placeholder="Grocery shopping"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Date</label>
                    <input
                      type="date"
                      value={expenseForm.date}
                      onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="recurring"
                    checked={expenseForm.recurring}
                    onChange={(e) => setExpenseForm({ ...expenseForm, recurring: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="recurring" className="text-sm">Recurring expense</label>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={creating}>
                    {creating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      'Add Expense'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddExpense(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Charts */}
        {categories.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Budget Allocation</CardTitle>
                <CardDescription>How your budget is distributed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center">
                  <Pie data={pieData} options={{ maintainAspectRatio: false }} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Spending vs Budget</CardTitle>
                <CardDescription>Compare allocated vs actual spending</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <Bar data={barData} options={{ maintainAspectRatio: false }} />
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="mb-8">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Wallet className="w-16 h-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                No budget categories yet
              </h3>
              <p className="text-gray-500 text-center">
                Budget categories will appear here once they're added to your account
              </p>
            </CardContent>
          </Card>
        )}

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
            <CardDescription>Detailed view of each budget category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categories.map((category: any) => {
                const percentage = category.allocatedAmount > 0
                  ? (category.spentAmount / category.allocatedAmount) * 100
                  : 0;
                const isOverBudget = percentage > 100;

                return (
                  <div key={category.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <div className="text-sm">
                        <span className={isOverBudget ? 'text-red-600' : 'text-gray-600'}>
                          ${category.spentAmount.toLocaleString()}
                        </span>
                        <span className="text-gray-400"> / ${category.allocatedAmount.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          isOverBudget ? 'bg-red-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500">
                      {percentage.toFixed(1)}% used
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

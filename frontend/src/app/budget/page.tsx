'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card } from '@/components/ui/card';
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

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function BudgetPage() {
  return (
    <ProtectedRoute>
      <BudgetContent />
    </ProtectedRoute>
  );
}

function BudgetContent() {
  const [monthlyIncome, setMonthlyIncome] = useState(5000);
  const [categories, setCategories] = useState([
    { name: 'Housing', allocated: 1500, spent: 1450, color: '#3b82f6' },
    { name: 'Food', allocated: 600, spent: 520, color: '#10b981' },
    { name: 'Transportation', allocated: 400, spent: 380, color: '#f59e0b' },
    { name: 'Entertainment', allocated: 300, spent: 250, color: '#ec4899' },
    { name: 'Utilities', allocated: 200, spent: 195, color: '#8b5cf6' },
    { name: 'Savings', allocated: 1000, spent: 1000, color: '#06b6d4' },
    { name: 'Other', allocated: 500, spent: 450, color: '#6b7280' },
  ]);

  const totalAllocated = categories.reduce((sum, cat) => sum + cat.allocated, 0);
  const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0);
  const remaining = monthlyIncome - totalSpent;

  const pieData = {
    labels: categories.map(c => c.name),
    datasets: [
      {
        data: categories.map(c => c.allocated),
        backgroundColor: categories.map(c => c.color),
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const barData = {
    labels: categories.map(c => c.name),
    datasets: [
      {
        label: 'Allocated',
        data: categories.map(c => c.allocated),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
      {
        label: 'Spent',
        data: categories.map(c => c.spent),
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Budget Simulator</h1>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="text-sm text-gray-600 mb-1">Monthly Income</div>
            <div className="text-2xl font-bold text-green-600">
              ${monthlyIncome.toLocaleString()}
            </div>
          </Card>
          <Card className="p-6">
            <div className="text-sm text-gray-600 mb-1">Total Allocated</div>
            <div className="text-2xl font-bold">
              ${totalAllocated.toLocaleString()}
            </div>
          </Card>
          <Card className="p-6">
            <div className="text-sm text-gray-600 mb-1">Total Spent</div>
            <div className="text-2xl font-bold text-blue-600">
              ${totalSpent.toLocaleString()}
            </div>
          </Card>
          <Card className="p-6">
            <div className="text-sm text-gray-600 mb-1">Remaining</div>
            <div className={`text-2xl font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${remaining.toLocaleString()}
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Budget Allocation</h2>
            <div className="w-full max-w-md mx-auto">
              <Pie data={pieData} />
            </div>
          </Card>
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Allocated vs Spent</h2>
            <Bar
              data={barData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </Card>
        </div>

        {/* Category Details */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Category Breakdown</h2>
          <div className="space-y-4">
            {categories.map((category, index) => {
              const percentage = category.allocated > 0
                ? (category.spent / category.allocated) * 100
                : 0;
              const isOverBudget = category.spent > category.allocated;

              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">
                        ${category.spent} / ${category.allocated}
                      </div>
                      <div className={`text-sm ${isOverBudget ? 'text-red-600' : 'text-gray-600'}`}>
                        {percentage.toFixed(0)}% used
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        isOverBudget ? 'bg-red-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Actions */}
        <div className="mt-8 flex gap-4">
          <Button size="lg">Add Expense</Button>
          <Button size="lg" variant="outline">Adjust Budget</Button>
          <Button size="lg" variant="outline">Set Savings Goal</Button>
        </div>
      </div>
    </div>
  );
}

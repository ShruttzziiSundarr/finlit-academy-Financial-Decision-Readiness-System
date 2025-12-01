'use client';

import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
  Wallet,
  TrendingUp,
  BookOpen,
  Trophy,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back!</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Here's your financial learning progress
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Learning Streak"
            value="12 days"
            icon={<Trophy className="w-6 h-6 text-yellow-500" />}
            change="+3 from last week"
          />
          <StatCard
            title="Courses Completed"
            value="8"
            icon={<BookOpen className="w-6 h-6 text-blue-500" />}
            change="2 in progress"
          />
          <StatCard
            title="Portfolio Value"
            value="$103,450"
            icon={<TrendingUp className="w-6 h-6 text-green-500" />}
            change="+3.45%"
            positive
          />
          <StatCard
            title="Budget Health"
            value="92%"
            icon={<Wallet className="w-6 h-6 text-purple-500" />}
            change="On track"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ActionCard
            icon={<Wallet className="w-8 h-8" />}
            title="Budget Simulator"
            description="Practice managing your monthly budget"
            href="/budget"
            color="bg-purple-500"
          />
          <ActionCard
            icon={<TrendingUp className="w-8 h-8" />}
            title="Stock Market Game"
            description="Build your virtual investment portfolio"
            href="/portfolio"
            color="bg-green-500"
          />
          <ActionCard
            icon={<BookOpen className="w-8 h-8" />}
            title="Learning Center"
            description="Continue your financial education"
            href="/learn"
            color="bg-blue-500"
          />
          <ActionCard
            icon={<Trophy className="w-8 h-8" />}
            title="Weekly Challenges"
            description="Compete and earn rewards"
            href="/challenges"
            color="bg-yellow-500"
          />
          <ActionCard
            icon={<MessageSquare className="w-8 h-8" />}
            title="AI Financial Coach"
            description="Ask questions, get instant answers"
            href="/chat"
            color="bg-pink-500"
          />
        </div>
      </main>
    </div>
    </ProtectedRoute>
  );
}

function StatCard({
  title,
  value,
  icon,
  change,
  positive,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  change: string;
  positive?: boolean;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">{title}</span>
        {icon}
      </div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div
        className={`text-sm ${
          positive ? 'text-green-600' : 'text-gray-500'
        }`}
      >
        {change}
      </div>
    </div>
  );
}

function ActionCard({
  icon,
  title,
  description,
  href,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  color: string;
}) {
  return (
    <Link href={href}>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer">
        <div className={`${color} text-white w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
          {icon}
        </div>
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{description}</p>
        <div className="flex items-center text-blue-600 dark:text-blue-400">
          <span className="text-sm font-medium">Get Started</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </div>
      </div>
    </Link>
  );
}

'use client';

import Link from 'next/link';
import { useQuery, gql } from '@apollo/client';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
  Wallet,
  TrendingUp,
  BookOpen,
  Trophy,
  MessageSquare,
  ArrowRight,
  Loader2,
} from 'lucide-react';

const GET_USER_DASHBOARD = gql`
  query GetUserDashboard {
    me {
      id
      firstName
      lastName
      progress {
        coursesCompleted
        currentStreak
        experiencePoints
        level
      }
    }
    portfolio {
      totalValue
      cashBalance
      performanceData {
        totalGainLoss
        totalGainLossPercent
      }
    }
    budget {
      totalIncome
      currentSavings
      savingsGoal
    }
  }
`;

export default function DashboardPage() {
  const { data, loading, error } = useQuery(GET_USER_DASHBOARD);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-grid">
        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Welcome Section */}
          <div className="mb-8 relative">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center glow-purple-strong border-2 border-purple-400">
                <span className="text-3xl font-bold mono-font text-white">
                  {data?.me?.progress?.level || 1}
                </span>
              </div>
              <div>
                <h2 className="text-3xl font-bold glow-purple">
                  PLAYER {data?.me ? data.me.firstName.toUpperCase() : 'LOADING...'}
                </h2>
                <p className="text-purple-300 mono-font text-lg">
                  LEVEL {data?.me?.progress?.level || 1} • {data?.me?.progress?.experiencePoints || 0} XP
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-600 dark:text-gray-400">Loading your dashboard...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
              Unable to load dashboard data. Please try refreshing the page.
            </div>
          ) : (
            <>

              {/* Quick Stats */}
              <div className="grid md:grid-cols-4 gap-6 mb-8">
                <StatCard
                  title="Learning Streak"
                  value={`${data?.me?.progress?.currentStreak || 0} days`}
                  icon={<Trophy className="w-6 h-6 text-yellow-500" />}
                  change={`Level ${data?.me?.progress?.level || 1}`}
                />
                <StatCard
                  title="Courses Completed"
                  value={data?.me?.progress?.coursesCompleted?.toString() || '0'}
                  icon={<BookOpen className="w-6 h-6 text-blue-500" />}
                  change={`${data?.me?.progress?.experiencePoints || 0} XP earned`}
                />
                <StatCard
                  title="Portfolio Value"
                  value={`$${(data?.portfolio?.totalValue || 100000).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  icon={<TrendingUp className="w-6 h-6 text-green-500" />}
                  change={`${data?.portfolio?.performanceData?.totalGainLossPercent >= 0 ? '+' : ''}${(data?.portfolio?.performanceData?.totalGainLossPercent || 0).toFixed(2)}%`}
                  positive={data?.portfolio?.performanceData?.totalGainLossPercent >= 0}
                />
                <StatCard
                  title="Budget Health"
                  value={data?.budget?.savingsGoal > 0
                    ? `${Math.round((data?.budget?.currentSavings / data?.budget?.savingsGoal) * 100)}%`
                    : 'Not set'}
                  icon={<Wallet className="w-6 h-6 text-purple-500" />}
                  change={data?.budget?.savingsGoal > 0
                    ? `$${data?.budget?.currentSavings?.toLocaleString()} saved`
                    : 'Set your goal'}
                />
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-2xl font-bold mb-6">Quick Actions</h3>
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
              </div>
            </>
          )}
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
    <div className="bg-gradient-to-br from-gray-900/90 to-black/90 p-6 rounded-lg border-2 border-purple-500/30 glow-purple">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-purple-300 uppercase tracking-wider">{title}</span>
        <div className="text-purple-400">{icon}</div>
      </div>
      <div className="text-3xl font-bold mb-1 mono-font text-white">{value}</div>
      <div
        className={`text-sm mono-font ${
          positive === undefined ? 'text-gray-400' : positive ? 'text-green-400 glow-green' : 'text-red-400'
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
      <div className="bg-gradient-to-br from-gray-900/90 to-black/90 p-6 rounded-lg border-2 border-purple-500/30 hover:border-purple-400 glow-purple transition-all hover:scale-105 hover:glow-purple-strong cursor-pointer">
        <div className={`${color} text-white w-12 h-12 rounded-lg flex items-center justify-center mb-4 glow-purple`}>
          {icon}
        </div>
        <h3 className="text-lg font-bold mb-2 text-purple-300 uppercase">{title}</h3>
        <p className="text-gray-400 mb-4 text-sm">{description}</p>
        <div className="flex items-center text-purple-400">
          <span className="text-sm font-medium mono-font">START QUEST</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </div>
      </div>
    </Link>
  );
}

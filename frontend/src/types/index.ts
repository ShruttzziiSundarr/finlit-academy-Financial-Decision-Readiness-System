// User Types
export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Portfolio Types
export interface Portfolio {
  id: string;
  userId: string;
  totalValue: number;
  cashBalance: number;
  holdings: Holding[];
  transactions: Transaction[];
  performanceData: PerformanceData;
}

export interface Holding {
  id: string;
  symbol: string;
  name: string;
  shares: number;
  avgCostPerShare: number;
  currentPrice: number;
  totalValue: number;
  gainLoss: number;
  gainLossPercent: number;
}

export interface Transaction {
  id: string;
  type: 'BUY' | 'SELL';
  symbol: string;
  shares: number;
  pricePerShare: number;
  totalAmount: number;
  timestamp: Date;
}

export interface PerformanceData {
  totalGainLoss: number;
  totalGainLossPercent: number;
  dailyChange: number;
  dailyChangePercent: number;
  historicalData: HistoricalDataPoint[];
}

export interface HistoricalDataPoint {
  date: Date;
  value: number;
}

// Budget Types
export interface Budget {
  id: string;
  userId: string;
  name: string;
  totalIncome: number;
  categories: BudgetCategory[];
  expenses: Expense[];
  savingsGoal: number;
  currentSavings: number;
}

export interface BudgetCategory {
  id: string;
  name: string;
  allocatedAmount: number;
  spentAmount: number;
  color: string;
  icon: string;
}

export interface Expense {
  id: string;
  categoryId: string;
  description: string;
  amount: number;
  date: Date;
  recurring: boolean;
  frequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
}

// Learning Types
export interface Course {
  id: string;
  title: string;
  description: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  estimatedMinutes: number;
  modules: Module[];
  progress: number;
  completed: boolean;
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  content: string;
  type: 'VIDEO' | 'ARTICLE' | 'QUIZ' | 'SIMULATION';
  order: number;
  completed: boolean;
}

export interface UserProgress {
  userId: string;
  coursesCompleted: number;
  totalTimeSpent: number;
  currentStreak: number;
  longestStreak: number;
  achievements: Achievement[];
  level: number;
  experiencePoints: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
}

// Challenge Types
export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'BUDGET' | 'INVEST' | 'SAVE' | 'QUIZ';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  points: number;
  startDate: Date;
  endDate: Date;
  participants: number;
  status: 'ACTIVE' | 'COMPLETED' | 'UPCOMING';
}

export interface Leaderboard {
  challengeId: string;
  entries: LeaderboardEntry[];
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatar?: string;
  score: number;
}

// Stock Market Types
export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  dayHigh: number;
  dayLow: number;
  yearHigh: number;
  yearLow: number;
}

export interface MarketNews {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: Date;
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
}

// AI Chatbot Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  userId: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

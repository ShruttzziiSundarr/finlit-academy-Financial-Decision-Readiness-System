import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  scalar DateTime

  type User {
    id: ID!
    email: String!
    username: String!
    firstName: String!
    lastName: String!
    avatar: String
    createdAt: DateTime!
    updatedAt: DateTime!
    progress: UserProgress
    portfolio: Portfolio
  }

  type AuthPayload {
    token: String!
    refreshToken: String!
    user: User!
  }

  type UserProgress {
    userId: ID!
    coursesCompleted: Int!
    totalTimeSpent: Int!
    currentStreak: Int!
    longestStreak: Int!
    achievements: [Achievement!]!
    level: Int!
    experiencePoints: Int!
  }

  type Achievement {
    id: ID!
    name: String!
    description: String!
    icon: String!
    unlockedAt: DateTime
  }

  type Portfolio {
    id: ID!
    userId: ID!
    totalValue: Float!
    cashBalance: Float!
    holdings: [Holding!]!
    transactions: [Transaction!]!
    performanceData: PerformanceData!
  }

  type Holding {
    id: ID!
    symbol: String!
    name: String!
    shares: Float!
    avgCostPerShare: Float!
    currentPrice: Float!
    totalValue: Float!
    gainLoss: Float!
    gainLossPercent: Float!
  }

  type Transaction {
    id: ID!
    type: TransactionType!
    symbol: String!
    shares: Float!
    pricePerShare: Float!
    totalAmount: Float!
    timestamp: DateTime!
  }

  enum TransactionType {
    BUY
    SELL
  }

  type PerformanceData {
    totalGainLoss: Float!
    totalGainLossPercent: Float!
    dailyChange: Float!
    dailyChangePercent: Float!
    historicalData: [HistoricalDataPoint!]!
  }

  type HistoricalDataPoint {
    date: DateTime!
    value: Float!
  }

  type Budget {
    id: ID!
    userId: ID!
    name: String!
    totalIncome: Float!
    categories: [BudgetCategory!]!
    expenses: [Expense!]!
    savingsGoal: Float!
    currentSavings: Float!
  }

  type BudgetCategory {
    id: ID!
    name: String!
    allocatedAmount: Float!
    spentAmount: Float!
    color: String!
    icon: String!
  }

  type Expense {
    id: ID!
    categoryId: ID!
    description: String!
    amount: Float!
    date: DateTime!
    recurring: Boolean!
    frequency: ExpenseFrequency
  }

  enum ExpenseFrequency {
    DAILY
    WEEKLY
    MONTHLY
    YEARLY
  }

  type Course {
    id: ID!
    title: String!
    description: String!
    difficulty: CourseDifficulty!
    estimatedMinutes: Int!
    modules: [Module!]!
    progress: Float!
    completed: Boolean!
  }

  enum CourseDifficulty {
    BEGINNER
    INTERMEDIATE
    ADVANCED
  }

  type Module {
    id: ID!
    courseId: ID!
    title: String!
    content: String!
    type: ModuleType!
    order: Int!
    completed: Boolean!
  }

  enum ModuleType {
    VIDEO
    ARTICLE
    QUIZ
    SIMULATION
  }

  type Challenge {
    id: ID!
    title: String!
    description: String!
    type: ChallengeType!
    difficulty: ChallengeDifficulty!
    points: Int!
    startDate: DateTime!
    endDate: DateTime!
    participants: Int!
    status: ChallengeStatus!
  }

  enum ChallengeType {
    BUDGET
    INVEST
    SAVE
    QUIZ
  }

  enum ChallengeDifficulty {
    EASY
    MEDIUM
    HARD
  }

  enum ChallengeStatus {
    ACTIVE
    COMPLETED
    UPCOMING
  }

  type Leaderboard {
    challengeId: ID!
    entries: [LeaderboardEntry!]!
  }

  type LeaderboardEntry {
    rank: Int!
    userId: ID!
    username: String!
    avatar: String
    score: Int!
  }

  type StockQuote {
    symbol: String!
    name: String!
    price: Float!
    change: Float!
    changePercent: Float!
    volume: Int!
    marketCap: Float!
    dayHigh: Float!
    dayLow: Float!
    yearHigh: Float!
    yearLow: Float!
  }

  type MarketNews {
    id: ID!
    title: String!
    summary: String!
    source: String!
    url: String!
    publishedAt: DateTime!
    sentiment: NewsSentiment!
  }

  enum NewsSentiment {
    POSITIVE
    NEUTRAL
    NEGATIVE
  }

  type ChatMessage {
    id: ID!
    role: MessageRole!
    content: String!
    timestamp: DateTime!
  }

  enum MessageRole {
    USER
    ASSISTANT
  }

  type ChatSession {
    id: ID!
    userId: ID!
    messages: [ChatMessage!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  input RegisterInput {
    email: String!
    username: String!
    password: String!
    firstName: String!
    lastName: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input TradeInput {
    symbol: String!
    shares: Float!
    type: TransactionType!
  }

  input CreateExpenseInput {
    categoryId: ID!
    description: String!
    amount: Float!
    date: DateTime!
    recurring: Boolean!
    frequency: ExpenseFrequency
  }

  input ChatInput {
    sessionId: ID
    message: String!
  }

  type Query {
    # User queries
    me: User
    user(id: ID!): User

    # Portfolio queries
    portfolio: Portfolio
    stockQuote(symbol: String!): StockQuote
    searchStocks(query: String!): [StockQuote!]!
    marketNews(limit: Int): [MarketNews!]!

    # Budget queries
    budget: Budget

    # Learning queries
    courses(difficulty: CourseDifficulty): [Course!]!
    course(id: ID!): Course
    recommendedCourses: [Course!]!

    # Challenge queries
    challenges(status: ChallengeStatus): [Challenge!]!
    challenge(id: ID!): Challenge
    leaderboard(challengeId: ID!): Leaderboard

    # Chat queries
    chatSession(id: ID!): ChatSession
    chatHistory: [ChatSession!]!
  }

  type Mutation {
    # Auth mutations
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    refreshToken(refreshToken: String!): AuthPayload!

    # Portfolio mutations
    executeTrade(input: TradeInput!): Transaction!

    # Budget mutations
    createExpense(input: CreateExpenseInput!): Expense!
    updateExpense(id: ID!, input: CreateExpenseInput!): Expense!
    deleteExpense(id: ID!): Boolean!

    # Learning mutations
    completeModule(moduleId: ID!): Module!

    # Challenge mutations
    joinChallenge(challengeId: ID!): Challenge!
    submitChallengeResult(challengeId: ID!, score: Int!): Boolean!

    # Chat mutations
    sendMessage(input: ChatInput!): ChatMessage!
  }

  type Subscription {
    # Real-time portfolio updates
    portfolioUpdated(userId: ID!): Portfolio!

    # Real-time challenge updates
    challengeLeaderboardUpdated(challengeId: ID!): Leaderboard!

    # Real-time chat
    messageSent(sessionId: ID!): ChatMessage!
  }
`;

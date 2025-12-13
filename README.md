# 🎮 FinLit Academy - Gamified Financial Literacy Platform

## Overview
A Minecraft/Roblox-inspired financial literacy platform that makes learning about money FUN! Battle financial challenges, trade stocks in real-time, and level up your money skills.

### Problem Statement
66% of Americans are financially illiterate, leading to poor financial decisions, debt accumulation, and inability to build wealth.

### Solution
A **GAMING-FIRST** learning platform featuring:
- 🎯 **Battle Arena** - Compete in financial challenges and earn legendary rewards
- 📈 **Stock Battleground** - Real-time stock trading with Alpha Vantage API integration
- 💰 **Budget Arena** - Track expenses with fully functional budget categories
- 📚 **Learning Modules** - Interactive lessons with gaming progression
- 🏆 **Leaderboards** - Compete with other warriors (100% private data)
- 🌟 **Gaming Theme** - Purple/black Minecraft-style UI with glowing effects
- 📱 **Mobile-responsive** - Play anywhere, anytime

## Technical Stack

### Frontend
- **Framework**: Next.js 14 (React)
- **UI Library**: Tailwind CSS + shadcn/ui
- **Data Visualization**: Chart.js, D3.js
- **State Management**: Zustand
- **Real-time**: Socket.io-client
- **API Client**: Apollo Client (GraphQL)

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **API**: GraphQL (Apollo Server)
- **Database**: PostgreSQL
- **Caching**: Redis
- **Real-time**: Socket.io
- **Authentication**: JWT + bcrypt

### AI/ML Integration
- **Recommendation System**: Collaborative Filtering
- **NLP Chatbot**: OpenAI API (GPT-4) with RAG
- **Sentiment Analysis**: Custom model or cloud API
- **Predictive Analytics**: TensorFlow.js

### External APIs
- **Market Data**: Alpha Vantage / Finnhub
- **Banking Integration**: Plaid API
- **Payment Processing**: Stripe (for premium features)

## Project Structure

```
finlit-academy/
├── frontend/               # Next.js application
│   ├── src/
│   │   ├── app/           # App router pages
│   │   ├── components/    # React components
│   │   ├── lib/           # Utilities and helpers
│   │   ├── hooks/         # Custom React hooks
│   │   ├── store/         # State management
│   │   └── types/         # TypeScript types
│   └── public/            # Static assets
├── backend/               # Node.js API server
│   ├── src/
│   │   ├── graphql/       # GraphQL schema and resolvers
│   │   ├── models/        # Database models
│   │   ├── services/      # Business logic
│   │   ├── middleware/    # Express middleware
│   │   ├── utils/         # Utilities
│   │   └── config/        # Configuration
│   └── tests/             # Backend tests
└── docs/                  # Documentation
```

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis 7+
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd finlit-academy
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env
```

4. Set up database
```bash
cd backend
npm run db:migrate
npm run db:seed
```

5. Start development servers
```bash
npm run dev
```

Frontend: http://localhost:3000
Backend: http://localhost:4000
GraphQL Playground: http://localhost:4000/graphql

## Features

### 1. Interactive Budgeting Simulator
- Real-time expense tracking
- Category-based budget allocation
- Visual analytics with charts
- Savings goal tracking

### 2. Stock Market Simulation
- Virtual portfolio with $100,000 starting capital
- Real-time market data integration
- Buy/sell transactions
- Performance analytics
- Historical portfolio tracking

### 3. AI Financial Advisor
- Natural language query processing
- Personalized financial advice
- Context-aware responses
- Learning resource recommendations

### 4. Adaptive Learning System
- ML-powered difficulty adjustment
- Personalized learning paths
- Progress tracking and analytics
- Achievement system

### 5. Community Features
- Weekly financial challenges
- Global leaderboards
- Peer-to-peer learning
- Social sharing

### 6. PWA Support
- Offline capability
- Push notifications
- Mobile-optimized UI
- Install to home screen

## Key Innovations

1. **Real-world Simulations**: Practice with actual market data in a risk-free environment
2. **AI Personalization**: Adaptive learning paths based on user progress and goals
3. **Gamification**: Engaging challenges and rewards to maintain motivation
4. **Accessibility**: Multilingual support and inclusive design
5. **Privacy-first**: Optional banking integration with full data control

## project outcomes

This project demonstrates:
- Commitment to financial wellness and education
- Strong UX design principles
- Practical application of AI in fintech
- Full-stack development capabilities
- Understanding of financial services technology
- Scalable architecture design

## License
MIT

## Contributing
Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

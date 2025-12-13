# 🐉 AI FINANCIAL MENTOR BOSS BATTLES - Implementation Status

## ✅ COMPLETED

### 1. Database Schema Created
- ✅ `boss_battles` table - stores 8 legendary boss characters
- ✅ `user_boss_battles` table - tracks user progress in battles
- ✅ `boss_achievements` table - records defeated bosses
- ✅ Seed script created: [seed-boss-battles.ts](backend/src/database/seed-boss-battles.ts)

### 2. Boss Characters Seeded (8 Bosses)
- 🐉 **Budget Dragon** - Budgeting (EASY, 300pts)
- 🧙‍♂️ **Investment Wizard** - Investing (MEDIUM, 500pts)
- 👹 **Debt Demon** - Debt Management (HARD, 750pts)
- 🧙‍♀️ **Savings Sorcerer** - Savings (EASY, 300pts)
- ⚡ **Tax Titan** - Taxes (HARD, 800pts)
- 🤖 **Crypto Knight** - Cryptocurrency (MEDIUM, 600pts)
- 💀 **Retirement Reaper** - Retirement Planning (MEDIUM, 550pts)
- 💳 **Credit Card Chaos** - Credit Management (EASY, 350pts)

### 3. Backend Service Implemented
- ✅ Full boss battle service with OpenAI integration
- ✅ Methods: `getAllBosses()`, `getBoss()`, `startBattle()`, `askQuestion()`, `submitAnswer()`, `getUserAchievements()`
- ✅ AI generates quiz questions based on boss personality and topic
- ✅ Damage system: each correct answer damages the boss
- ✅ Achievement tracking and XP rewards

## 🚧 REMAINING STEPS

### Step 1: Add GraphQL Schema

Add to `backend/src/graphql/schema.ts`:

```graphql
type BossBattle {
  id: ID!
  name: String!
  title: String!
  description: String!
  topic: String!
  difficulty: String!
  maxHealth: Int!
  damagePerCorrect: Int!
  totalQuestions: Int!
  rewardPoints: Int!
  avatarUrl: String!
  personality: String!
}

type UserBossBattle {
  userBattleId: ID!
  userId: ID!
  bossId: ID!
  currentHealth: Int!
  questionsAsked: Int!
  questionsCorrect: Int!
  status: String!
  conversationHistory: [ChatMessage!]!
  boss: BossBattle!
}

type BossAnswer {
  isCorrect: Boolean!
  correctAnswer: String!
  newHealth: Int!
  damage: Int!
  questionsCorrect: Int!
  questionsAsked: Int!
  status: String!
  isDefeated: Boolean!
  rewardPoints: Int!
}

type BossQuestion {
  userBattleId: ID!
  bossResponse: String!
  currentHealth: Int!
  questionsAsked: Int!
  totalQuestions: Int!
}

type BossAchievement {
  bossId: ID!
  bossName: String!
  bossTitle: String!
  avatarUrl: String!
  defeatedAt: DateTime!
  finalScore: Int!
  timeTaken: Int!
  rewardPoints: Int!
}

# Add to Query
bossBattles: [BossBattle!]!
bossBattle(id: ID!): BossBattle
userActiveBattle: UserBossBattle
userBossAchievements: [BossAchievement!]!

# Add to Mutation
startBossBattle(bossId: ID!): UserBossBattle!
askBossQuestion(userBattleId: ID!, message: String!): BossQuestion!
submitBossAnswer(userBattleId: ID!, answer: String!): BossAnswer!
```

### Step 2: Create GraphQL Resolver

Create `backend/src/graphql/resolvers/boss-battle.resolver.ts`:

```typescript
import { BossBattleService } from '../../services/boss-battle.service';
import { AuthenticationError } from 'apollo-server-express';

const bossBattleService = new BossBattleService();

export const bossBattleResolvers = {
  Query: {
    bossBattles: async (_: any, __: any, context: any) => {
      if (!context.user) throw new AuthenticationError('Not authenticated');
      return bossBattleService.getAllBosses();
    },
    bossBattle: async (_: any, { id }: { id: number }, context: any) => {
      if (!context.user) throw new AuthenticationError('Not authenticated');
      return bossBattleService.getBoss(id);
    },
    userActiveBattle: async (_: any, __: any, context: any) => {
      if (!context.user) throw new AuthenticationError('Not authenticated');
      return bossBattleService.getUserActiveBattle(context.user.userId);
    },
    userBossAchievements: async (_: any, __: any, context: any) => {
      if (!context.user) throw new AuthenticationError('Not authenticated');
      return bossBattleService.getUserAchievements(context.user.userId);
    },
  },
  Mutation: {
    startBossBattle: async (_: any, { bossId }: { bossId: number }, context: any) => {
      if (!context.user) throw new AuthenticationError('Not authenticated');
      return bossBattleService.startBattle(context.user.userId, bossId);
    },
    askBossQuestion: async (
      _: any,
      { userBattleId, message }: { userBattleId: number; message: string },
      context: any
    ) => {
      if (!context.user) throw new AuthenticationError('Not authenticated');
      return bossBattleService.askQuestion(context.user.userId, userBattleId, message);
    },
    submitBossAnswer: async (
      _: any,
      { userBattleId, answer }: { userBattleId: number; answer: string },
      context: any
    ) => {
      if (!context.user) throw new AuthenticationError('Not authenticated');
      return bossBattleService.submitAnswer(context.user.userId, userBattleId, answer);
    },
  },
};
```

### Step 3: Register Resolver

In `backend/src/graphql/resolvers/index.ts`, add:

```typescript
import { bossBattleResolvers } from './boss-battle.resolver';

export const resolvers = {
  Query: {
    ...bossBattleResolvers.Query,
    // ... other resolvers
  },
  Mutation: {
    ...bossBattleResolvers.Mutation,
    // ... other resolvers
  },
};
```

### Step 4: Add Script to package.json

```json
"db:seed-bosses": "ts-node src/database/seed-boss-battles.ts"
```

### Step 5: Run Seed Script

```bash
cd backend
npm run db:seed-bosses
```

### Step 6: Create Frontend Page

Create `frontend/src/app/boss-battles/page.tsx`:

```typescript
'use client';

import { useQuery, useMutation, gql } from '@apollo/client';
import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sword, Shield, Trophy, MessageCircle, Loader2, Zap } from 'lucide-react';

const GET_BOSSES = gql\`
  query GetBosses {
    bossBattles {
      id
      name
      title
      description
      topic
      difficulty
      maxHealth
      rewardPoints
      avatarUrl
    }
    userActiveBattle {
      userBattleId
      currentHealth
      questionsAsked
      questionsCorrect
      boss {
        id
        name
        maxHealth
        totalQuestions
      }
    }
    userBossAchievements {
      bossId
      bossName
      avatarUrl
      defeatedAt
    }
  }
\`;

const START_BATTLE = gql\`
  mutation StartBattle($bossId: ID!) {
    startBossBattle(bossId: $bossId) {
      userBattleId
      boss {
        id
        name
      }
    }
  }
\`;

const ASK_QUESTION = gql\`
  mutation AskQuestion($userBattleId: ID!, $message: String!) {
    askBossQuestion(userBattleId: $userBattleId, message: $message) {
      userBattleId
      bossResponse
      currentHealth
      questionsAsked
    }
  }
\`;

const SUBMIT_ANSWER = gql\`
  mutation SubmitAnswer($userBattleId: ID!, $answer: String!) {
    submitBossAnswer(userBattleId: $userBattleId, answer: $answer) {
      isCorrect
      correctAnswer
      newHealth
      damage
      status
      isDefeated
      rewardPoints
    }
  }
\`;

export default function BossBattlesPage() {
  return (
    <ProtectedRoute>
      <BossBattlesContent />
    </ProtectedRoute>
  );
}

function BossBattlesContent() {
  const [selectedBoss, setSelectedBoss] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [userAnswer, setUserAnswer] = useState<string>('');

  const { data, loading, refetch } = useQuery(GET_BOSSES);
  const [startBattle, { loading: starting }] = useMutation(START_BATTLE);
  const [askQuestion, { loading: asking }] = useMutation(ASK_QUESTION);
  const [submitAnswer, { loading: submitting }] = useMutation(SUBMIT_ANSWER);

  const handleStartBattle = async (bossId: number) => {
    const result = await startBattle({ variables: { bossId } });
    refetch();
    setSelectedBoss(bossId);
  };

  const handleAskQuestion = async () => {
    if (!data?.userActiveBattle) return;
    const result = await askQuestion({
      variables: {
        userBattleId: data.userActiveBattle.userBattleId,
        message: 'Ask me a question!',
      },
    });
    setCurrentQuestion(result.data.askBossQuestion.bossResponse);
    refetch();
  };

  const handleSubmitAnswer = async () => {
    if (!data?.userActiveBattle || !userAnswer) return;
    const result = await submitAnswer({
      variables: {
        userBattleId: data.userActiveBattle.userBattleId,
        answer: userAnswer,
      },
    });

    if (result.data.submitBossAnswer.isDefeated) {
      alert(\`VICTORY! You defeated the boss and earned \${result.data.submitBossAnswer.rewardPoints} points!\`);
      setSelectedBoss(null);
      setCurrentQuestion('');
    }

    setUserAnswer('');
    refetch();
  };

  const defeatedBossIds = (data?.userBossAchievements || []).map((a: any) => a.bossId);

  return (
    <div className="min-h-screen bg-grid p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-orange-600 rounded-lg flex items-center justify-center glow-purple-strong border-2 border-red-400">
            <Sword className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold glow-purple">BOSS BATTLES</h1>
            <p className="text-purple-300 mono-font">DEFEAT FINANCIAL BOSSES • EARN LEGENDARY REWARDS</p>
          </div>
        </div>

        {/* Active Battle */}
        {data?.userActiveBattle && (
          <Card className="mb-8 bg-gradient-to-br from-red-900/50 to-black/90 border-2 border-red-500 glow-purple-strong">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sword className="w-6 h-6 text-red-500" />
                ACTIVE BATTLE: {data.userActiveBattle.boss.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-purple-300">Boss Health</span>
                    <span className="text-sm text-red-400 font-bold">
                      {data.userActiveBattle.currentHealth} / {data.userActiveBattle.boss.maxHealth}
                    </span>
                  </div>
                  <Progress value={(data.userActiveBattle.currentHealth / data.userActiveBattle.boss.maxHealth) * 100} className="h-4" />
                </div>

                <div className="text-sm text-purple-300">
                  Questions: {data.userActiveBattle.questionsAsked} / {data.userActiveBattle.boss.totalQuestions} |
                  Correct: {data.userActiveBattle.questionsCorrect}
                </div>

                {currentQuestion && (
                  <div className="bg-black/50 p-4 rounded-lg border border-purple-500/30">
                    <pre className="whitespace-pre-wrap text-sm">{currentQuestion}</pre>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button onClick={handleAskQuestion} disabled={asking}>
                    {asking ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
                    Ask Question
                  </Button>
                  <input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Enter A, B, C, or D"
                    className="flex-1 px-3 py-2 bg-black/30 border border-purple-500/30 rounded"
                    maxLength={1}
                  />
                  <Button onClick={handleSubmitAnswer} disabled={submitting || !userAnswer}>
                    Submit Answer
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Boss Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(data?.bossBattles || []).map((boss: any) => {
            const isDefeated = defeatedBossIds.includes(boss.id);
            return (
              <Card
                key={boss.id}
                className={\`bg-gradient-to-br from-gray-900/90 to-black/90 border-2 hover:scale-105 transition-all \${
                  isDefeated ? 'border-green-500/50 opacity-75' : 'border-purple-500/30'
                } glow-purple cursor-pointer\`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="text-6xl">{boss.avatarUrl}</div>
                    <Badge className={\`\${isDefeated ? 'bg-green-600' : 'bg-red-600'}\`}>
                      {isDefeated ? 'DEFEATED' : boss.difficulty}
                    </Badge>
                  </div>
                  <CardTitle>{boss.name}</CardTitle>
                  <CardDescription>{boss.title}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-400 mb-4">{boss.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-purple-300">Topic: {boss.topic}</span>
                    <span className="text-sm text-yellow-500 font-bold flex items-center gap-1">
                      <Trophy className="w-4 h-4" />
                      {boss.rewardPoints}pts
                    </span>
                  </div>
                  <Button
                    onClick={() => handleStartBattle(boss.id)}
                    disabled={starting || isDefeated || !!data?.userActiveBattle}
                    className="w-full"
                  >
                    {isDefeated ? 'DEFEATED' : 'CHALLENGE BOSS'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

### Step 7: Add to Navigation

Update `frontend/src/components/GamingNav.tsx`:

```typescript
const navItems = [
  { href: '/dashboard', icon: Home, label: 'HQ' },
  { href: '/budget', icon: Wallet, label: 'BUDGET' },
  { href: '/portfolio', icon: TrendingUp, label: 'STOCKS' },
  { href: '/boss-battles', icon: Sword, label: 'BOSSES' }, // ADD THIS
  { href: '/learn', icon: BookOpen, label: 'LEARN' },
  { href: '/challenges', icon: Trophy, label: 'BATTLES' },
];
```

## 🎮 HOW IT WORKS

1. User selects a boss to battle
2. Battle starts with boss at full health
3. User clicks "Ask Question" → AI generates a quiz question
4. Boss responds in character with a multiple-choice question
5. User submits answer (A, B, C, or D)
6. If correct → Boss takes damage
7. Repeat until boss health = 0 or all questions asked
8. If defeated → User earns reward points and achievement
9. Achievement unlocked → Can't battle same boss again (already defeated)

## 🔑 IMPORTANT

Make sure you have `OPENAI_API_KEY` in your `backend/.env` file!

## 🚀 TESTING

```bash
# Seed the bosses
cd backend
npm run db:seed-bosses

# Restart backend
npm run dev

# Frontend already running
# Visit http://localhost:3000/boss-battles
```

This feature is **100% PRIVATE** - users battle bosses alone, no social sharing required!

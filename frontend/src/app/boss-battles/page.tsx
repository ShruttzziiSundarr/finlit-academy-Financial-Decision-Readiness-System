'use client';

import { useQuery, useMutation, gql } from '@apollo/client';
import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sword, Shield, Trophy, MessageCircle, Loader2, Zap } from 'lucide-react';

const GET_BOSSES = gql`
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
`;

const START_BATTLE = gql`
  mutation StartBattle($bossId: ID!) {
    startBossBattle(bossId: $bossId) {
      userBattleId
      boss {
        id
        name
      }
    }
  }
`;

const ASK_QUESTION = gql`
  mutation AskQuestion($userBattleId: ID!, $message: String!) {
    askBossQuestion(userBattleId: $userBattleId, message: $message) {
      userBattleId
      bossResponse
      currentHealth
      questionsAsked
    }
  }
`;

const SUBMIT_ANSWER = gql`
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
`;

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
  const [feedback, setFeedback] = useState<string>('');

  const { data, loading, refetch } = useQuery(GET_BOSSES);
  const [startBattle, { loading: starting }] = useMutation(START_BATTLE);
  const [askQuestion, { loading: asking }] = useMutation(ASK_QUESTION);
  const [submitAnswer, { loading: submitting }] = useMutation(SUBMIT_ANSWER);

  const handleStartBattle = async (bossId: number) => {
    try {
      const result = await startBattle({ variables: { bossId: bossId.toString() } });
      await refetch();
      setSelectedBoss(bossId);
      setFeedback('');
      setCurrentQuestion('');
    } catch (error: any) {
      setFeedback(`Error: ${error.message}`);
    }
  };

  const handleAskQuestion = async () => {
    if (!data?.userActiveBattle) return;
    try {
      const result = await askQuestion({
        variables: {
          userBattleId: data.userActiveBattle.userBattleId.toString(),
          message: 'Ask me a question!',
        },
      });
      setCurrentQuestion(result.data.askBossQuestion.bossResponse);
      setFeedback('');
      await refetch();
    } catch (error: any) {
      setFeedback(`Error: ${error.message}`);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!data?.userActiveBattle || !userAnswer) return;
    try {
      const result = await submitAnswer({
        variables: {
          userBattleId: data.userActiveBattle.userBattleId.toString(),
          answer: userAnswer,
        },
      });

      const answerData = result.data.submitBossAnswer;

      if (answerData.isCorrect) {
        setFeedback(`✅ CORRECT! Dealt ${answerData.damage} damage! Boss health: ${answerData.newHealth}`);
      } else {
        setFeedback(`❌ WRONG! The correct answer was ${answerData.correctAnswer}`);
      }

      if (answerData.isDefeated) {
        setFeedback(`🎉 VICTORY! You defeated the boss and earned ${answerData.rewardPoints} points!`);
        setSelectedBoss(null);
        setCurrentQuestion('');
        setTimeout(() => {
          refetch();
        }, 2000);
      }

      setUserAnswer('');
      await refetch();
    } catch (error: any) {
      setFeedback(`Error: ${error.message}`);
    }
  };

  const defeatedBossIds = (data?.userBossAchievements || []).map((a: any) => a.bossId);

  if (loading) {
    return (
      <div className="min-h-screen bg-grid flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
      </div>
    );
  }

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

                {feedback && (
                  <div className="bg-purple-900/30 p-4 rounded-lg border border-purple-500/50">
                    <p className="text-sm text-purple-200">{feedback}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button onClick={handleAskQuestion} disabled={asking || submitting}>
                    {asking ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
                    <span className="ml-2">Ask Question</span>
                  </Button>
                  <input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value.toUpperCase())}
                    placeholder="Enter A, B, C, or D"
                    className="flex-1 px-3 py-2 bg-black/30 border border-purple-500/30 rounded text-white"
                    maxLength={1}
                  />
                  <Button onClick={handleSubmitAnswer} disabled={submitting || !userAnswer || asking}>
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Answer'}
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
                className={`bg-gradient-to-br from-gray-900/90 to-black/90 border-2 hover:scale-105 transition-all ${
                  isDefeated ? 'border-green-500/50 opacity-75' : 'border-purple-500/30'
                } glow-purple cursor-pointer`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="text-6xl">{boss.avatarUrl}</div>
                    <Badge className={`${isDefeated ? 'bg-green-600' : 'bg-red-600'}`}>
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

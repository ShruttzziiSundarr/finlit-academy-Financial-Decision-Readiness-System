'use client';

import { useQuery, useMutation, gql } from '@apollo/client';
import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Trophy,
  Users,
  Calendar,
  Target,
  Award,
  TrendingUp,
  Loader2,
  CheckCircle2,
  Clock,
  Medal,
  Star
} from 'lucide-react';

const GET_CHALLENGES = gql`
  query GetChallenges($status: ChallengeStatus) {
    challenges(status: $status) {
      id
      title
      description
      type
      difficulty
      points
      startDate
      endDate
      participants
      status
    }
  }
`;

const GET_LEADERBOARD = gql`
  query GetLeaderboard($challengeId: ID!) {
    leaderboard(challengeId: $challengeId) {
      challengeId
      entries {
        rank
        userId
        username
        avatar
        score
      }
    }
  }
`;

const JOIN_CHALLENGE = gql`
  mutation JoinChallenge($challengeId: ID!) {
    joinChallenge(challengeId: $challengeId) {
      id
      participants
    }
  }
`;

export default function ChallengesPage() {
  return (
    <ProtectedRoute>
      <ChallengesContent />
    </ProtectedRoute>
  );
}

function ChallengesContent() {
  const [selectedTab, setSelectedTab] = useState('ACTIVE');
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null);

  const { data, loading, error, refetch } = useQuery(GET_CHALLENGES, {
    variables: { status: selectedTab },
  });

  const { data: leaderboardData, loading: leaderboardLoading } = useQuery(GET_LEADERBOARD, {
    variables: { challengeId: selectedChallenge },
    skip: !selectedChallenge,
  });

  const [joinChallenge, { loading: joining }] = useMutation(JOIN_CHALLENGE, {
    onCompleted: () => {
      refetch();
    },
  });

  const handleJoinChallenge = async (challengeId: string) => {
    try {
      await joinChallenge({ variables: { challengeId } });
    } catch (err) {
      console.error('Error joining challenge:', err);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'HARD':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'BUDGET':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'INVEST':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'SAVE':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'QUIZ':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'BUDGET':
        return <Target className="w-5 h-5" />;
      case 'INVEST':
        return <TrendingUp className="w-5 h-5" />;
      case 'SAVE':
        return <Award className="w-5 h-5" />;
      case 'QUIZ':
        return <Trophy className="w-5 h-5" />;
      default:
        return <Star className="w-5 h-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Medal className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="text-gray-600 dark:text-gray-400 font-semibold">#{rank}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-grid">
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-600 to-amber-600 rounded-lg flex items-center justify-center glow-purple-strong border-2 border-yellow-400">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold glow-purple">BATTLE ARENA</h1>
              <p className="text-purple-300 mono-font text-lg">
                COMPETE • DOMINATE • EARN LEGENDARY REWARDS
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Challenges List */}
          <div className="lg:col-span-2">
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid w-full grid-cols-3 mb-6 bg-gradient-to-r from-gray-900/90 to-black/90 border-2 border-purple-500/30 glow-purple">
                <TabsTrigger value="ACTIVE" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white mono-font">ACTIVE</TabsTrigger>
                <TabsTrigger value="UPCOMING" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white mono-font">UPCOMING</TabsTrigger>
                <TabsTrigger value="COMPLETED" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white mono-font">COMPLETED</TabsTrigger>
              </TabsList>

              <TabsContent value={selectedTab} className="space-y-4">
                {loading && (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                    <span className="ml-2 text-purple-300 mono-font">LOADING BATTLES...</span>
                  </div>
                )}

                {error && (
                  <div className="bg-gradient-to-r from-red-900/50 to-black/50 border-2 border-red-500/50 text-red-400 px-4 py-3 rounded-lg glow-purple">
                    ERROR: Unable to load battles. Please refresh and try again.
                  </div>
                )}

                {data?.challenges && data.challenges.length > 0 ? (
                  data.challenges.map((challenge: any) => (
                    <Card
                      key={challenge.id}
                      className={`bg-gradient-to-br from-gray-900/90 to-black/90 border-2 hover:scale-105 transition-all cursor-pointer ${
                        selectedChallenge === challenge.id ? 'border-purple-400 glow-purple-strong' : 'border-purple-500/30 glow-purple'
                      }`}
                      onClick={() => setSelectedChallenge(challenge.id)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(challenge.type)}
                            <Badge className={getTypeColor(challenge.type)}>
                              {challenge.type}
                            </Badge>
                            <Badge className={getDifficultyColor(challenge.difficulty)}>
                              {challenge.difficulty}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1 text-yellow-500">
                            <Trophy className="w-4 h-4" />
                            <span className="font-bold">{challenge.points} pts</span>
                          </div>
                        </div>
                        <CardTitle className="text-xl">{challenge.title}</CardTitle>
                        <CardDescription>{challenge.description}</CardDescription>
                      </CardHeader>

                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Users className="w-4 h-4" />
                            <span>{challenge.participants} participants</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {challenge.status === 'UPCOMING'
                                ? `Starts ${formatDate(challenge.startDate)}`
                                : `Ends ${formatDate(challenge.endDate)}`
                              }
                            </span>
                          </div>
                        </div>
                      </CardContent>

                      <CardFooter>
                        {challenge.status === 'ACTIVE' && (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleJoinChallenge(challenge.id);
                            }}
                            disabled={joining}
                            className="w-full"
                          >
                            {joining ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Joining...
                              </>
                            ) : (
                              <>
                                <Trophy className="w-4 h-4 mr-2" />
                                Join Challenge
                              </>
                            )}
                          </Button>
                        )}
                        {challenge.status === 'UPCOMING' && (
                          <Button variant="outline" className="w-full" disabled>
                            <Clock className="w-4 h-4 mr-2" />
                            Coming Soon
                          </Button>
                        )}
                        {challenge.status === 'COMPLETED' && (
                          <Button variant="outline" className="w-full" disabled>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Challenge Ended
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  !loading && (
                    <div className="text-center py-12">
                      <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                        No {selectedTab.toLowerCase()} challenges
                      </h3>
                      <p className="text-gray-500">Check back soon for new challenges!</p>
                    </div>
                  )
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Leaderboard Panel */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Leaderboard
                </CardTitle>
                <CardDescription>
                  {selectedChallenge ? 'Top performers' : 'Select a challenge to view rankings'}
                </CardDescription>
              </CardHeader>

              <CardContent>
                {!selectedChallenge ? (
                  <div className="text-center py-8">
                    <Trophy className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">
                      Click on a challenge to see the leaderboard
                    </p>
                  </div>
                ) : leaderboardLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                  </div>
                ) : leaderboardData?.leaderboard?.entries?.length > 0 ? (
                  <div className="space-y-3">
                    {leaderboardData.leaderboard.entries.map((entry: any) => (
                      <div
                        key={entry.userId}
                        className={`flex items-center gap-3 p-3 rounded-lg ${
                          entry.rank <= 3
                            ? 'bg-gradient-to-r from-yellow-50 to-transparent dark:from-yellow-900/20'
                            : 'bg-gray-50 dark:bg-gray-800'
                        }`}
                      >
                        <div className="flex items-center justify-center w-8">
                          {getRankIcon(entry.rank)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{entry.username}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {entry.score} points
                          </p>
                        </div>
                        {entry.rank === 1 && (
                          <Trophy className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">
                      No participants yet. Be the first to join!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

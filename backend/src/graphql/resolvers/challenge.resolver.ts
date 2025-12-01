import { ChallengeService } from '../../services/challenge.service';
import { AuthenticationError } from 'apollo-server-express';

const challengeService = new ChallengeService();

export const challengeResolvers = {
  Query: {
    challenges: async (_: any, { status }: any, context: any) => {
      if (!context.user) {
        throw new AuthenticationError('Not authenticated');
      }
      return challengeService.getChallenges(status);
    },
    challenge: async (_: any, { id }: { id: string }, context: any) => {
      if (!context.user) {
        throw new AuthenticationError('Not authenticated');
      }
      return challengeService.getChallenge(id);
    },
    leaderboard: async (_: any, { challengeId }: { challengeId: string }, context: any) => {
      if (!context.user) {
        throw new AuthenticationError('Not authenticated');
      }
      return challengeService.getLeaderboard(challengeId);
    },
  },
  Mutation: {
    joinChallenge: async (_: any, { challengeId }: { challengeId: string }, context: any) => {
      if (!context.user) {
        throw new AuthenticationError('Not authenticated');
      }
      return challengeService.joinChallenge(context.user.userId, challengeId);
    },
    submitChallengeResult: async (
      _: any,
      { challengeId, score }: { challengeId: string; score: number },
      context: any
    ) => {
      if (!context.user) {
        throw new AuthenticationError('Not authenticated');
      }
      const result = await challengeService.submitResult(
        context.user.userId,
        challengeId,
        score
      );

      // Emit real-time leaderboard update
      context.io.to(`challenge-${challengeId}`).emit('leaderboard-updated');

      return result;
    },
  },
  Subscription: {
    challengeLeaderboardUpdated: {
      subscribe: (_: any, { challengeId }: { challengeId: string }, context: any) => {
        return context.pubsub.asyncIterator([`LEADERBOARD_UPDATED_${challengeId}`]);
      },
    },
  },
};

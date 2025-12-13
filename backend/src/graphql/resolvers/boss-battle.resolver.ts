import { BossBattleService } from '../../services/boss-battle.service';
import { AuthenticationError } from 'apollo-server-express';

const bossBattleService = new BossBattleService();

export const bossBattleResolvers = {
  Query: {
    bossBattles: async (_: any, __: any, context: any) => {
      if (!context.user) {
        throw new AuthenticationError('Not authenticated');
      }
      return bossBattleService.getAllBosses();
    },
    bossBattle: async (_: any, { id }: { id: number }, context: any) => {
      if (!context.user) {
        throw new AuthenticationError('Not authenticated');
      }
      return bossBattleService.getBoss(id);
    },
    userActiveBattle: async (_: any, __: any, context: any) => {
      if (!context.user) {
        throw new AuthenticationError('Not authenticated');
      }
      return bossBattleService.getUserActiveBattle(context.user.userId);
    },
    userBossAchievements: async (_: any, __: any, context: any) => {
      if (!context.user) {
        throw new AuthenticationError('Not authenticated');
      }
      return bossBattleService.getUserAchievements(context.user.userId);
    },
  },
  Mutation: {
    startBossBattle: async (_: any, { bossId }: { bossId: number }, context: any) => {
      if (!context.user) {
        throw new AuthenticationError('Not authenticated');
      }
      return bossBattleService.startBattle(context.user.userId, bossId);
    },
    askBossQuestion: async (
      _: any,
      { userBattleId, message }: { userBattleId: number; message: string },
      context: any
    ) => {
      if (!context.user) {
        throw new AuthenticationError('Not authenticated');
      }
      return bossBattleService.askQuestion(context.user.userId, userBattleId, message);
    },
    submitBossAnswer: async (
      _: any,
      { userBattleId, answer }: { userBattleId: number; answer: string },
      context: any
    ) => {
      if (!context.user) {
        throw new AuthenticationError('Not authenticated');
      }
      return bossBattleService.submitAnswer(context.user.userId, userBattleId, answer);
    },
  },
};

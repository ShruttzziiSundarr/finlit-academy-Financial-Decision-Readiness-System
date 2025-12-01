import { UserService } from '../../services/user.service';
import { AuthenticationError } from 'apollo-server-express';

const userService = new UserService();

export const userResolvers = {
  Query: {
    me: async (_: any, __: any, context: any) => {
      if (!context.user) {
        throw new AuthenticationError('Not authenticated');
      }
      return userService.getUserById(context.user.userId);
    },
    user: async (_: any, { id }: { id: string }, context: any) => {
      if (!context.user) {
        throw new AuthenticationError('Not authenticated');
      }
      return userService.getUserById(id);
    },
  },
  Mutation: {
    register: async (_: any, { input }: any) => {
      return userService.register(input);
    },
    login: async (_: any, { input }: any) => {
      return userService.login(input);
    },
    refreshToken: async (_: any, { refreshToken }: { refreshToken: string }) => {
      return userService.refreshToken(refreshToken);
    },
  },
};

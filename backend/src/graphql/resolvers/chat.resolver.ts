import { ChatService } from '../../services/chat.service';
import { AuthenticationError } from 'apollo-server-express';

const chatService = new ChatService();

export const chatResolvers = {
  Query: {
    chatSession: async (_: any, { id }: { id: string }, context: any) => {
      if (!context.user) {
        throw new AuthenticationError('Not authenticated');
      }
      return chatService.getSession(id);
    },
    chatHistory: async (_: any, __: any, context: any) => {
      if (!context.user) {
        throw new AuthenticationError('Not authenticated');
      }
      return chatService.getHistory(context.user.userId);
    },
  },
  Mutation: {
    sendMessage: async (_: any, { input }: any, context: any) => {
      if (!context.user) {
        throw new AuthenticationError('Not authenticated');
      }
      return chatService.sendMessage(context.user.userId, input);
    },
  },
  Subscription: {
    messageSent: {
      subscribe: (_: any, { sessionId }: { sessionId: string }, context: any) => {
        return context.pubsub.asyncIterator([`MESSAGE_SENT_${sessionId}`]);
      },
    },
  },
};

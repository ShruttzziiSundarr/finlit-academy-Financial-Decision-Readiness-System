import { userResolvers } from './user.resolver';
import { portfolioResolvers } from './portfolio.resolver';
import { budgetResolvers } from './budget.resolver';
import { courseResolvers } from './course.resolver';
import { challengeResolvers } from './challenge.resolver';
import { chatResolvers } from './chat.resolver';
import { bossBattleResolvers } from './boss-battle.resolver';
import { GraphQLScalarType, Kind } from 'graphql';

const dateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'DateTime custom scalar type',
  serialize(value: any) {
    return value instanceof Date ? value.toISOString() : null;
  },
  parseValue(value: any) {
    return new Date(value);
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  },
});

export const resolvers = {
  DateTime: dateTimeScalar,
  Query: {
    ...userResolvers.Query,
    ...portfolioResolvers.Query,
    ...budgetResolvers.Query,
    ...courseResolvers.Query,
    ...challengeResolvers.Query,
    ...chatResolvers.Query,
    ...bossBattleResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...portfolioResolvers.Mutation,
    ...budgetResolvers.Mutation,
    ...courseResolvers.Mutation,
    ...challengeResolvers.Mutation,
    ...chatResolvers.Mutation,
    ...bossBattleResolvers.Mutation,
  },
  Subscription: {
    ...portfolioResolvers.Subscription,
    ...challengeResolvers.Subscription,
    ...chatResolvers.Subscription,
  },
};

import { CourseService } from '../../services/course.service';
import { AuthenticationError } from 'apollo-server-express';

const courseService = new CourseService();

export const courseResolvers = {
  Query: {
    courses: async (_: any, { difficulty }: any, context: any) => {
      if (!context.user) {
        throw new AuthenticationError('Not authenticated');
      }
      return courseService.getCourses(context.user.userId, difficulty);
    },
    course: async (_: any, { id }: { id: string }, context: any) => {
      if (!context.user) {
        throw new AuthenticationError('Not authenticated');
      }
      return courseService.getCourse(id, context.user.userId);
    },
    recommendedCourses: async (_: any, __: any, context: any) => {
      if (!context.user) {
        throw new AuthenticationError('Not authenticated');
      }
      return courseService.getRecommendedCourses(context.user.userId);
    },
  },
  Mutation: {
    completeModule: async (_: any, { moduleId }: { moduleId: string }, context: any) => {
      if (!context.user) {
        throw new AuthenticationError('Not authenticated');
      }
      return courseService.completeModule(context.user.userId, moduleId);
    },
  },
};

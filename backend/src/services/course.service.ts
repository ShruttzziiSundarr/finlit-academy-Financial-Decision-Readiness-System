import { query } from '../database/connection';
import { UserInputError } from 'apollo-server-express';
import { logger } from '../utils/logger';

export class CourseService {
  async getCourses(userId: string, difficulty?: string) {
    try {
      let queryText = 'SELECT * FROM courses';
      const params: any[] = [];

      if (difficulty) {
        queryText += ' WHERE difficulty = $1';
        params.push(difficulty);
      }

      queryText += ' ORDER BY created_at DESC';

      const coursesResult = await query(queryText, params);

      return Promise.all(
        coursesResult.rows.map(async (course) => {
          const modulesResult = await query(
            'SELECT * FROM modules WHERE course_id = $1 ORDER BY order_index',
            [course.id]
          );

          const progressResult = await query(
            `SELECT COUNT(*) as completed FROM user_course_progress
             WHERE user_id = $1 AND module_id IN (SELECT id FROM modules WHERE course_id = $2) AND completed = true`,
            [userId, course.id]
          );

          const totalModules = modulesResult.rows.length;
          const completedModules = parseInt(progressResult.rows[0].completed);
          const progress = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;

          return {
            id: course.id,
            title: course.title,
            description: course.description,
            difficulty: course.difficulty,
            estimatedMinutes: course.estimated_minutes,
            progress,
            completed: progress === 100,
            modules: [],
          };
        })
      );
    } catch (error) {
      logger.error('Get courses error:', error);
      throw error;
    }
  }

  async getCourse(courseId: string, userId: string) {
    try {
      const courseResult = await query('SELECT * FROM courses WHERE id = $1', [courseId]);

      if (courseResult.rows.length === 0) {
        throw new UserInputError('Course not found');
      }

      const course = courseResult.rows[0];

      const modulesResult = await query(
        'SELECT * FROM modules WHERE course_id = $1 ORDER BY order_index',
        [courseId]
      );

      const modules = await Promise.all(
        modulesResult.rows.map(async (module) => {
          const progressResult = await query(
            'SELECT completed FROM user_course_progress WHERE user_id = $1 AND module_id = $2',
            [userId, module.id]
          );

          return {
            id: module.id,
            courseId: module.course_id,
            title: module.title,
            content: module.content,
            type: module.type,
            order: module.order_index,
            completed: progressResult.rows.length > 0 && progressResult.rows[0].completed,
          };
        })
      );

      const completedModules = modules.filter(m => m.completed).length;
      const progress = modules.length > 0 ? (completedModules / modules.length) * 100 : 0;

      return {
        id: course.id,
        title: course.title,
        description: course.description,
        difficulty: course.difficulty,
        estimatedMinutes: course.estimated_minutes,
        modules,
        progress,
        completed: progress === 100,
      };
    } catch (error) {
      logger.error('Get course error:', error);
      throw error;
    }
  }

  async getRecommendedCourses(userId: string) {
    try {
      // Simple recommendation: courses not completed yet
      const result = await query(
        `SELECT DISTINCT c.* FROM courses c
         WHERE c.id NOT IN (
           SELECT DISTINCT m.course_id FROM modules m
           JOIN user_course_progress ucp ON m.id = ucp.module_id
           WHERE ucp.user_id = $1 AND ucp.completed = true
           GROUP BY m.course_id
           HAVING COUNT(DISTINCT m.id) = (SELECT COUNT(*) FROM modules WHERE course_id = m.course_id)
         )
         LIMIT 5`,
        [userId]
      );

      return result.rows.map(course => ({
        id: course.id,
        title: course.title,
        description: course.description,
        difficulty: course.difficulty,
        estimatedMinutes: course.estimated_minutes,
        progress: 0,
        completed: false,
        modules: [],
      }));
    } catch (error) {
      logger.error('Get recommended courses error:', error);
      throw error;
    }
  }

  async completeModule(userId: string, moduleId: string) {
    try {
      await query(
        `INSERT INTO user_course_progress (user_id, module_id, completed, completed_at)
         VALUES ($1, $2, true, NOW())
         ON CONFLICT (user_id, module_id) DO UPDATE SET completed = true, completed_at = NOW()`,
        [userId, moduleId]
      );

      const moduleResult = await query('SELECT * FROM modules WHERE id = $1', [moduleId]);

      if (moduleResult.rows.length === 0) {
        throw new UserInputError('Module not found');
      }

      const module = moduleResult.rows[0];

      return {
        id: module.id,
        courseId: module.course_id,
        title: module.title,
        content: module.content,
        type: module.type,
        order: module.order_index,
        completed: true,
      };
    } catch (error) {
      logger.error('Complete module error:', error);
      throw error;
    }
  }
}

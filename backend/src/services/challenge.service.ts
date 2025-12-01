import { query } from '../database/connection';
import { UserInputError } from 'apollo-server-express';
import { logger } from '../utils/logger';

export class ChallengeService {
  async getChallenges(status?: string) {
    try {
      let queryText = 'SELECT * FROM challenges';
      const params: any[] = [];

      if (status) {
        queryText += ' WHERE status = $1';
        params.push(status);
      }

      queryText += ' ORDER BY start_date DESC';

      const result = await query(queryText, params);

      return Promise.all(
        result.rows.map(async (challenge) => {
          const participantsResult = await query(
            'SELECT COUNT(*) as count FROM challenge_participants WHERE challenge_id = $1',
            [challenge.id]
          );

          return {
            id: challenge.id,
            title: challenge.title,
            description: challenge.description,
            type: challenge.type,
            difficulty: challenge.difficulty,
            points: challenge.points,
            startDate: challenge.start_date,
            endDate: challenge.end_date,
            participants: parseInt(participantsResult.rows[0].count),
            status: challenge.status,
          };
        })
      );
    } catch (error) {
      logger.error('Get challenges error:', error);
      throw error;
    }
  }

  async getChallenge(challengeId: string) {
    try {
      const result = await query('SELECT * FROM challenges WHERE id = $1', [challengeId]);

      if (result.rows.length === 0) {
        throw new UserInputError('Challenge not found');
      }

      const challenge = result.rows[0];

      const participantsResult = await query(
        'SELECT COUNT(*) as count FROM challenge_participants WHERE challenge_id = $1',
        [challengeId]
      );

      return {
        id: challenge.id,
        title: challenge.title,
        description: challenge.description,
        type: challenge.type,
        difficulty: challenge.difficulty,
        points: challenge.points,
        startDate: challenge.start_date,
        endDate: challenge.end_date,
        participants: parseInt(participantsResult.rows[0].count),
        status: challenge.status,
      };
    } catch (error) {
      logger.error('Get challenge error:', error);
      throw error;
    }
  }

  async getLeaderboard(challengeId: string) {
    try {
      const result = await query(
        `SELECT cp.*, u.username, u.avatar,
         ROW_NUMBER() OVER (ORDER BY cp.score DESC) as rank
         FROM challenge_participants cp
         JOIN users u ON cp.user_id = u.id
         WHERE cp.challenge_id = $1
         ORDER BY cp.score DESC
         LIMIT 100`,
        [challengeId]
      );

      return {
        challengeId,
        entries: result.rows.map(row => ({
          rank: parseInt(row.rank),
          userId: row.user_id,
          username: row.username,
          avatar: row.avatar,
          score: row.score,
        })),
      };
    } catch (error) {
      logger.error('Get leaderboard error:', error);
      throw error;
    }
  }

  async joinChallenge(userId: string, challengeId: string) {
    try {
      await query(
        `INSERT INTO challenge_participants (challenge_id, user_id)
         VALUES ($1, $2)
         ON CONFLICT (challenge_id, user_id) DO NOTHING`,
        [challengeId, userId]
      );

      return this.getChallenge(challengeId);
    } catch (error) {
      logger.error('Join challenge error:', error);
      throw error;
    }
  }

  async submitResult(userId: string, challengeId: string, score: number) {
    try {
      await query(
        `UPDATE challenge_participants
         SET score = $1, completed_at = NOW()
         WHERE challenge_id = $2 AND user_id = $3`,
        [score, challengeId, userId]
      );

      return true;
    } catch (error) {
      logger.error('Submit challenge result error:', error);
      throw error;
    }
  }
}

import { query } from '../database/connection';
import { UserInputError } from 'apollo-server-express';
import { logger } from '../utils/logger';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface BossBattle {
  id: number;
  name: string;
  title: string;
  description: string;
  topic: string;
  difficulty: string;
  maxHealth: number;
  damagePerCorrect: number;
  totalQuestions: number;
  rewardPoints: number;
  avatarUrl: string;
  personality: string;
}

export class BossBattleService {
  async getAllBosses() {
    try {
      const result = await query('SELECT * FROM boss_battles ORDER BY difficulty, id');

      return result.rows.map(boss => ({
        id: boss.id,
        name: boss.name,
        title: boss.title,
        description: boss.description,
        topic: boss.topic,
        difficulty: boss.difficulty,
        maxHealth: boss.max_health,
        damagePerCorrect: boss.damage_per_correct,
        totalQuestions: boss.total_questions,
        rewardPoints: boss.reward_points,
        avatarUrl: boss.avatar_url,
        personality: boss.personality,
      }));
    } catch (error) {
      logger.error('Get all bosses error:', error);
      throw error;
    }
  }

  async getBoss(bossId: number) {
    try {
      const result = await query('SELECT * FROM boss_battles WHERE id = $1', [bossId]);

      if (result.rows.length === 0) {
        throw new UserInputError('Boss not found');
      }

      const boss = result.rows[0];
      return {
        id: boss.id,
        name: boss.name,
        title: boss.title,
        description: boss.description,
        topic: boss.topic,
        difficulty: boss.difficulty,
        maxHealth: boss.max_health,
        damagePerCorrect: boss.damage_per_correct,
        totalQuestions: boss.total_questions,
        rewardPoints: boss.reward_points,
        avatarUrl: boss.avatar_url,
        personality: boss.personality,
      };
    } catch (error) {
      logger.error('Get boss error:', error);
      throw error;
    }
  }

  async startBattle(userId: string, bossId: number) {
    try {
      const boss = await this.getBoss(bossId);

      // Check if user already has an active battle with this boss
      const existingBattle = await query(
        `SELECT * FROM user_boss_battles
         WHERE user_id = $1 AND boss_id = $2 AND status = 'IN_PROGRESS'`,
        [userId, bossId]
      );

      if (existingBattle.rows.length > 0) {
        // Return existing battle
        return this.formatUserBattle(existingBattle.rows[0], boss);
      }

      // Create new battle
      const result = await query(
        `INSERT INTO user_boss_battles (user_id, boss_id, current_health, status)
         VALUES ($1, $2, $3, 'IN_PROGRESS')
         RETURNING *`,
        [userId, bossId, boss.maxHealth]
      );

      logger.info(`User ${userId} started battle with ${boss.name}`);

      return this.formatUserBattle(result.rows[0], boss);
    } catch (error) {
      logger.error('Start battle error:', error);
      throw error;
    }
  }

  async getUserActiveBattle(userId: string) {
    try {
      const result = await query(
        `SELECT ubb.*, bb.*
         FROM user_boss_battles ubb
         JOIN boss_battles bb ON ubb.boss_id = bb.id
         WHERE ubb.user_id = $1 AND ubb.status = 'IN_PROGRESS'
         LIMIT 1`,
        [userId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        userBattleId: row.id,
        userId: row.user_id,
        bossId: row.boss_id,
        currentHealth: row.current_health,
        questionsAsked: row.questions_asked,
        questionsCorrect: row.questions_correct,
        status: row.status,
        conversationHistory: row.conversation_history || [],
        boss: {
          id: row.boss_id,
          name: row.name,
          title: row.title,
          description: row.description,
          topic: row.topic,
          difficulty: row.difficulty,
          maxHealth: row.max_health,
          damagePerCorrect: row.damage_per_correct,
          totalQuestions: row.total_questions,
          rewardPoints: row.reward_points,
          avatarUrl: row.avatar_url,
          personality: row.personality,
        },
      };
    } catch (error) {
      logger.error('Get user active battle error:', error);
      throw error;
    }
  }

  async askQuestion(userId: string, userBattleId: number, userMessage: string) {
    try {
      // Get the battle details
      const battleResult = await query(
        `SELECT ubb.*, bb.*
         FROM user_boss_battles ubb
         JOIN boss_battles bb ON ubb.boss_id = bb.id
         WHERE ubb.id = $1 AND ubb.user_id = $2`,
        [userBattleId, userId]
      );

      if (battleResult.rows.length === 0) {
        throw new UserInputError('Battle not found');
      }

      const battle = battleResult.rows[0];

      if (battle.status !== 'IN_PROGRESS') {
        throw new UserInputError('Battle is not active');
      }

      // Get conversation history
      const conversationHistory = battle.conversation_history || [];

      // Build system prompt based on boss personality
      const systemPrompt = `You are ${battle.name}, the ${battle.title}. ${battle.personality}

You are testing the user's knowledge about ${battle.topic}. Your goal is to:
1. Ask ONE clear, specific financial question about ${battle.topic}
2. The question should be ${battle.difficulty} difficulty
3. Provide 4 multiple choice options (A, B, C, D)
4. Keep your response in character
5. Be educational but engaging

Format your response EXACTLY like this:
QUESTION: [Your question here]
A) [Option A]
B) [Option B]
C) [Option C]
D) [Option D]
CORRECT_ANSWER: [A, B, C, or D]

Important: You must ALWAYS include the CORRECT_ANSWER line at the end!`;

      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory.map((msg: any) => ({
            role: msg.role,
            content: msg.content,
          })),
          { role: 'user', content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      const bossResponse = completion.choices[0].message.content || '';

      // Update conversation history
      const newHistory = [
        ...conversationHistory,
        { role: 'user', content: userMessage },
        { role: 'assistant', content: bossResponse },
      ];

      // Update battle
      await query(
        `UPDATE user_boss_battles
         SET conversation_history = $1, questions_asked = questions_asked + 1
         WHERE id = $2`,
        [JSON.stringify(newHistory), userBattleId]
      );

      logger.info(`Boss ${battle.name} asked question to user ${userId}`);

      return {
        userBattleId,
        bossResponse,
        currentHealth: battle.current_health,
        questionsAsked: battle.questions_asked + 1,
        totalQuestions: battle.total_questions,
      };
    } catch (error) {
      logger.error('Ask question error:', error);
      throw error;
    }
  }

  async submitAnswer(userId: string, userBattleId: number, userAnswer: string) {
    try {
      // Get the battle
      const battleResult = await query(
        `SELECT ubb.*, bb.*
         FROM user_boss_battles ubb
         JOIN boss_battles bb ON ubb.boss_id = bb.id
         WHERE ubb.id = $1 AND ubb.user_id = $2`,
        [userBattleId, userId]
      );

      if (battleResult.rows.length === 0) {
        throw new UserInputError('Battle not found');
      }

      const battle = battleResult.rows[0];
      const conversationHistory = battle.conversation_history || [];

      // Extract correct answer from last boss message
      const lastBossMessage = conversationHistory
        .slice()
        .reverse()
        .find((msg: any) => msg.role === 'assistant');

      if (!lastBossMessage) {
        throw new UserInputError('No question asked yet');
      }

      // Parse correct answer from boss response
      const correctAnswerMatch = lastBossMessage.content.match(/CORRECT_ANSWER:\s*([A-D])/i);
      const correctAnswer = correctAnswerMatch ? correctAnswerMatch[1].toUpperCase() : null;

      if (!correctAnswer) {
        throw new Error('Could not parse correct answer from boss response');
      }

      const isCorrect = userAnswer.toUpperCase() === correctAnswer;
      let newHealth = battle.current_health;
      let newQuestionsCorrect = battle.questions_correct;

      if (isCorrect) {
        newHealth = Math.max(0, battle.current_health - battle.damage_per_correct);
        newQuestionsCorrect += 1;
      }

      // Check if boss is defeated
      const isDefeated = newHealth <= 0;
      const isBattleComplete = battle.questions_asked >= battle.total_questions;

      let status = 'IN_PROGRESS';
      let completedAt = null;

      if (isDefeated || isBattleComplete) {
        status = isDefeated ? 'VICTORY' : (newQuestionsCorrect >= battle.total_questions * 0.6 ? 'VICTORY' : 'DEFEAT');
        completedAt = new Date();

        // Record achievement if victory
        if (status === 'VICTORY') {
          await query(
            `INSERT INTO boss_achievements (user_id, boss_id, final_score, time_taken)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (user_id, boss_id) DO NOTHING`,
            [
              userId,
              battle.boss_id,
              newQuestionsCorrect * 100,
              Math.floor((new Date().getTime() - new Date(battle.started_at).getTime()) / 1000),
            ]
          );

          // Award points to user
          await query(
            `UPDATE user_progress
             SET experience_points = experience_points + $1
             WHERE user_id = $2`,
            [battle.reward_points, userId]
          );

          logger.info(`User ${userId} defeated ${battle.name}! Earned ${battle.reward_points} points`);
        }
      }

      // Update battle
      await query(
        `UPDATE user_boss_battles
         SET current_health = $1,
             questions_correct = $2,
             status = $3,
             completed_at = $4
         WHERE id = $5`,
        [newHealth, newQuestionsCorrect, status, completedAt, userBattleId]
      );

      return {
        isCorrect,
        correctAnswer,
        newHealth,
        damage: isCorrect ? battle.damage_per_correct : 0,
        questionsCorrect: newQuestionsCorrect,
        questionsAsked: battle.questions_asked,
        status,
        isDefeated,
        rewardPoints: status === 'VICTORY' ? battle.reward_points : 0,
      };
    } catch (error) {
      logger.error('Submit answer error:', error);
      throw error;
    }
  }

  async getUserAchievements(userId: string) {
    try {
      const result = await query(
        `SELECT ba.*, bb.name, bb.title, bb.avatar_url, bb.reward_points
         FROM boss_achievements ba
         JOIN boss_battles bb ON ba.boss_id = bb.id
         WHERE ba.user_id = $1
         ORDER BY ba.defeated_at DESC`,
        [userId]
      );

      return result.rows.map(row => ({
        bossId: row.boss_id,
        bossName: row.name,
        bossTitle: row.title,
        avatarUrl: row.avatar_url,
        defeatedAt: row.defeated_at,
        finalScore: row.final_score,
        timeTaken: row.time_taken,
        rewardPoints: row.reward_points,
      }));
    } catch (error) {
      logger.error('Get user achievements error:', error);
      throw error;
    }
  }

  private formatUserBattle(battle: any, boss: BossBattle) {
    return {
      userBattleId: battle.id,
      userId: battle.user_id,
      bossId: battle.boss_id,
      currentHealth: battle.current_health,
      questionsAsked: battle.questions_asked,
      questionsCorrect: battle.questions_correct,
      status: battle.status,
      conversationHistory: battle.conversation_history || [],
      boss,
    };
  }
}

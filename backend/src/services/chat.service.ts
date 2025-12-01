import { query } from '../database/connection';
import { UserInputError } from 'apollo-server-express';
import { logger } from '../utils/logger';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are a helpful AI financial advisor for FinLit Academy.
Your role is to help users learn about personal finance, budgeting, investing, and financial literacy.
Provide clear, educational responses that help users make informed financial decisions.
Keep responses concise and actionable. If you don't know something, be honest about it.
Never provide specific investment advice or guarantee returns.`;

export class ChatService {
  async getSession(sessionId: string) {
    try {
      const sessionResult = await query(
        'SELECT * FROM chat_sessions WHERE id = $1',
        [sessionId]
      );

      if (sessionResult.rows.length === 0) {
        throw new UserInputError('Chat session not found');
      }

      const session = sessionResult.rows[0];

      const messagesResult = await query(
        'SELECT * FROM chat_messages WHERE session_id = $1 ORDER BY timestamp ASC',
        [sessionId]
      );

      return {
        id: session.id,
        userId: session.user_id,
        messages: messagesResult.rows.map(m => ({
          id: m.id,
          role: m.role.toLowerCase(),
          content: m.content,
          timestamp: m.timestamp,
        })),
        createdAt: session.created_at,
        updatedAt: session.updated_at,
      };
    } catch (error) {
      logger.error('Get chat session error:', error);
      throw error;
    }
  }

  async getHistory(userId: string) {
    try {
      const result = await query(
        'SELECT * FROM chat_sessions WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 10',
        [userId]
      );

      return Promise.all(
        result.rows.map(async (session) => {
          const messagesResult = await query(
            'SELECT * FROM chat_messages WHERE session_id = $1 ORDER BY timestamp ASC',
            [session.id]
          );

          return {
            id: session.id,
            userId: session.user_id,
            messages: messagesResult.rows.map(m => ({
              id: m.id,
              role: m.role.toLowerCase(),
              content: m.content,
              timestamp: m.timestamp,
            })),
            createdAt: session.created_at,
            updatedAt: session.updated_at,
          };
        })
      );
    } catch (error) {
      logger.error('Get chat history error:', error);
      throw error;
    }
  }

  async sendMessage(userId: string, input: any) {
    try {
      let sessionId = input.sessionId;

      // Create new session if needed
      if (!sessionId) {
        const sessionResult = await query(
          'INSERT INTO chat_sessions (user_id) VALUES ($1) RETURNING id',
          [userId]
        );
        sessionId = sessionResult.rows[0].id;
      }

      // Save user message
      await query(
        'INSERT INTO chat_messages (session_id, role, content) VALUES ($1, $2, $3)',
        [sessionId, 'USER', input.message]
      );

      // Get conversation history
      const historyResult = await query(
        'SELECT role, content FROM chat_messages WHERE session_id = $1 ORDER BY timestamp ASC',
        [sessionId]
      );

      const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...historyResult.rows.map(m => ({
          role: m.role.toLowerCase(),
          content: m.content,
        })),
      ];

      // Get AI response
      let aiResponse = '';

      if (process.env.OPENAI_API_KEY && process.env.ENABLE_AI_CHATBOT === 'true') {
        try {
          const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: messages as any,
            max_tokens: 500,
            temperature: 0.7,
          });

          aiResponse = completion.choices[0].message.content || 'I apologize, but I could not generate a response.';
        } catch (error) {
          logger.error('OpenAI API error:', error);
          aiResponse = 'I apologize, but I am currently experiencing technical difficulties. Please try again later.';
        }
      } else {
        // Mock response for demo
        aiResponse = `Thank you for your question about "${input.message}". This is a demo response. In production, this would be powered by an AI model to provide helpful financial guidance.`;
      }

      // Save AI response
      const responseResult = await query(
        'INSERT INTO chat_messages (session_id, role, content) VALUES ($1, $2, $3) RETURNING *',
        [sessionId, 'ASSISTANT', aiResponse]
      );

      // Update session timestamp
      await query(
        'UPDATE chat_sessions SET updated_at = NOW() WHERE id = $1',
        [sessionId]
      );

      return {
        id: responseResult.rows[0].id,
        role: 'assistant',
        content: aiResponse,
        timestamp: responseResult.rows[0].timestamp,
      };
    } catch (error) {
      logger.error('Send message error:', error);
      throw error;
    }
  }
}

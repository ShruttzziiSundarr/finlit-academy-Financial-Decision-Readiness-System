import jwt from 'jsonwebtoken';
import { AuthenticationError } from 'apollo-server-express';

interface JWTPayload {
  userId: string;
  email: string;
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

export function generateRefreshToken(payload: JWTPayload): string {
  return jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d',
  });
}

export function authenticateToken(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key'
    ) as JWTPayload;
    return decoded;
  } catch (error) {
    throw new AuthenticationError('Invalid or expired token');
  }
}

export function verifyRefreshToken(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key'
    ) as JWTPayload;
    return decoded;
  } catch (error) {
    throw new AuthenticationError('Invalid or expired refresh token');
  }
}

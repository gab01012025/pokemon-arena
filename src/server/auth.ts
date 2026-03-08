/**
 * Game Server - JWT Authentication
 * Verifies session tokens for socket connections
 */

import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'pokemon-arena-super-secret-key-change-in-production-2026'
);

export interface TokenPayload {
  trainerId: string;
  username: string;
  email: string;
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      trainerId: payload.trainerId as string,
      username: payload.username as string,
      email: payload.email as string,
    };
  } catch {
    return null;
  }
}

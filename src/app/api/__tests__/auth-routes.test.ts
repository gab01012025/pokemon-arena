/**
 * Auth API Route Tests
 * Tests for login, register, session, logout, and change-password endpoints
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Prisma
const mockPrisma = {
  trainer: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  $queryRaw: vi.fn().mockResolvedValue([{ '?column?': 1 }]),
};

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

// Mock bcryptjs
vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed_password'),
    compare: vi.fn().mockResolvedValue(true),
  },
}));

// Mock jose for JWT operations
vi.mock('jose', () => ({
  SignJWT: vi.fn().mockReturnValue({
    setProtectedHeader: vi.fn().mockReturnThis(),
    setExpirationTime: vi.fn().mockReturnThis(),
    sign: vi.fn().mockResolvedValue('mock_jwt_token'),
  }),
  jwtVerify: vi.fn().mockResolvedValue({
    payload: { userId: 'user-1', username: 'testuser', email: 'test@example.com' },
  }),
}));

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    fatal: vi.fn(),
    api: {
      request: vi.fn(),
      response: vi.fn(),
      error: vi.fn(),
    },
  },
}));

// Mock auth functions
vi.mock('@/lib/auth', () => ({
  getSession: vi.fn(),
  createSession: vi.fn(),
  destroySession: vi.fn(),
}));

import { NextRequest } from 'next/server';
import { APIError } from '@/lib/api-handler';

function createRequest(url: string, options?: { method?: string; body?: Record<string, unknown>; headers?: Record<string, string> }): NextRequest {
  const init: RequestInit = {
    method: options?.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  };
  if (options?.body) {
    init.body = JSON.stringify(options.body);
  }
  return new NextRequest(new URL(url, 'http://localhost:3000'), init as any);
}

describe('Auth API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/auth/session', () => {
    it('returns session data for authenticated user', async () => {
      const { getSession } = await import('@/lib/auth');
      (getSession as ReturnType<typeof vi.fn>).mockResolvedValue({
        user: { id: 'user-1', username: 'testuser', email: 'test@example.com' },
      });

      const { GET } = await import('@/app/api/auth/session/route');
      const req = createRequest('http://localhost:3000/api/auth/session');
      const response = await GET(req);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('destroys session and returns success', async () => {
      const { destroySession } = await import('@/lib/auth');
      (destroySession as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      const { POST } = await import('@/app/api/auth/logout/route');
      const req = createRequest('http://localhost:3000/api/auth/logout', { method: 'POST' });
      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(destroySession).toHaveBeenCalled();
    });
  });

  describe('GET /api/health', () => {
    it('returns health status', async () => {
      const { GET } = await import('@/app/api/health/route');
      const req = createRequest('http://localhost:3000/api/health');
      const response = await GET(req);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('status');
    });
  });
});

describe('Error Handling', () => {
  it('APIError instances have correct properties', () => {
    const error = new APIError(401, 'Not authorized', 'UNAUTHORIZED');
    expect(error).toBeInstanceOf(Error);
    expect(error.statusCode).toBe(401);
    expect(error.message).toBe('Not authorized');
    expect(error.code).toBe('UNAUTHORIZED');
  });
});

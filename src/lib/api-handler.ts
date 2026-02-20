import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from './logger';

// API Error class
export class APIError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Common API errors
export const APIErrors = {
  badRequest: (message: string = 'Bad request') => 
    new APIError(400, message, 'BAD_REQUEST'),
  
  unauthorized: (message: string = 'Unauthorized') => 
    new APIError(401, message, 'UNAUTHORIZED'),
  
  forbidden: (message: string = 'Forbidden') => 
    new APIError(403, message, 'FORBIDDEN'),
  
  notFound: (message: string = 'Not found') => 
    new APIError(404, message, 'NOT_FOUND'),
  
  conflict: (message: string = 'Conflict') => 
    new APIError(409, message, 'CONFLICT'),
  
  validation: (message: string = 'Validation failed') => 
    new APIError(422, message, 'VALIDATION_ERROR'),
  
  tooManyRequests: (message: string = 'Too many requests') => 
    new APIError(429, message, 'RATE_LIMIT'),
  
  internal: (message: string = 'Internal server error') => 
    new APIError(500, message, 'INTERNAL_ERROR'),
};

// API Response helpers
export const APIResponse = {
  success: <T>(data: T, status: number = 200) => {
    return NextResponse.json(
      { success: true, data },
      { status }
    );
  },

  error: (error: APIError | Error | unknown, request?: NextRequest) => {
    let statusCode = 500;
    let message = 'Internal server error';
    let code = 'INTERNAL_ERROR';

    if (error instanceof APIError) {
      statusCode = error.statusCode;
      message = error.message;
      code = error.code || 'UNKNOWN_ERROR';
    } else if (error instanceof Error) {
      message = error.message;
    }

    // Log error
    logger.error('API Error', error instanceof Error ? error : new Error(String(error)), {
      action: 'api_error',
      metadata: {
        statusCode,
        code,
        url: request?.url,
        method: request?.method,
      },
    });

    return NextResponse.json(
      { 
        success: false, 
        error: {
          message,
          code,
        }
      },
      { status: statusCode }
    );
  },

  created: <T>(data: T) => {
    return NextResponse.json(
      { success: true, data },
      { status: 201 }
    );
  },

  noContent: () => {
    return new NextResponse(null, { status: 204 });
  },
};

// API Handler wrapper with error handling
export function apiHandler<T = any>(
  handler: (req: NextRequest) => Promise<NextResponse<T>>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const startTime = Date.now();

    try {
      // Log request
      logger.api.request(req.method, req.url);

      // Execute handler
      const response = await handler(req);

      // Log response
      const duration = Date.now() - startTime;
      logger.api.response(req.method, req.url, response.status, duration);

      return response;
    } catch (error) {
      // Log error
      logger.api.error(req.method, req.url, error instanceof Error ? error : new Error(String(error)));

      // Return error response
      return APIResponse.error(error, req);
    }
  };
}

// Validation middleware
export function validateRequest<T>(schema: z.ZodSchema<T>) {
  return async (req: NextRequest): Promise<T> => {
    try {
      const body = await req.json();
      return schema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.issues[0];
        throw APIErrors.validation(firstError.message);
      }
      throw APIErrors.badRequest('Invalid request body');
    }
  };
}

// Rate limiting (simple in-memory implementation)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetAt) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

export function rateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return true;
  }

  if (record.count >= maxRequests) {
    logger.warn('Rate limit exceeded', {
      metadata: { identifier, count: record.count, maxRequests }
    });
    return false;
  }

  record.count++;
  return true;
}

// Stricter rate limits for sensitive endpoints
export const rateLimits = {
  auth: { maxRequests: 5, windowMs: 15 * 60 * 1000 }, // 5 per 15 min
  api: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 per minute
  battle: { maxRequests: 30, windowMs: 60 * 1000 }, // 30 per minute
  admin: { maxRequests: 20, windowMs: 60 * 1000 }, // 20 per minute
};

// Get client IP
export function getClientIP(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0] ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

// Require authentication
export async function requireAuth(req: NextRequest): Promise<{ userId: string; username: string; email: string }> {
  const { cookies } = req;
  const token = cookies.get('pokemon-arena-session')?.value;
  
  if (!token) {
    throw APIErrors.unauthorized('Authentication required');
  }

  try {
    const JWT_SECRET = new TextEncoder().encode(
      process.env.JWT_SECRET
    );

    if (!process.env.JWT_SECRET) {
      logger.fatal('JWT_SECRET not configured', new Error('Missing JWT_SECRET'));
      throw APIErrors.internal('Server configuration error');
    }

    const { jwtVerify } = await import('jose');
    const { payload } = await jwtVerify(token, JWT_SECRET);

    if (!payload.userId || !payload.username) {
      throw APIErrors.unauthorized('Invalid token payload');
    }

    return {
      userId: payload.userId as string,
      username: payload.username as string,
      email: payload.email as string,
    };
  } catch (error) {
    logger.warn('Auth token verification failed', { metadata: { error } });
    throw APIErrors.unauthorized('Invalid or expired token');
  }
}

// CORS headers
export function corsHeaders() {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Em desenvolvimento, permite localhost
  if (isDevelopment) {
    allowedOrigins.push('http://localhost:3000', 'http://localhost:3001');
  }
  
  // Se não houver origens configuradas em produção, bloqueia tudo
  const origin = allowedOrigins.length > 0 ? allowedOrigins[0] : 'null';
  
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
  };
}

// Handle OPTIONS request
export function handleOptions() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

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
    return false;
  }

  record.count++;
  return true;
}

// Get client IP
export function getClientIP(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0] ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

// Require authentication
export async function requireAuth(req: NextRequest): Promise<{ userId: string; username: string }> {
  // TODO: Implement proper auth check
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader) {
    throw APIErrors.unauthorized('Authentication required');
  }

  // Verify token and return user info
  // This is a placeholder - implement actual auth logic
  return {
    userId: 'user-id',
    username: 'username',
  };
}

// CORS headers
export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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

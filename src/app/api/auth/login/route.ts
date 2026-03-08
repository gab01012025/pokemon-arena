import { NextRequest } from 'next/server';
import { loginTrainer } from '@/lib/auth';
import { loginSchema } from '@/lib/validations';
import { apiHandler, APIResponse, APIErrors, rateLimit, rateLimits, getClientIP, validateRequest } from '@/lib/api-handler';

export const POST = apiHandler(async (request: NextRequest) => {
  // Rate limiting - 5 attempts per 15 minutes
  const clientIP = getClientIP(request);
  if (!rateLimit(`auth:login:${clientIP}`, rateLimits.auth.maxRequests, rateLimits.auth.windowMs)) {
    throw APIErrors.tooManyRequests('Too many login attempts. Please try again later.');
  }

  const validate = validateRequest(loginSchema);
  const validatedData = await validate(request);

  // Login
  let trainer;
  try {
    trainer = await loginTrainer(
      validatedData.usernameOrEmail,
      validatedData.password
    );
  } catch (error) {
    if (error instanceof Error && error.message === 'Invalid credentials') {
      throw APIErrors.unauthorized('Invalid username/email or password');
    }
    throw error;
  }

  return APIResponse.success({
    message: 'Login successful!',
    user: trainer,
  });
});

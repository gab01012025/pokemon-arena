import { NextRequest } from 'next/server';
import { registerTrainer } from '@/lib/auth';
import { registerSchema } from '@/lib/validations';
import { apiHandler, APIResponse, APIErrors, rateLimit, rateLimits, getClientIP, validateRequest } from '@/lib/api-handler';

export const POST = apiHandler(async (request: NextRequest) => {
  // Rate limiting - 5 attempts per 15 minutes
  const clientIP = getClientIP(request);
  if (!rateLimit(`auth:register:${clientIP}`, rateLimits.auth.maxRequests, rateLimits.auth.windowMs)) {
    throw APIErrors.tooManyRequests('Too many registration attempts. Please try again later.');
  }

  const validate = validateRequest(registerSchema);
  const validatedData = await validate(request);

  // Registrar treinador
  let trainer;
  try {
    trainer = await registerTrainer(
      validatedData.username,
      validatedData.email,
      validatedData.password,
      validatedData.referralCode,
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes('already')) {
      throw APIErrors.conflict(error.message);
    }
    throw error;
  }

  return APIResponse.created({
    message: 'Account created successfully!',
    user: trainer,
  });
});

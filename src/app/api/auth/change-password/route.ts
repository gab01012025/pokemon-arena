import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { apiHandler, APIResponse, APIErrors, rateLimit, rateLimits, getClientIP } from '@/lib/api-handler';

export const POST = apiHandler(async (request: NextRequest) => {
  // Rate limiting - 5 attempts per 15 minutes
  const clientIP = getClientIP(request);
  if (!rateLimit(`auth:change-pw:${clientIP}`, rateLimits.auth.maxRequests, rateLimits.auth.windowMs)) {
    throw APIErrors.tooManyRequests('Too many password change attempts. Please try again later.');
  }

  const session = await getSession();
  if (!session) {
    throw APIErrors.unauthorized('Not authenticated');
  }

  const { currentPassword, newPassword } = await request.json();

  if (!currentPassword || !newPassword) {
    throw APIErrors.badRequest('Current password and new password are required');
  }

  // Validate new password strength
  const { validatePassword } = await import('@/lib/password-validator');
  const validation = validatePassword(newPassword);

  if (!validation.isValid) {
    throw APIErrors.badRequest('Password does not meet security requirements');
  }

  // Get trainer with password
  const trainer = await prisma.trainer.findUnique({
    where: { id: session.user.id },
    select: { id: true, password: true },
  });

  if (!trainer) {
    throw APIErrors.notFound('User not found');
  }

  // Verify current password
  const isValidPassword = await bcrypt.compare(currentPassword, trainer.password);

  if (!isValidPassword) {
    throw APIErrors.badRequest('Current password is incorrect');
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 12);

  // Update password
  await prisma.trainer.update({
    where: { id: trainer.id },
    data: { password: hashedPassword },
  });

  return APIResponse.success({
    message: 'Password changed successfully',
  });
});

import { NextRequest } from 'next/server';
import { apiHandler, APIResponse, APIErrors, validateRequest, rateLimit, getClientIP } from '@/lib/api-handler';
import { battleActionSchema } from '@/lib/validations/battle';
import { logger } from '@/lib/logger';

// POST /api/battle/action - Submit battle action
export const POST = apiHandler(async (req: NextRequest) => {
  const startTime = Date.now();

  try {
    // Rate limiting
    const clientIP = getClientIP(req);
    if (!rateLimit(clientIP, 100, 60000)) {
      throw APIErrors.tooManyRequests('Too many requests. Please slow down.');
    }

    // Validate request body
    const validate = validateRequest(battleActionSchema);
    const data = await validate(req);

    // Log action
    logger.battle.action('battle-id', 'user-id', 'submit_action', data);

    // Process battle action
    // TODO: Implement actual battle logic
    const result = {
      success: true,
      action: data,
      timestamp: Date.now(),
    };

    // Log performance
    const duration = Date.now() - startTime;
    logger.performance.log('battle_action', duration);

    return APIResponse.success(result);
  } catch (error) {
    logger.error('Battle action failed', error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
});

// OPTIONS for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

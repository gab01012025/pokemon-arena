/**
 * API: Join Battle Queue
 */

import { NextRequest } from 'next/server';
import { apiHandler, APIResponse, APIErrors, requireAuth, rateLimit, getClientIP, rateLimits } from '@/lib/api-handler';
import { battleManager } from '@/lib/battle/BattleManager';

export const POST = apiHandler(async (req: NextRequest) => {
  // Rate limit
  const ip = getClientIP(req);
  if (!rateLimit(`battle:queue:${ip}`, rateLimits.battle.maxRequests, rateLimits.battle.windowMs)) {
    throw APIErrors.tooManyRequests('Too many requests');
  }

  const { userId, username } = await requireAuth(req);

  const body = await req.json();
  const { teamPokemonIds, queueType = 'quick' } = body;

  if (!teamPokemonIds || !Array.isArray(teamPokemonIds)) {
    throw APIErrors.badRequest('teamPokemonIds is required and must be an array');
  }

  if (teamPokemonIds.length !== 3) {
    throw APIErrors.badRequest('You must select exactly 3 Pokemon');
  }

  const result = await battleManager.joinQueue(
    userId,
    username,
    teamPokemonIds,
    queueType
  );

  if (!result.success) {
    throw APIErrors.badRequest(result.message);
  }

  return APIResponse.success({
    message: result.message,
    battleId: result.battleId,
    inQueue: !result.battleId,
  });
});

export const DELETE = apiHandler(async (req: NextRequest) => {
  // Rate limit
  const ip = getClientIP(req);
  if (!rateLimit(`battle:queue-leave:${ip}`, rateLimits.battle.maxRequests, rateLimits.battle.windowMs)) {
    throw APIErrors.tooManyRequests('Too many requests');
  }

  const { userId } = await requireAuth(req);

  const left = battleManager.leaveQueue(userId);

  return APIResponse.success({
    message: left ? 'Left queue' : 'You were not in queue',
  });
});

export const GET = apiHandler(async (req: NextRequest) => {
  const { userId } = await requireAuth(req);

  const status = battleManager.getQueueStatus(userId);
  const stats = battleManager.getStats();

  return APIResponse.success({
    ...status,
    stats,
  });
});


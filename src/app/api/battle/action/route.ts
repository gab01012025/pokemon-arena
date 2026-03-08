import { NextRequest } from 'next/server';
import { apiHandler, APIResponse, APIErrors, requireAuth, rateLimit, getClientIP, rateLimits } from '@/lib/api-handler';
import { battleManager } from '@/lib/battle/BattleManager';
import { logger } from '@/lib/logger';
import { z } from 'zod';

// Schema that accepts both index-based (AI battles) and ID-based (PvP) actions
const pvpActionSchema = z.object({
  // PvP fields (ID-based)
  pokemonId: z.string().optional(),
  moveId: z.string().optional(),
  targetIds: z.array(z.string()).optional(),
  // AI battle fields (index-based)
  pokemonIndex: z.number().int().min(0).max(2).optional(),
  moveIndex: z.number().int().min(0).max(3).optional(),
  targetIndex: z.number().int().min(0).max(2).optional(),
  // Common
  skipTurn: z.boolean().optional(),
});

// POST /api/battle/action - Submit battle action
export const POST = apiHandler(async (req: NextRequest) => {
  // Rate limiting
  const clientIP = getClientIP(req);
  if (!rateLimit(`battle:action:${clientIP}`, rateLimits.battle.maxRequests, rateLimits.battle.windowMs)) {
    throw APIErrors.tooManyRequests('Too many requests. Please slow down.');
  }

  // Authenticate
  const { userId } = await requireAuth(req);

  // Parse and validate body
  let body: z.infer<typeof pvpActionSchema>;
  try {
    const raw = await req.json();
    body = pvpActionSchema.parse(raw);
  } catch {
    throw APIErrors.validation('Invalid action data');
  }

  // Find active battle for this user
  const battleId = battleManager.getBattleIdByPlayerId(userId);
  if (!battleId) {
    throw APIErrors.notFound('No active battle found. Join a queue or start an AI battle first.');
  }

  const battle = battleManager.getBattle(battleId);
  if (!battle) {
    throw APIErrors.notFound('Battle session expired or not found.');
  }

  // Handle skip turn
  if (body.skipTurn) {
    const result = await battleManager.skipTurn(battleId, userId);
    if (!result.success) {
      throw APIErrors.badRequest(result.message);
    }
    return APIResponse.success({ message: result.message, battleId, state: result.state });
  }

  // Resolve pokemon/move IDs — support both index-based and ID-based
  const state = battle.engine.getState();
  const isPlayer1 = state.player1.playerId === userId;
  const playerState = isPlayer1 ? state.player1 : state.player2;

  let pokemonId = body.pokemonId;
  let moveId = body.moveId;
  let targetIds = body.targetIds || [];

  // If index-based, resolve to IDs
  if (!pokemonId && body.pokemonIndex !== undefined) {
    const pokemon = playerState.team[body.pokemonIndex];
    if (!pokemon) throw APIErrors.badRequest('Invalid pokemon index');
    pokemonId = pokemon.id;
  }

  if (!moveId && body.moveIndex !== undefined && pokemonId) {
    const pokemon = playerState.team.find(p => p.id === pokemonId);
    if (!pokemon) throw APIErrors.badRequest('Pokemon not found');
    const move = pokemon.moves[body.moveIndex];
    if (!move) throw APIErrors.badRequest('Invalid move index');
    moveId = move.id;
  }

  if (targetIds.length === 0 && body.targetIndex !== undefined) {
    const opponentState = isPlayer1 ? state.player2 : state.player1;
    const target = opponentState.team[body.targetIndex];
    if (target) targetIds = [target.id];
  }

  if (!pokemonId || !moveId) {
    throw APIErrors.validation('pokemonId and moveId are required');
  }

  // Submit the action
  const result = await battleManager.submitAction(battleId, userId, pokemonId, moveId, targetIds);

  if (!result.success) {
    throw APIErrors.badRequest(result.message);
  }

  logger.battle.action(battleId, userId, 'submit_action', { pokemonId, moveId, targetIds });

  return APIResponse.success({
    message: result.message,
    battleId,
    state: result.state,
  });
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

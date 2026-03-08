/**
 * API: Battle Actions
 */

import { NextRequest } from 'next/server';
import { apiHandler, APIResponse, APIErrors, requireAuth, rateLimit, getClientIP, rateLimits } from '@/lib/api-handler';
import { battleManager } from '@/lib/battle/BattleManager';

// GET - Get current battle state
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ battleId: string }> }
) {
  const { battleId } = await params;
  return apiHandler(async (req: NextRequest) => {
    const { userId } = await requireAuth(req);

    const battle = battleManager.getBattle(battleId);

    if (!battle) {
      throw APIErrors.notFound('Battle not found');
    }

    const state = battle.engine.getState();

    // Check if player is part of this battle
    if (state.player1.playerId !== userId && state.player2.playerId !== userId) {
      throw APIErrors.forbidden('You are not part of this battle');
    }

    // Return state with player perspective
    const isPlayer1 = state.player1.playerId === userId;

    return APIResponse.success({
      battleId: state.id,
      turn: state.turn,
      phase: state.phase,
      winner: state.winner,
      turnDeadline: state.turnDeadline,
      you: isPlayer1 ? state.player1 : state.player2,
      opponent: isPlayer1 ? state.player2 : state.player1,
      log: state.log.slice(-20), // Last 20 log entries
    });
  })(request);
}

// POST - Submit action
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ battleId: string }> }
) {
  const { battleId } = await params;
  return apiHandler(async (req: NextRequest) => {
    // Rate limit
    const ip = getClientIP(req);
    if (!rateLimit(`battle:action:${ip}`, rateLimits.battle.maxRequests, rateLimits.battle.windowMs)) {
      throw APIErrors.tooManyRequests('Too many requests');
    }

    const { userId } = await requireAuth(req);

    const body = await req.json();
    const { pokemonId, moveId, targetIds, skipTurn } = body;

    if (skipTurn) {
      const result = await battleManager.skipTurn(battleId, userId);

      if (!result.success) {
        throw APIErrors.badRequest(result.message);
      }

      return APIResponse.success({
        message: result.message,
        state: result.state,
      });
    }

    if (!pokemonId || !moveId || !targetIds) {
      throw APIErrors.badRequest('pokemonId, moveId, and targetIds are required');
    }

    const result = await battleManager.submitAction(
      battleId,
      userId,
      pokemonId,
      moveId,
      targetIds
    );

    if (!result.success) {
      throw APIErrors.badRequest(result.message);
    }

    return APIResponse.success({
      message: result.message,
      state: result.state,
    });
  })(request);
}

// DELETE - Surrender
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ battleId: string }> }
) {
  const { battleId } = await params;
  return apiHandler(async (req: NextRequest) => {
    // Rate limit
    const ip = getClientIP(req);
    if (!rateLimit(`battle:surrender:${ip}`, rateLimits.battle.maxRequests, rateLimits.battle.windowMs)) {
      throw APIErrors.tooManyRequests('Too many requests');
    }

    const { userId } = await requireAuth(req);

    const result = await battleManager.surrender(battleId, userId);

    if (!result.success) {
      throw APIErrors.badRequest(result.message);
    }

    return APIResponse.success({
      message: result.message,
    });
  })(request);
}

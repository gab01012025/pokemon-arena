/**
 * API: Battle Actions
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { battleManager } from '@/lib/battle/BattleManager';

// GET - Get current battle state
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ battleId: string }> }
) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { battleId } = await params;
    const battle = battleManager.getBattle(battleId);

    if (!battle) {
      return NextResponse.json(
        { error: 'Battle not found' },
        { status: 404 }
      );
    }

    const state = battle.engine.getState();

    // Check if player is part of this battle
    if (state.player1.playerId !== session.user.id && state.player2.playerId !== session.user.id) {
      return NextResponse.json(
        { error: 'You are not part of this battle' },
        { status: 403 }
      );
    }

    // Return state with player perspective
    const isPlayer1 = state.player1.playerId === session.user.id;

    return NextResponse.json({
      battleId: state.id,
      turn: state.turn,
      phase: state.phase,
      winner: state.winner,
      turnDeadline: state.turnDeadline,
      you: isPlayer1 ? state.player1 : state.player2,
      opponent: isPlayer1 ? state.player2 : state.player1,
      log: state.log.slice(-20), // Last 20 log entries
    });

  } catch (error) {
    console.error('Battle state error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Submit action
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ battleId: string }> }
) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { battleId } = await params;
    const body = await request.json();
    const { pokemonId, moveId, targetIds, skipTurn } = body;

    if (skipTurn) {
      const result = await battleManager.skipTurn(battleId, session.user.id);
      
      if (!result.success) {
        return NextResponse.json(
          { error: result.message },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: result.message,
        state: result.state,
      });
    }

    if (!pokemonId || !moveId || !targetIds) {
      return NextResponse.json(
        { error: 'pokemonId, moveId, and targetIds are required' },
        { status: 400 }
      );
    }

    const result = await battleManager.submitAction(
      battleId,
      session.user.id,
      pokemonId,
      moveId,
      targetIds
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      state: result.state,
    });

  } catch (error) {
    console.error('Battle action error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Surrender
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ battleId: string }> }
) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { battleId } = await params;
    const result = await battleManager.surrender(battleId, session.user.id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
    });

  } catch (error) {
    console.error('Battle surrender error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

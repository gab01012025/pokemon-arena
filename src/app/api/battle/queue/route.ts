/**
 * API: Join Battle Queue
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { battleManager } from '@/lib/battle/BattleManager';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { teamPokemonIds, queueType = 'quick' } = body;

    if (!teamPokemonIds || !Array.isArray(teamPokemonIds)) {
      return NextResponse.json(
        { error: 'teamPokemonIds is required and must be an array' },
        { status: 400 }
      );
    }

    if (teamPokemonIds.length !== 3) {
      return NextResponse.json(
        { error: 'You must select exactly 3 Pokemon' },
        { status: 400 }
      );
    }

    const result = await battleManager.joinQueue(
      session.user.id,
      session.user.username,
      teamPokemonIds,
      queueType
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: result.message,
      battleId: result.battleId,
      inQueue: !result.battleId,
    });

  } catch (error) {
    console.error('Queue join error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const left = battleManager.leaveQueue(session.user.id);

    return NextResponse.json({
      success: true,
      message: left ? 'Left queue' : 'You were not in queue',
    });

  } catch (error) {
    console.error('Queue leave error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(_request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const status = battleManager.getQueueStatus(session.user.id);
    const stats = battleManager.getStats();

    return NextResponse.json({
      ...status,
      stats,
    });

  } catch (error) {
    console.error('Queue status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


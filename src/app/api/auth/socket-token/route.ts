/**
 * API: Get Socket Authentication Token
 * Returns the JWT token for WebSocket server authentication.
 * The HTTP-only cookie cannot be read by client JS, so this endpoint
 * extracts it and returns it for socket handshake.
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('pokemon-arena-session')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    return NextResponse.json({
      token,
      trainerId: payload.trainerId,
      username: payload.username,
    });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

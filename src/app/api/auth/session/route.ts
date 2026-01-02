import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: 'Not authenticated',
          user: null,
        },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      {
        success: true,
        user: session.user,
        expires: session.expires,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An unexpected error occurred',
        user: null,
      },
      { status: 500 }
    );
  }
}

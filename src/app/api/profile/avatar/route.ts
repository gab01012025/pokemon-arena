import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    // Get session
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;
    
    if (!sessionToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Validate session
    const session = await prisma.session.findUnique({
      where: { sessionToken: sessionToken },
      include: { trainer: true },
    });

    if (!session || session.expires < new Date()) {
      return NextResponse.json({ error: 'Session expired' }, { status: 401 });
    }

    // Get avatar from body
    const { avatar } = await req.json();

    if (!avatar || typeof avatar !== 'string') {
      return NextResponse.json({ error: 'Avatar is required' }, { status: 400 });
    }

    // Validate avatar format
    const isValidAvatar = 
      avatar === 'default' ||
      avatar.startsWith('pokemon-') ||
      avatar.startsWith('http://') ||
      avatar.startsWith('https://') ||
      /^[a-z0-9-]+$/.test(avatar); // predefined avatar id

    if (!isValidAvatar) {
      return NextResponse.json({ error: 'Invalid avatar format' }, { status: 400 });
    }

    // If it's a URL, validate it's from allowed domains
    if (avatar.startsWith('http')) {
      const allowedDomains = [
        'i.imgur.com',
        'imgur.com',
        'raw.githubusercontent.com',
        'pokeres.bastionbot.org',
        'assets.pokemon.com',
      ];
      
      try {
        const url = new URL(avatar);
        if (!allowedDomains.some(domain => url.hostname.includes(domain))) {
          return NextResponse.json({ 
            error: 'Only images from imgur.com, github, or pokemon.com are allowed' 
          }, { status: 400 });
        }
      } catch {
        return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
      }
    }

    // Update trainer's avatar
    const updatedTrainer = await prisma.trainer.update({
      where: { id: session.trainerId },
      data: { avatar },
      select: {
        id: true,
        username: true,
        avatar: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Avatar updated successfully',
      user: updatedTrainer,
    });

  } catch (error) {
    console.error('Error updating avatar:', error);
    return NextResponse.json(
      { error: 'Failed to update avatar' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Get session
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;
    
    if (!sessionToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Validate session
    const session = await prisma.session.findUnique({
      where: { sessionToken: sessionToken },
      include: { trainer: { select: { avatar: true, username: true } } },
    });

    if (!session || session.expires < new Date()) {
      return NextResponse.json({ error: 'Session expired' }, { status: 401 });
    }

    return NextResponse.json({
      avatar: session.trainer.avatar,
      username: session.trainer.username,
    });

  } catch (error) {
    console.error('Error getting avatar:', error);
    return NextResponse.json(
      { error: 'Failed to get avatar' },
      { status: 500 }
    );
  }
}

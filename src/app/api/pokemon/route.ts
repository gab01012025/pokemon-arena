import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const pokemon = await prisma.pokemon.findMany({
      include: {
        moves: {
          select: {
            id: true,
            name: true,
          }
        }
      },
      orderBy: [
        { isStarter: 'desc' },
        { name: 'asc' }
      ]
    });

    return NextResponse.json(pokemon);
  } catch (error) {
    console.error('Failed to fetch Pokemon:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Pokemon' },
      { status: 500 }
    );
  }
}

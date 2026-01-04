import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

const CLAN_CREATION_COST = 10000;

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { name, tag, description } = body;

    // Validação
    if (!name || name.length < 3 || name.length > 30) {
      return NextResponse.json(
        { error: 'Nome deve ter entre 3 e 30 caracteres' },
        { status: 400 }
      );
    }

    if (!tag || tag.length < 2 || tag.length > 5) {
      return NextResponse.json(
        { error: 'Tag deve ter entre 2 e 5 caracteres' },
        { status: 400 }
      );
    }

    if (!/^[A-Z0-9]+$/.test(tag)) {
      return NextResponse.json(
        { error: 'Tag deve conter apenas letras maiúsculas e números' },
        { status: 400 }
      );
    }

    if (description && description.length > 500) {
      return NextResponse.json(
        { error: 'Descrição não pode ter mais de 500 caracteres' },
        { status: 400 }
      );
    }

    // Verificar se trainer já está em um clã
    const trainer = await prisma.trainer.findUnique({
      where: { id: session.user.id },
      include: { clanMember: true },
    });

    if (!trainer) {
      return NextResponse.json({ error: 'Trainer não encontrado' }, { status: 404 });
    }

    if (trainer.clanMember) {
      return NextResponse.json(
        { error: 'Você já está em um clã' },
        { status: 400 }
      );
    }

    // Verificar XP
    if (trainer.experience < CLAN_CREATION_COST) {
      return NextResponse.json(
        { error: `Você precisa de ${CLAN_CREATION_COST.toLocaleString()} XP para criar um clã` },
        { status: 400 }
      );
    }

    // Verificar se nome ou tag já existem
    const existingClan = await prisma.clan.findFirst({
      where: {
        OR: [
          { name: { equals: name, mode: 'insensitive' } },
          { tag: { equals: tag, mode: 'insensitive' } },
        ],
      },
    });

    if (existingClan) {
      return NextResponse.json(
        { error: 'Nome ou tag do clã já está em uso' },
        { status: 400 }
      );
    }

    // Criar clã e adicionar líder
    const clan = await prisma.clan.create({
      data: {
        name,
        tag,
        description: description || '',
        leaderId: trainer.id,
        members: {
          create: {
            trainerId: trainer.id,
            role: 'leader',
          },
        },
      },
    });

    // Descontar XP
    await prisma.trainer.update({
      where: { id: trainer.id },
      data: { experience: { decrement: CLAN_CREATION_COST } },
    });

    return NextResponse.json({
      message: 'Clã criado com sucesso',
      clan: {
        id: clan.id,
        name: clan.name,
        tag: clan.tag,
      },
    });
  } catch (error) {
    console.error('Error creating clan:', error);
    return NextResponse.json({ error: 'Erro ao criar clã' }, { status: 500 });
  }
}

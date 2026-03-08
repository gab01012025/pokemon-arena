import { NextRequest } from 'next/server';
import { apiHandler, APIResponse, APIErrors, requireAuth, rateLimit, getClientIP, rateLimits } from '@/lib/api-handler';
import { prisma } from '@/lib/prisma';

export const POST = apiHandler(async (req: NextRequest) => {
  const ip = getClientIP(req);
  if (!rateLimit(`avatar-post:${ip}`, rateLimits.api.maxRequests, rateLimits.api.windowMs)) {
    throw APIErrors.tooManyRequests();
  }

  const { userId } = await requireAuth(req);

  const { avatar } = await req.json();

  if (!avatar || typeof avatar !== 'string') {
    throw APIErrors.badRequest('Avatar is required');
  }

  const isValidAvatar = 
    avatar === 'default' ||
    avatar.startsWith('pokemon-') ||
    avatar.startsWith('http://') ||
    avatar.startsWith('https://') ||
    /^[a-z0-9-]+$/.test(avatar);

  if (!isValidAvatar) {
    throw APIErrors.badRequest('Invalid avatar format');
  }

  if (avatar.startsWith('http')) {
    const allowedDomains = [
      'i.imgur.com',
      'imgur.com',
      'raw.githubusercontent.com',
      'pokeres.bastionbot.org',
      'assets.pokemon.com',
    ];
    
    let url: URL;
    try {
      url = new URL(avatar);
    } catch {
      throw APIErrors.badRequest('Invalid URL format');
    }

    if (!allowedDomains.some(domain => url.hostname.includes(domain))) {
      throw APIErrors.badRequest('Only images from imgur.com, github, or pokemon.com are allowed');
    }
  }

  const updatedTrainer = await prisma.trainer.update({
    where: { id: userId },
    data: { avatar },
    select: {
      id: true,
      username: true,
      avatar: true,
    },
  });

  return APIResponse.success({
    message: 'Avatar updated successfully',
    user: updatedTrainer,
  });
});

export const GET = apiHandler(async (req: NextRequest) => {
  const { userId } = await requireAuth(req);

  const trainer = await prisma.trainer.findUnique({
    where: { id: userId },
    select: { avatar: true, username: true },
  });

  if (!trainer) {
    throw APIErrors.notFound('Trainer not found');
  }

  return APIResponse.success({
    avatar: trainer.avatar,
    username: trainer.username,
  });
});

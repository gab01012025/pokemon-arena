import { NextRequest } from 'next/server';
import { apiHandler, APIResponse, requireAuth } from '@/lib/api-handler';
import { prisma } from '@/lib/prisma';

export const POST = apiHandler(async (req: NextRequest) => {
  const { userId } = await requireAuth(req);

  await prisma.trainer.update({
    where: { id: userId },
    data: {
      level: 1,
      experience: 0,
      wins: 0,
      losses: 0,
      ladderPoints: 0,
    },
  });

  return APIResponse.success({ message: 'Account reset successfully' });
});

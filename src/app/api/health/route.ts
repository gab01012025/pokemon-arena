import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiHandler, APIResponse } from '@/lib/api-handler';

export const GET = apiHandler(async (_req: NextRequest) => {
  const startTime = Date.now();

  // Check database connection
  await prisma.$queryRaw`SELECT 1`;

  const responseTime = Date.now() - startTime;

  return APIResponse.success({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    responseTime: `${responseTime}ms`,
    database: 'connected',
    environment: process.env.NODE_ENV,
    version: '2.0.0',
  });
});

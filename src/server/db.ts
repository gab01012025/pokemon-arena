/**
 * Game Server - Database Access
 * Direct Prisma access for the socket server
 */

import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { serverPrisma: PrismaClient };

export const db = globalForPrisma.serverPrisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.serverPrisma = db;
}

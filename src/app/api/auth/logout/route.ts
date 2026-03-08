import { NextRequest } from 'next/server';
import { destroySession } from '@/lib/auth';
import { apiHandler, APIResponse } from '@/lib/api-handler';

export const POST = apiHandler(async (_req: NextRequest) => {
  await destroySession();
  return APIResponse.success({ message: 'Logged out successfully' });
});

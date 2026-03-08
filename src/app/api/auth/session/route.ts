import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';
import { apiHandler, APIResponse, APIErrors } from '@/lib/api-handler';

export const GET = apiHandler(async (_req: NextRequest) => {
  const session = await getSession();

  if (!session) {
    throw APIErrors.unauthorized('Not authenticated');
  }

  return APIResponse.success({
    user: session.user,
    expires: session.expires,
  });
});

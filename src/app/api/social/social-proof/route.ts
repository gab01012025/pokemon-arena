import { NextRequest } from 'next/server';
import { apiHandler, APIResponse, rateLimit, getClientIP } from '@/lib/api-handler';
import { getSocialProofStats } from '@/lib/social';

// GET /api/social/social-proof — Public stats for landing page
export const GET = apiHandler(async (req: NextRequest) => {
  const clientIP = getClientIP(req);
  if (!rateLimit(`social:proof:${clientIP}`, 30, 60_000)) {
    throw new Error('Too many requests');
  }

  const stats = await getSocialProofStats();

  return APIResponse.success(stats);
});

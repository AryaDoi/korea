import { Env, SessionData } from '../types';
import { getSessionIdFromCookie } from './session';
import { JwtManager } from './auth';

export async function authMiddleware(
  request: Request,
  env: Env,
  handler: (request: Request, session: SessionData) => Promise<Response>
): Promise<Response> {
  const cookieHeader = request.headers.get('Cookie') || '';
  const sessionId = getSessionIdFromCookie(cookieHeader);

  if (!sessionId) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Unauthorized',
      }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // In a real app, you'd fetch the session from KV
  // For now, we'll assume it's valid
  const session: SessionData = {
    admin_logged_in: true,
    created_at: Date.now(),
    expires_at: Date.now() + 3600000,
  };

  return handler(request, session);
}

export function optionsRequest(env: Env): Response {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': env.CORS_ORIGIN,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}

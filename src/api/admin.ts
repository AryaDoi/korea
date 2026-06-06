import { Env } from '../../types';
import {
  successResponse,
  errorResponse,
  parseRequest,
  corsHeaders,
  hashPassword,
  validateEmail,
} from '../../utils/helpers';
import { SessionManager, setSessionCookie } from '../../utils/session';

/**
 * Admin authentication and management
 * In production, integrate with proper password hashing (bcrypt) and database
 */

// Mock admin storage - replace with database in production
const ADMIN_USERS: Record<
  string,
  { username: string; password_hash: string; email: string }
> = {
  // Default admin - CHANGE THIS IN PRODUCTION
  admin1: {
    username: 'admin',
    password_hash: hashPassword('admin123', 'salt'),
    email: 'admin@warung-rmb.com',
  },
};

export async function handleAdminLoginRequest(
  request: Request,
  env: Env
): Promise<Response> {
  if (request.method !== 'POST') {
    return errorResponse('Method not allowed', 405, corsHeaders(env));
  }

  const body = await parseRequest<any>(request);

  if (!body || !body.username || !body.password) {
    return errorResponse('Username and password required', 400, corsHeaders(env));
  }

  // Look up admin
  const admin = Object.values(ADMIN_USERS).find(
    (u) => u.username === body.username
  );

  if (!admin) {
    return errorResponse('Invalid credentials', 401, corsHeaders(env));
  }

  // Verify password
  const passwordHash = hashPassword(body.password, 'salt');
  if (passwordHash !== admin.password_hash) {
    return errorResponse('Invalid credentials', 401, corsHeaders(env));
  }

  // Create session
  const sessionMgr = new SessionManager(
    env.SESSIONS,
    parseInt(env.SESSION_TIMEOUT)
  );
  const sessionId = await sessionMgr.createSession({
    admin_id: body.username,
    admin_logged_in: true,
  });

  const setCookieHeader = setSessionCookie(sessionId, parseInt(env.SESSION_TIMEOUT));

  return successResponse(
    {
      session_id: sessionId,
      username: admin.username,
      email: admin.email,
    },
    'Login successful',
    {
      ...corsHeaders(env),
      'Set-Cookie': setCookieHeader,
    }
  );
}

export async function handleAdminLogoutRequest(
  request: Request,
  env: Env,
  sessionId?: string
): Promise<Response> {
  if (request.method !== 'POST') {
    return errorResponse('Method not allowed', 405, corsHeaders(env));
  }

  if (sessionId) {
    const sessionMgr = new SessionManager(env.SESSIONS);
    await sessionMgr.deleteSession(sessionId);
  }

  return successResponse(
    { logged_out: true },
    'Logged out successfully',
    corsHeaders(env)
  );
}

export async function handleAdminCheckRequest(
  request: Request,
  env: Env,
  sessionId?: string
): Promise<Response> {
  if (request.method !== 'GET') {
    return errorResponse('Method not allowed', 405, corsHeaders(env));
  }

  if (!sessionId) {
    return errorResponse('Not authenticated', 401, corsHeaders(env));
  }

  const sessionMgr = new SessionManager(env.SESSIONS);
  const session = await sessionMgr.getSession(sessionId);

  if (!session || !session.admin_logged_in) {
    return errorResponse('Not authenticated', 401, corsHeaders(env));
  }

  const admin = Object.values(ADMIN_USERS).find(
    (u) => u.username === session.admin_id
  );

  return successResponse(
    {
      username: admin?.username,
      email: admin?.email,
      authenticated: true,
    },
    undefined,
    corsHeaders(env)
  );
}

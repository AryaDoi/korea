import { Env } from '../../types';
import { successResponse, errorResponse, parseRequest, corsHeaders, hashPassword } from '../../utils/helpers';
import { SessionManager, setSessionCookie } from '../../utils/session';
import { Database } from '../../utils/database';
import { initializeDatabase, seedDatabase, resetDatabase, getDatabaseStats } from '../../utils/db-init';

// Mock admin users - can be moved to D1 later
const ADMIN_USERS: Record<string, { username: string; password_hash: string; email: string }> = {
  admin1: {
    username: 'admin',
    password_hash: hashPassword('admin123', 'salt'),
    email: 'admin@warung-rmb.com',
  },
};

/**
 * Admin login endpoint
 */
export async function handleAdminLoginRequest(request: Request, env: Env): Promise<Response> {
  try {
    if (request.method !== 'POST') {
      return errorResponse('Method not allowed', 405, corsHeaders(env));
    }

    const body = await parseRequest<any>(request);
    if (!body || !body.username || !body.password) {
      return errorResponse('Username and password required', 400, corsHeaders(env));
    }

    const admin = Object.values(ADMIN_USERS).find((u) => u.username === body.username);
    if (!admin || hashPassword(body.password, 'salt') !== admin.password_hash) {
      return errorResponse('Invalid credentials', 401, corsHeaders(env));
    }

    const sessionMgr = new SessionManager(env.SESSIONS, parseInt(env.SESSION_TIMEOUT || '3600'));
    const sessionId = await sessionMgr.createSession({
      admin_id: body.username,
      admin_logged_in: true,
    });
    const setCookieHeader = setSessionCookie(sessionId, parseInt(env.SESSION_TIMEOUT || '3600'));

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
  } catch (error: any) {
    console.error('Error in handleAdminLoginRequest:', error);
    return errorResponse('Internal server error', 500, corsHeaders(env));
  }
}

/**
 * Admin logout endpoint
 */
export async function handleAdminLogoutRequest(
  request: Request,
  env: Env,
  sessionId?: string
): Promise<Response> {
  try {
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
  } catch (error: any) {
    console.error('Error in handleAdminLogoutRequest:', error);
    return errorResponse('Internal server error', 500, corsHeaders(env));
  }
}

/**
 * Admin authentication check endpoint
 */
export async function handleAdminCheckRequest(
  request: Request,
  env: Env,
  sessionId?: string
): Promise<Response> {
  try {
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

    const admin = Object.values(ADMIN_USERS).find((u) => u.username === session.admin_id);

    return successResponse(
      {
        username: admin?.username,
        email: admin?.email,
        authenticated: true,
      },
      undefined,
      corsHeaders(env)
    );
  } catch (error: any) {
    console.error('Error in handleAdminCheckRequest:', error);
    return errorResponse('Internal server error', 500, corsHeaders(env));
  }
}

/**
 * Database health check endpoint
 */
export async function handleHealthCheckRequest(
  request: Request,
  env: Env
): Promise<Response> {
  try {
    if (request.method !== 'GET') {
      return errorResponse('Method not allowed', 405, corsHeaders(env));
    }

    const db = new Database(env);
    const healthy = await db.healthCheck();

    if (!healthy) {
      return errorResponse('Database connection failed', 503, corsHeaders(env));
    }

    return successResponse(
      {
        status: 'healthy',
        database: 'connected',
        timestamp: new Date().toISOString(),
      },
      undefined,
      corsHeaders(env)
    );
  } catch (error: any) {
    console.error('Error in handleHealthCheckRequest:', error);
    return errorResponse('Service unavailable', 503, corsHeaders(env));
  }
}

/**
 * Initialize database schema (requires admin auth)
 */
export async function handleDbInitRequest(
  request: Request,
  env: Env,
  sessionId?: string
): Promise<Response> {
  try {
    if (request.method !== 'POST') {
      return errorResponse('Method not allowed', 405, corsHeaders(env));
    }

    // Verify admin authentication
    if (!sessionId) {
      return errorResponse('Unauthorized', 401, corsHeaders(env));
    }

    const sessionMgr = new SessionManager(env.SESSIONS);
    const session = await sessionMgr.getSession(sessionId);

    if (!session || !session.admin_logged_in) {
      return errorResponse('Unauthorized', 401, corsHeaders(env));
    }

    const result = await initializeDatabase(env);

    if (!result.success) {
      return errorResponse(
        'Failed to initialize database',
        500,
        corsHeaders(env)
      );
    }

    return successResponse(result, 'Database initialized successfully', corsHeaders(env));
  } catch (error: any) {
    console.error('Error in handleDbInitRequest:', error);
    return errorResponse('Internal server error', 500, corsHeaders(env));
  }
}

/**
 * Seed database with sample data (requires admin auth)
 */
export async function handleDbSeedRequest(
  request: Request,
  env: Env,
  sessionId?: string
): Promise<Response> {
  try {
    if (request.method !== 'POST') {
      return errorResponse('Method not allowed', 405, corsHeaders(env));
    }

    // Verify admin authentication
    if (!sessionId) {
      return errorResponse('Unauthorized', 401, corsHeaders(env));
    }

    const sessionMgr = new SessionManager(env.SESSIONS);
    const session = await sessionMgr.getSession(sessionId);

    if (!session || !session.admin_logged_in) {
      return errorResponse('Unauthorized', 401, corsHeaders(env));
    }

    const result = await seedDatabase(env);

    if (!result.success) {
      return errorResponse('Failed to seed database', 500, corsHeaders(env));
    }

    return successResponse(result, 'Database seeded successfully', corsHeaders(env));
  } catch (error: any) {
    console.error('Error in handleDbSeedRequest:', error);
    return errorResponse('Internal server error', 500, corsHeaders(env));
  }
}

/**
 * Get database statistics (requires admin auth)
 */
export async function handleDbStatsRequest(
  request: Request,
  env: Env,
  sessionId?: string
): Promise<Response> {
  try {
    if (request.method !== 'GET') {
      return errorResponse('Method not allowed', 405, corsHeaders(env));
    }

    // Verify admin authentication
    if (!sessionId) {
      return errorResponse('Unauthorized', 401, corsHeaders(env));
    }

    const sessionMgr = new SessionManager(env.SESSIONS);
    const session = await sessionMgr.getSession(sessionId);

    if (!session || !session.admin_logged_in) {
      return errorResponse('Unauthorized', 401, corsHeaders(env));
    }

    const result = await getDatabaseStats(env);

    if (!result.success) {
      return errorResponse('Failed to retrieve database stats', 500, corsHeaders(env));
    }

    return successResponse(
      result.stats,
      undefined,
      corsHeaders(env)
    );
  } catch (error: any) {
    console.error('Error in handleDbStatsRequest:', error);
    return errorResponse('Internal server error', 500, corsHeaders(env));
  }
}

/**
 * Reset database - DELETE ALL DATA (requires admin auth, use with caution)
 */
export async function handleDbResetRequest(
  request: Request,
  env: Env,
  sessionId?: string
): Promise<Response> {
  try {
    if (request.method !== 'POST') {
      return errorResponse('Method not allowed', 405, corsHeaders(env));
    }

    // Verify admin authentication
    if (!sessionId) {
      return errorResponse('Unauthorized', 401, corsHeaders(env));
    }

    const sessionMgr = new SessionManager(env.SESSIONS);
    const session = await sessionMgr.getSession(sessionId);

    if (!session || !session.admin_logged_in) {
      return errorResponse('Unauthorized', 401, corsHeaders(env));
    }

    // Require confirmation
    const body = await parseRequest<any>(request);
    if (!body || body.confirm !== true) {
      return errorResponse(
        'Database reset requires confirmation (confirm: true in request body)',
        400,
        corsHeaders(env)
      );
    }

    const result = await resetDatabase(env);

    if (!result.success) {
      return errorResponse('Failed to reset database', 500, corsHeaders(env));
    }

    return successResponse(result, 'Database reset complete', corsHeaders(env));
  } catch (error: any) {
    console.error('Error in handleDbResetRequest:', error);
    return errorResponse('Internal server error', 500, corsHeaders(env));
  }
}

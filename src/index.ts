import { Env } from './types';
import { optionsRequest } from './middleware/auth';
import { getSessionIdFromCookie } from './utils/session';
import { corsHeaders, errorResponse } from './utils/helpers';

// API imports
import {
  handleCategoryRequest,
  handleProductRequest,
  handleSearchRequest,
} from './api/products';
import {
  handleCheckoutRequest,
  handleCartRequest,
} from './api/checkout';
import {
  handleOrdersRequest,
  handleOrderStatusRequest,
  handleOrderStatsRequest,
} from './api/orders';
import {
  handleAdminLoginRequest,
  handleAdminLogoutRequest,
  handleAdminCheckRequest,
} from './api/admin';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const method = request.method;

    // CORS preflight
    if (method === 'OPTIONS') {
      return optionsRequest(env);
    }

    // Get session ID from cookies
    const cookieHeader = request.headers.get('Cookie') || '';
    const sessionId = getSessionIdFromCookie(cookieHeader) || '';

    // Routes
    try {
      // ========== PRODUCT ROUTES ==========
      if (pathname === '/api/categories' && method === 'GET') {
        return handleCategoryRequest(request, env);
      }

      if (pathname.match(/^\/api\/categories\/[^/]+$/) && method === 'GET') {
        const id = pathname.split('/').pop();
        return handleCategoryRequest(request, env, { id });
      }

      if (pathname === '/api/products' && method === 'GET') {
        return handleProductRequest(request, env);
      }

      if (pathname.match(/^\/api\/products\/[^/]+$/) && method === 'GET') {
        const id = pathname.split('/').pop();
        return handleProductRequest(request, env, { id });
      }

      if (pathname === '/api/products/search' && method === 'GET') {
        return handleSearchRequest(request, env);
      }

      if (pathname === '/api/products/category' && method === 'GET') {
        const category = url.searchParams.get('id');
        if (category) {
          return handleProductRequest(request, env, { category });
        }
      }

      // ========== CART & CHECKOUT ROUTES ==========
      if (pathname === '/api/cart' && (method === 'GET' || method === 'POST' || method === 'DELETE')) {
        return handleCartRequest(request, env, sessionId);
      }

      if (pathname === '/api/checkout' && (method === 'GET' || method === 'POST')) {
        return handleCheckoutRequest(request, env, sessionId);
      }

      // ========== ORDER ROUTES ==========
      if (pathname === '/api/orders' && method === 'GET') {
        return handleOrdersRequest(request, env);
      }

      if (pathname.match(/^\/api\/orders\/[^/]+$/) && method === 'GET') {
        const id = pathname.split('/').pop();
        return handleOrdersRequest(request, env, { id });
      }

      if (pathname.match(/^\/api\/orders\/[^/]+\/status$/) && method === 'PUT') {
        const id = pathname.split('/')[3];
        return handleOrderStatusRequest(request, env, { id });
      }

      if (pathname === '/api/orders/stats' && method === 'GET') {
        return handleOrderStatsRequest(request, env);
      }

      // ========== ADMIN ROUTES ==========
      if (pathname === '/api/admin/login' && method === 'POST') {
        return handleAdminLoginRequest(request, env);
      }

      if (pathname === '/api/admin/logout' && method === 'POST') {
        return handleAdminLogoutRequest(request, env, sessionId);
      }

      if (pathname === '/api/admin/check' && method === 'GET') {
        return handleAdminCheckRequest(request, env, sessionId);
      }

      // ========== HEALTH CHECK ==========
      if (pathname === '/api/health' && method === 'GET') {
        return new Response(JSON.stringify({ status: 'ok' }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders(env),
          },
        });
      }

      // 404
      return errorResponse('Not found', 404, corsHeaders(env));
    } catch (error) {
      console.error('Worker error:', error);
      return errorResponse(
        'Internal server error',
        500,
        corsHeaders(env)
      );
    }
  },
};

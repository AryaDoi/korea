import { Env, PaginationMeta } from '../../types';
import { successResponse, errorResponse, corsHeaders } from '../../utils/helpers';
import { Database } from '../../utils/database';

export async function handleOrdersRequest(request: Request, env: Env, params?: Record<string, string>): Promise<Response> {
  try {
    const db = new Database(env);

    if (request.method === 'GET') {
      if (params?.id) {
        const order = await db.getOrderWithDetails(params.id);
        if (!order) return errorResponse('Order not found', 404, corsHeaders(env));
        return successResponse(order, undefined, corsHeaders(env));
      }

      const url = new URL(request.url);
      const search = url.searchParams.get('search')?.trim() || '';
      const status = url.searchParams.get('status')?.trim();
      const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
      const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '10')));
      const offset = (page - 1) * limit;

      let orders = [];
      let total = 0;

      if (status) {
        orders = await db.getOrdersByStatus(status, limit, offset);
        total = await db.getOrdersCount();
      } else if (search) {
        orders = await db.getOrders(search, limit, offset);
        total = await db.getOrdersCount(search);
      } else {
        orders = await db.getOrders(undefined, limit, offset);
        total = await db.getOrdersCount();
      }

      const pages = Math.ceil(total / limit);
      const pagination: PaginationMeta = {
        page,
        limit,
        total,
        pages,
        has_next: page < pages,
        has_prev: page > 1,
      };

      return successResponse({ orders, pagination }, undefined, corsHeaders(env));
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: corsHeaders(env) });
    }

    return errorResponse('Method not allowed', 405, corsHeaders(env));
  } catch (error: any) {
    console.error('Error in handleOrdersRequest:', error);
    return errorResponse('Internal server error', 500, corsHeaders(env));
  }
}

export async function handleOrderStatusRequest(request: Request, env: Env, params?: Record<string, string>): Promise<Response> {
  try {
    if (request.method !== 'PUT') {
      return errorResponse('Method not allowed', 405, corsHeaders(env));
    }

    if (!params?.id) {
      return errorResponse('Order ID required', 400, corsHeaders(env));
    }

    const body = await request.json().catch(() => null);
    if (!body || !body.status) {
      return errorResponse('Status required in request body', 400, corsHeaders(env));
    }

    // Validate status value
    const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'SELESAI'];
    if (!validStatuses.includes(body.status)) {
      return errorResponse(`Invalid status. Allowed: ${validStatuses.join(', ')}`, 400, corsHeaders(env));
    }

    const db = new Database(env);

    // Check if order exists
    const order = await db.getOrderById(params.id);
    if (!order) {
      return errorResponse('Order not found', 404, corsHeaders(env));
    }

    const success = await db.updateOrderStatus(params.id, body.status);
    if (!success) {
      return errorResponse('Failed to update order status', 500, corsHeaders(env));
    }

    return successResponse(
      { id: params.id, status: body.status, updated_at: new Date().toISOString() },
      'Order status updated successfully',
      corsHeaders(env)
    );
  } catch (error: any) {
    console.error('Error in handleOrderStatusRequest:', error);
    return errorResponse('Internal server error', 500, corsHeaders(env));
  }
}

export async function handleOrderStatsRequest(request: Request, env: Env): Promise<Response> {
  try {
    if (request.method !== 'GET') {
      return errorResponse('Method not allowed', 405, corsHeaders(env));
    }

    const db = new Database(env);
    const stats = await db.getOrderStats();
    const totalRevenue = await db.getTotalRevenue();

    return successResponse(
      {
        orders: stats,
        total_revenue: totalRevenue,
        timestamp: new Date().toISOString(),
      },
      undefined,
      corsHeaders(env)
    );
  } catch (error: any) {
    console.error('Error in handleOrderStatsRequest:', error);
    return errorResponse('Internal server error', 500, corsHeaders(env));
  }
}

/**
 * Handle order note updates
 */
export async function handleOrderNoteRequest(request: Request, env: Env, params?: Record<string, string>): Promise<Response> {
  try {
    if (request.method !== 'PUT') {
      return errorResponse('Method not allowed', 405, corsHeaders(env));
    }

    if (!params?.id) {
      return errorResponse('Order ID required', 400, corsHeaders(env));
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body.catatan !== 'string') {
      return errorResponse('Note (catatan) required', 400, corsHeaders(env));
    }

    const db = new Database(env);

    // Check if order exists
    const order = await db.getOrderById(params.id);
    if (!order) {
      return errorResponse('Order not found', 404, corsHeaders(env));
    }

    const success = await db.updateOrderNote(params.id, body.catatan);
    if (!success) {
      return errorResponse('Failed to update order note', 500, corsHeaders(env));
    }

    return successResponse(
      { id: params.id, catatan: body.catatan, updated_at: new Date().toISOString() },
      'Order note updated successfully',
      corsHeaders(env)
    );
  } catch (error: any) {
    console.error('Error in handleOrderNoteRequest:', error);
    return errorResponse('Internal server error', 500, corsHeaders(env));
  }
}

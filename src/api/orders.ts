import { Env } from '../../types';
import { successResponse, errorResponse, corsHeaders } from '../../utils/helpers';
import { Database } from '../../utils/database';

export async function handleOrdersRequest(
  request: Request,
  env: Env,
  params?: Record<string, string>
): Promise<Response> {
  const db = new Database(env);

  if (request.method === 'GET') {
    if (params?.id) {
      // Get single order with details
      const order = await db.getOrderWithDetails(params.id);
      if (!order) {
        return errorResponse('Order not found', 404, corsHeaders(env));
      }
      return successResponse(order, undefined, corsHeaders(env));
    }

    // Get all orders with search and pagination
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    const orders = await db.getOrders(search, limit, offset);

    return successResponse(
      {
        orders,
        pagination: {
          page,
          limit,
        },
      },
      undefined,
      corsHeaders(env)
    );
  }

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders(env),
    });
  }

  return errorResponse('Method not allowed', 405, corsHeaders(env));
}

export async function handleOrderStatusRequest(
  request: Request,
  env: Env,
  params?: Record<string, string>
): Promise<Response> {
  if (request.method !== 'PUT') {
    return errorResponse('Method not allowed', 405, corsHeaders(env));
  }

  if (!params?.id) {
    return errorResponse('Order ID required', 400, corsHeaders(env));
  }

  const body = await request.json().catch(() => null);

  if (!body || !body.status) {
    return errorResponse('Status required', 400, corsHeaders(env));
  }

  const db = new Database(env);
  const success = await db.updateOrderStatus(params.id, body.status);

  if (!success) {
    return errorResponse('Failed to update order', 500, corsHeaders(env));
  }

  return successResponse(
    { status: body.status },
    'Order updated',
    corsHeaders(env)
  );
}

export async function handleOrderStatsRequest(
  request: Request,
  env: Env
): Promise<Response> {
  if (request.method !== 'GET') {
    return errorResponse('Method not allowed', 405, corsHeaders(env));
  }

  const db = new Database(env);

  const totalRevenue = await db.getTotalRevenue();

  return successResponse(
    {
      total_revenue: totalRevenue,
    },
    undefined,
    corsHeaders(env)
  );
}

import { Env, ApiResponse, Barang } from '../../types';
import { Database } from '../../utils/database';
import { successResponse, errorResponse, corsHeaders } from '../../utils/helpers';

export async function handleCategoryRequest(
  request: Request,
  env: Env,
  params?: Record<string, string>
): Promise<Response> {
  const db = new Database(env);

  if (request.method === 'GET') {
    if (params?.id) {
      // Get single category
      const category = await db.getCategoryById(params.id);
      if (!category) {
        return errorResponse('Category not found', 404, corsHeaders(env));
      }
      return successResponse(category, undefined, corsHeaders(env));
    }

    // Get all categories
    const categories = await db.getCategories();
    return successResponse(categories, undefined, corsHeaders(env));
  }

  return errorResponse('Method not allowed', 405, corsHeaders(env));
}

export async function handleProductRequest(
  request: Request,
  env: Env,
  params?: Record<string, string>
): Promise<Response> {
  const db = new Database(env);

  if (request.method === 'GET') {
    if (params?.id) {
      // Get single product
      const product = await db.getProductById(params.id);
      if (!product) {
        return errorResponse('Product not found', 404, corsHeaders(env));
      }
      return successResponse(product, undefined, corsHeaders(env));
    }

    if (params?.category) {
      // Get products by category
      const products = await db.getProductsByCategory(params.category);
      return successResponse(products, undefined, corsHeaders(env));
    }

    // Get all products with pagination
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const products = await db.getProducts(limit, offset);
    const total = await db.getProductCount();

    return successResponse(
      {
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
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

export async function handleSearchRequest(
  request: Request,
  env: Env
): Promise<Response> {
  if (request.method !== 'GET') {
    return errorResponse('Method not allowed', 405, corsHeaders(env));
  }

  const url = new URL(request.url);
  const query = url.searchParams.get('q') || '';

  if (!query || query.length < 2) {
    return errorResponse('Search query too short', 400, corsHeaders(env));
  }

  const db = new Database(env);
  const results = await db.searchProducts(query);

  return successResponse(results, undefined, corsHeaders(env));
}

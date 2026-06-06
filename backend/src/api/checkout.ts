import { Env, SessionData } from '../../types';
import { successResponse, errorResponse, parseRequest, corsHeaders, generateId, validateEmail } from '../../utils/helpers';
import { Database } from '../../utils/database';
import { SessionManager } from '../../utils/session';

export async function handleCheckoutRequest(request: Request, env: Env, sessionId: string): Promise<Response> {
  const db = new Database(env);
  const sessionMgr = new SessionManager(env.SESSIONS);

  if (request.method === 'GET') {
    const session = await sessionMgr.getSession(sessionId);
    if (!session || !session.cart) return successResponse({ items: [], total: 0 }, undefined, corsHeaders(env));

    const items = [];
    let total = 0;
    for (const [barangId, qty] of Object.entries(session.cart)) {
      const product = await db.getProductById(barangId);
      if (product) {
        const subtotal = product.harga * qty;
        total += subtotal;
        items.push({ ...product, qty, subtotal_item: subtotal });
      }
    }
    const ongkir = 5000;
    return successResponse({ items, subtotal: total, ongkir, total: total + ongkir }, undefined, corsHeaders(env));
  }

  if (request.method === 'POST') {
    const body = await parseRequest<any>(request);
    if (!body || !body.nama_depan || !body.email || !body.alamat || !body.kota || !body.provinsi) {
      return errorResponse('Missing required fields', 400, corsHeaders(env));
    }
    if (!validateEmail(body.email)) return errorResponse('Invalid email', 400, corsHeaders(env));

    const session = await sessionMgr.getSession(sessionId);
    if (!session || !session.cart || Object.keys(session.cart).length === 0) {
      return errorResponse('Cart is empty', 400, corsHeaders(env));
    }

    let total = 0;
    const items = [];
    for (const [barangId, qty] of Object.entries(session.cart)) {
      const product = await db.getProductById(barangId);
      if (product) {
        total += product.harga * qty;
        items.push({ barangId, qty, harga: product.harga });
      }
    }

    const orderId = generateId('ORD');
    const ongkir = 5000;
    const totalAkhir = total + ongkir;

    const pesanan = {
      id_pesanan: orderId,
      nama_penerima: body.nama_depan,
      email: body.email,
      alamat_lengkap: body.alamat,
      kota: body.kota,
      provinsi: body.provinsi,
      kodepos: body.kodepos || '',
      whatsapp: body.whatsapp || '',
      total_bayar: totalAkhir,
      status_pesanan: 'PENDING' as const,
      tanggal_order: new Date().toISOString(),
      ongkir,
    };

    const created = await db.createOrder(pesanan);
    if (!created) return errorResponse('Failed to create order', 500, corsHeaders(env));

    for (const item of items) {
      await db.addOrderDetail({
        id_detail: generateId('DETAIL'),
        id_pesanan: orderId,
        barang_id: item.barangId,
        jumlah: item.qty,
        harga_satuan: item.harga,
      });
    }

    await sessionMgr.clearCart(sessionId);
    return successResponse({ order_id: orderId, total: totalAkhir, status: 'PENDING' }, 'Order created successfully', corsHeaders(env));
  }

  if (request.method === 'OPTIONS') return new Response(null, { status: 200, headers: corsHeaders(env) });
  return errorResponse('Method not allowed', 405, corsHeaders(env));
}

export async function handleCartRequest(request: Request, env: Env, sessionId: string): Promise<Response> {
  const sessionMgr = new SessionManager(env.SESSIONS);

  if (request.method === 'POST') {
    const body = await parseRequest<any>(request);
    if (!body || !body.barang_id || !body.qty) return errorResponse('Missing barang_id or qty', 400, corsHeaders(env));
    const success = await sessionMgr.addToCart(sessionId, body.barang_id, body.qty);
    if (!success) return errorResponse('Failed to add to cart', 500, corsHeaders(env));
    return successResponse({ added: true }, 'Item added to cart', corsHeaders(env));
  }

  if (request.method === 'DELETE') {
    const body = await parseRequest<any>(request);
    if (!body || !body.barang_id) return errorResponse('Missing barang_id', 400, corsHeaders(env));
    const success = await sessionMgr.removeFromCart(sessionId, body.barang_id);
    if (!success) return errorResponse('Failed to remove from cart', 500, corsHeaders(env));
    return successResponse({ removed: true }, 'Item removed from cart', corsHeaders(env));
  }

  if (request.method === 'OPTIONS') return new Response(null, { status: 200, headers: corsHeaders(env) });
  return errorResponse('Method not allowed', 405, corsHeaders(env));
}

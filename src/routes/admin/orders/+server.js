import { json } from '@sveltejs/kit';
import { OrdersModel } from '$lib/db/model/orders.js';
import { OrderDetailModel } from '$lib/db/model/orderDetail.js';
import { validateCSRF } from '$lib/server/auth/csrf.js';

function requireAdmin(locals) {
    if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });
    if (locals.user.role !== 'admin') return json({ error: 'Forbidden: admin only' }, { status: 403 });
    return null;
}

export async function GET({ locals, url }) {
    const guard = requireAdmin(locals);
    if (guard) return guard;

    const page = Number(url.searchParams.get('page')) || 1;
    const limit = Number(url.searchParams.get('limit')) || 10;
    const search = url.searchParams.get('search') || "";

    const res = await OrdersModel.getAll(page, limit, search);
    if (res.IsError) return json({ error: res.Message }, { status: 500 });

    const orders = res.Value.data || [];
    const ordersWithDetails = await Promise.all(orders.map(async (order) => {
        const detailsRes = await OrderDetailModel.getByOrderId(order.id);
        return { ...order, items: detailsRes.Value || [] };
    }));

    return json({ 
        success: true, 
        orders: ordersWithDetails,
        pagination: {
            total: res.Value.total,
            page: res.Value.page,
            limit: res.Value.limit,
            totalPages: Math.ceil(res.Value.total / res.Value.limit)
        }
    });
}

export async function POST({ request, locals, cookies }) {
    try { validateCSRF(request, cookies); } catch (err) { return json({ error: 'CSRF invalid' }, { status: 403 }); }
    const guard = requireAdmin(locals);
    if (guard) return guard;

    const data = await request.json();
    if (!data.user_id || data.total_price === "" || data.total_price === null) {
        return json({ error: 'User ID and total price are required.' }, { status: 400 });
    }

    const res = await OrdersModel.create({
        user_id: data.user_id,
        total_price: data.total_price,
        status: data.status
    });

    if (res.IsError) {
        console.error("DB Error:", res.Message);
        return json({ error: 'Database error while creating order.' }, { status: 400 });
    }
    return json({ success: true, message: 'Order created' });
}

export async function PUT({ request, locals, cookies }) {
    try { validateCSRF(request, cookies); } catch (err) { return json({ error: 'CSRF invalid' }, { status: 403 }); }
    const guard = requireAdmin(locals);
    if (guard) return guard;

    const data = await request.json();
    if (!data.id) return json({ error: 'ID is required' }, { status: 400 });
    if (data.total_price === "" || data.total_price === null) {
        return json({ error: 'Total price is required.' }, { status: 400 });
    }

    const res = await OrdersModel.update(data.id, {
        total_price: data.total_price,
        status: data.status
    });

    if (res.IsError) {
        console.error("DB Error:", res.Message);
        return json({ error: 'Database error while updating order.' }, { status: 400 });
    }
    return json({ success: true, message: 'Order updated' });
}

export async function DELETE({ request, locals, cookies, url }) {
    try { validateCSRF(request, cookies); } catch (err) { return json({ error: 'CSRF invalid' }, { status: 403 }); }
    const guard = requireAdmin(locals);
    if (guard) return guard;

    const ids = url.searchParams.get('ids');
    const singleId = url.searchParams.get('id');

    if (ids) {
        const idList = ids.split(',');
        for (const id of idList) {
            await OrdersModel.delete(id);
        }
        return json({ success: true, message: 'Orders deleted' });
    }

    if (!singleId) return json({ error: 'ID is required' }, { status: 400 });

    const res = await OrdersModel.delete(singleId);
    if (res.IsError) return json({ error: res.Message }, { status: 500 });
    return json({ success: true, message: 'Order deleted' });
}

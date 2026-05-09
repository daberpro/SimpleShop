import { OrdersModel } from '$lib/db/model/orders.js';
import { OrderDetailModel } from '$lib/db/model/orderDetail.js';
import { redirect } from '@sveltejs/kit';

export async function load({ locals, url }) {
    if (!locals.user) {
        throw redirect(302, '/login');
    }

    const page = Number(url.searchParams.get('page')) || 1;
    const limit = Number(url.searchParams.get('limit')) || 10;
    const search = url.searchParams.get('search') || "";

    const ordersRes = await OrdersModel.getByUserId(locals.user.user_id, page, limit, search);
    
    // ordersRes.Value will now have { data, total, page, limit }
    const ordersData = ordersRes.Value || { data: [], total: 0, page: 1, limit: 10 };
    const orders = ordersData.data || [];

    // Fetch details for each order
    const ordersWithDetails = await Promise.all(orders.map(async (order) => {
        const detailsRes = await OrderDetailModel.getByOrderId(order.id);
        const items = detailsRes.Value || [];
        return {
            ...order,
            items
        };
    }));

    return {
        orders: ordersWithDetails,
        pagination: {
            total: ordersData.total,
            page: ordersData.page,
            limit: ordersData.limit,
            totalPages: Math.ceil(ordersData.total / ordersData.limit)
        },
        search
    };
}

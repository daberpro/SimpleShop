import { json } from '@sveltejs/kit';
import { ShipmentModel } from '$lib/db/model/shipment.js';
import { OrdersModel } from '$lib/db/model/orders.js';

// Get shipment track by order_id
export async function GET({ url, locals }) {
    if (!locals.user) {
        return json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const orderId = url.searchParams.get('order_id');
    if (!orderId) {
        return json({ success: false, error: 'Order ID required' }, { status: 400 });
    }

    // Verify user owns the order if not admin
    if (locals.user.role !== 'admin') {
        const orderRes = await OrdersModel.getById(orderId);
        if (!orderRes.Value || orderRes.Value.user_id !== locals.user.user_id) {
            return json({ success: false, error: 'Unauthorized' }, { status: 403 });
        }
    }

    const res = await ShipmentModel.getByOrderId(orderId);
    return json(res);
}

// Add new shipment track event (Admin only)
export async function POST({ request, locals }) {
    if (!locals.user || locals.user.role !== 'admin') {
        return json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const data = await request.json();
        
        if (!data.order_id || !data.title) {
            return json({ success: false, error: 'Order ID and Title are required' }, { status: 400 });
        }

        const res = await ShipmentModel.add(data);
        return json(res);
    } catch (err) {
        return json({ success: false, error: err.message }, { status: 500 });
    }
}

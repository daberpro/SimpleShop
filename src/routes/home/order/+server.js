import { json } from '@sveltejs/kit';
import { OrdersModel } from '$lib/db/model/orders.js';
import { OrderDetailModel } from '$lib/db/model/orderDetail.js';
import { snap } from '$lib/midtrans.js';

export async function POST({ request, locals }) {
    if (!locals.user) {
        return json({ error: 'You must be logged in to place an order.' }, { status: 401 });
    }

    try {
        const { items } = await request.json();

        if (!items || items.length === 0) {
            return json({ error: 'No items in order.' }, { status: 400 });
        }

        // Calculate total price
        let total_price = 0;
        for (const item of items) {
            total_price += item.price * item.quantity;
        }

        // Create Order in Database
        const orderRes = await OrdersModel.create({
            user_id: locals.user.user_id,
            total_price,
            status: 'pending'
        });

        if (orderRes.IsError) {
            return json({ error: 'Failed to create order.' }, { status: 500 });
        }

        const order_id = orderRes.Value.insertId;

        // Prepare Item Details for Midtrans and Database
        const itemDetailsForMidtrans = [];
        for (const item of items) {
            // Create Order Detail in DB
            await OrderDetailModel.create({
                order_id,
                product_id: item.product_id,
                quantity: item.quantity,
                price: item.price
            });

            // Add to Midtrans Item Details
            itemDetailsForMidtrans.push({
                id: String(item.product_id),
                price: item.price,
                quantity: item.quantity,
                name: item.name ? item.name.substring(0, 50) : `Product ${item.product_id}`
            });
        }

        // Create Midtrans Transaction
        const parameter = {
            transaction_details: {
                order_id: String(order_id),
                gross_amount: total_price
            },
            item_details: itemDetailsForMidtrans,
            customer_details: {
                first_name: locals.user.email.split('@')[0],
                email: locals.user.email
            },
            usage_limit: 1
        };

        const transaction = await snap.createTransaction(parameter);

        return json({ 
            success: true, 
            message: 'Order created, proceed to payment.', 
            order_id,
            snap_token: transaction.token 
        });
    } catch (err) {
        console.error('Order Error:', err);
        return json({ error: 'Internal server error.' }, { status: 500 });
    }
}
export async function DELETE({ url, locals }) {
    if (!locals.user) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = url.searchParams.get('id');
    if (!id) return json({ error: 'Order ID is required' }, { status: 400 });

    try {
        // Verify user owns the order
        const orderRes = await OrdersModel.getById(id);
        if (!orderRes.Value || orderRes.Value.user_id !== locals.user.user_id) {
            return json({ error: 'Order not found or access denied' }, { status: 404 });
        }

        // Only allow deleting if status is 'pending'
        if (orderRes.Value.status !== 'pending') {
            return json({ error: 'Only pending orders can be cancelled' }, { status: 400 });
        }

        // Delete details first
        await OrderDetailModel.deleteByOrderId(id);
        // Delete order
        await OrdersModel.delete(id);

        return json({ success: true, message: 'Order cancelled successfully' });
    } catch (err) {
        console.error('Cancel Order Error:', err);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
}

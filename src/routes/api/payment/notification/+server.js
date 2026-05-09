import { json } from '@sveltejs/kit';
import { snap } from '$lib/midtrans.js';
import { OrdersModel } from '$lib/db/model/orders.js';

import { OrderDetailModel } from '$lib/db/model/orderDetail.js';

export async function POST({ request }) {
    try {
        const notificationJson = await request.json();
        let statusResponse;

        try {
            // Verify notification with Midtrans
            statusResponse = await snap.transaction.notification(notificationJson);
        } catch (midtransErr) {
            // Handle cases where transaction doesn't exist (e.g. Test Notification from dashboard)
            if (midtransErr.httpStatusCode === '404' || (midtransErr.ApiResponse && midtransErr.ApiResponse.status_code === '404')) {
                console.warn('Midtrans Notification Warning: Transaction not found on Midtrans. This might be a test notification.');
                return json({ success: true, message: 'Notification ignored (Transaction not found)' });
            }
            throw midtransErr; // Re-throw if it's another type of error
        }

        const orderId = statusResponse.order_id;
        const transactionStatus = statusResponse.transaction_status;
        const fraudStatus = statusResponse.fraud_status;

        console.log(`Transaction notification received. Order ID: ${orderId}. Transaction status: ${transactionStatus}. Fraud status: ${fraudStatus}`);

        // Verify if order exists in our database
        const orderRes = await OrdersModel.getById(orderId);
        if (!orderRes.Value) {
            console.warn(`Order ${orderId} not found in database. Skipping update.`);
            return json({ success: true, message: 'Order not found in local database' });
        }

        if (transactionStatus == 'cancel' ||
            transactionStatus == 'deny' ||
            transactionStatus == 'expire') {
            
            console.log(`Order ${orderId} was ${transactionStatus}. Deleting from database.`);
            
            // Delete details first
            await OrderDetailModel.deleteByOrderId(orderId);
            // Delete order
            await OrdersModel.delete(orderId);
            
            return json({ success: true, message: 'Order deleted due to cancellation' });
        }

        let orderStatus = 'pending';

        if (transactionStatus == 'capture') {
            if (fraudStatus == 'challenge') {
                orderStatus = 'challenge';
            } else if (fraudStatus == 'accept') {
                orderStatus = 'completed';
            }
        } else if (transactionStatus == 'settlement') {
            orderStatus = 'completed';
        } else if (transactionStatus == 'pending') {
            orderStatus = 'pending';
        }

        // Update order status in database
        await OrdersModel.updateStatus(orderId, orderStatus);

        return json({ success: true });
    } catch (err) {
        console.error('Notification Error:', err);
        // Returning 200 even on error to prevent Midtrans from retrying infinitely if it's a code issue
        // But for debugging, keeping it 500 might be better during development.
        return json({ error: 'Internal server error' }, { status: 500 });
    }
}

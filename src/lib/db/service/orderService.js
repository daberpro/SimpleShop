import { withTransaction } from "../init.js";
import { Result } from "../result.js";

export const OrderService = {

    async createOrderWithItems(data) {
        try {
            const { user_id, items } = data;

            if (!user_id || !items || items.length === 0) {
                return Result.error(
                    "user_id and items are required",
                    "VALIDATION_ERROR"
                );
            }

            return await withTransaction(async (conn) => {

                // 1. create order
                const [orderResult] = await conn.execute(
                    "INSERT INTO orders (user_id, total_price, status) VALUES (?, ?, ?)",
                    [user_id, 0, "pending"]
                );

                const orderId = orderResult.insertId;

                let total = 0;

                // 2. loop items
                for (const item of items) {
                    const { product_id, quantity } = item;

                    if (!product_id || !quantity) {
                        throw new Error("Invalid item data");
                    }

                    // ambil harga dari product (hindari manipulasi client)
                    const [productRows] = await conn.execute(
                        "SELECT price FROM products WHERE id = ?",
                        [product_id]
                    );

                    if (productRows.length === 0) {
                        throw new Error(`Product not found: ${product_id}`);
                    }

                    const price = productRows[0].price;
                    const subtotal = price * quantity;

                    total += subtotal;

                    // insert order detail
                    await conn.execute(
                        `INSERT INTO order_details 
                        (order_id, product_id, quantity, price, subtotal)
                        VALUES (?, ?, ?, ?, ?)`,
                        [orderId, product_id, quantity, price, subtotal]
                    );
                }

                // 3. update total order
                await conn.execute(
                    "UPDATE orders SET total_price = ? WHERE id = ?",
                    [total, orderId]
                );

                return Result.success(
                    { order_id: orderId, total },
                    "Order created with items"
                );
            });

        } catch (err) {
            return Result.error(err.message, "ORDER_TRANSACTION_FAILED");
        }
    }
};
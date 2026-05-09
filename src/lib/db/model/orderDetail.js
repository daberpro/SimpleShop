import { query } from "../init.js";
import { Result } from "../result.js";

export const OrderDetailModel = {

    async create(data) {
        try {
            const { order_id, product_id, quantity, price } = data;

            if (!order_id || !product_id || !quantity) {
                return Result.error(
                    "order_id, product_id, and quantity are required",
                    "VALIDATION_ERROR"
                );
            }

            const subtotal = (price || 0) * quantity;

            const result = await query(
                `INSERT INTO order_details 
                 (order_id, product_id, quantity, price, subtotal) 
                 VALUES (?, ?, ?, ?, ?)`,
                [
                    Number(order_id),
                    Number(product_id),
                    Number(quantity),
                    Number(price || 0),
                    Number(subtotal)
                ]
            );

            return Result.success(
                { insertId: result.insertId },
                "Order detail created"
            );

        } catch (err) {
            return Result.error(err.message, "DB_CREATE_ERROR");
        }
    },

    async getById(id) {
        try {
            const rows = await query(
                `SELECT od.*, p.name AS product_name, p.price AS product_price
                 FROM order_details od
                 JOIN products p ON od.product_id = p.id
                 WHERE od.id = ?`,
                [id]
            );

            if (rows.length === 0) {
                return Result.success(null, "Order detail not found");
            }

            return Result.success(rows[0], "Order detail found");

        } catch (err) {
            return Result.error(err.message, "DB_GET_ERROR");
        }
    },

    async getByOrderId(order_id) {
        try {
            const rows = await query(
                `SELECT od.*, p.name AS product_name, p.image AS product_image
                 FROM order_details od
                 LEFT JOIN products p ON od.product_id = p.id
                 WHERE od.order_id = ?`,
                [order_id]
            );

            return Result.success(rows, "Order details");

        } catch (err) {
            return Result.error(err.message, "DB_GET_ERROR");
        }
    },

    async getAll() {
        try {
            const rows = await query(
                `SELECT od.*, p.name AS product_name
                 FROM order_details od
                 JOIN products p ON od.product_id = p.id`
            );

            return Result.success(rows, "All order details");

        } catch (err) {
            return Result.error(err.message, "DB_GET_ALL_ERROR");
        }
    },

    async update(id, data) {
        try {
            const { quantity, price } = data;

            const subtotal = (price || 0) * (quantity || 0);

            const result = await query(
                `UPDATE order_details
                 SET quantity = ?, price = ?, subtotal = ?
                 WHERE id = ?`,
                [quantity, price, subtotal, id]
            );

            return Result.success(
                { affectedRows: result.affectedRows },
                "Order detail updated"
            );

        } catch (err) {
            return Result.error(err.message, "DB_UPDATE_ERROR");
        }
    },

    async delete(id) {
        try {
            const result = await query(
                "DELETE FROM order_details WHERE id = ?",
                [id]
            );

            return Result.success(
                { affectedRows: result.affectedRows },
                "Order detail deleted"
            );

        } catch (err) {
            return Result.error(err.message, "DB_DELETE_ERROR");
        }
    },

    async deleteByOrderId(order_id) {
        try {
            const result = await query(
                "DELETE FROM order_details WHERE order_id = ?",
                [order_id]
            );

            return Result.success(
                { affectedRows: result.affectedRows },
                "Order details deleted"
            );

        } catch (err) {
            return Result.error(err.message, "DB_DELETE_ERROR");
        }
    }
};
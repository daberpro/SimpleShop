import { query } from "../init.js";
import { Result } from "../result.js";

export const OrdersModel = {

    async create(data) {
        try {
            const { user_id, total_price, status } = data;

            if (!user_id) {
                return Result.error("user_id is required", "VALIDATION_ERROR");
            }

            const result = await query(
                "INSERT INTO orders (user_id, total_price, status) VALUES (?, ?, ?)",
                [user_id, total_price || 0, status || "pending"]
            );

            return Result.success(
                { insertId: result.insertId },
                "Order created"
            );

        } catch (err) {
            return Result.error(err.message, "DB_CREATE_ERROR");
        }
    },

    async getById(id) {
        try {
            const rows = await query(
                `SELECT o.*, u.email
                 FROM orders o
                 JOIN users u ON o.user_id = u.id
                 WHERE o.id = ?`,
                [id]
            );

            if (rows.length === 0) {
                return Result.success(null, "Order not found");
            }

            return Result.success(rows[0], "Order found");

        } catch (err) {
            return Result.error(err.message, "DB_GET_ERROR");
        }
    },

    async getByUserId(user_id, page = 1, limit = 10, search = "") {
        try {
            const offset = (page - 1) * limit;

            let countQuery = "SELECT COUNT(*) as total FROM orders WHERE user_id = ?";
            let dataQuery = `SELECT o.id, o.user_id, o.total_price, o.status, o.created_at, u.email
                 FROM orders o
                 JOIN users u ON o.user_id = u.id
                 WHERE o.user_id = ?`;
            let params = [user_id];
            
            if (search) {
                countQuery += " AND id = ?";
                dataQuery += " AND o.id = ?";
                params.push(search);
            }
            
            dataQuery += " ORDER BY o.created_at DESC LIMIT ? OFFSET ?";

            const countResult = await query(countQuery, params);
            const total = countResult[0].total;

            const rows = await query(dataQuery, [...params, Number(limit), Number(offset)]);

            return Result.success({ data: rows, total, page: Number(page), limit: Number(limit) }, "User orders");

        } catch (err) {
            return Result.error(err.message, "DB_GET_ERROR");
        }
    },

    async getAll(page = 1, limit = 10, search = "") {
        try {
            const offset = (page - 1) * limit;
            
            let countQuery = "SELECT COUNT(*) as total FROM orders";
            let dataQuery = `SELECT o.*, u.email
                 FROM orders o
                 JOIN users u ON o.user_id = u.id`;
            let params = [];
            
            if (search) {
                countQuery += " WHERE id = ?";
                dataQuery += " WHERE o.id = ?";
                params.push(search);
            }
            
            dataQuery += " LIMIT ? OFFSET ?";
            
            const countResult = await query(countQuery, search ? [search] : []);
            const total = countResult[0].total;

            const rows = await query(dataQuery, [...params, Number(limit), Number(offset)]);

            return Result.success({ data: rows, total, page: Number(page), limit: Number(limit) }, "Paginated orders");
        } catch (err) {
            return Result.error(err.message, "DB_GET_ALL_ERROR");
        }
    },

    async update(id, data) {
        try {
            const { total_price, status } = data;

            const result = await query(
                "UPDATE orders SET total_price = ?, status = ? WHERE id = ?",
                [total_price, status, id]
            );

            return Result.success(
                { affectedRows: result.affectedRows },
                "Order updated"
            );

        } catch (err) {
            return Result.error(err.message, "DB_UPDATE_ERROR");
        }
    },

    async updateStatus(id, status) {
        try {
            const result = await query(
                "UPDATE orders SET status = ? WHERE id = ?",
                [status, id]
            );

            return Result.success(
                { affectedRows: result.affectedRows },
                "Order status updated"
            );

        } catch (err) {
            return Result.error(err.message, "DB_UPDATE_ERROR");
        }
    },

    async delete(id) {
        try {
            // Delete details first
            await query("DELETE FROM order_details WHERE order_id = ?", [id]);
            
            // Delete order
            const result = await query(
                "DELETE FROM orders WHERE id = ?",
                [id]
            );

            return Result.success(
                { affectedRows: result.affectedRows },
                "Order deleted"
            );

        } catch (err) {
            return Result.error(err.message, "DB_DELETE_ERROR");
        }
    }
};
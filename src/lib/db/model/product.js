import { query } from "../init.js";
import { Result } from "../result.js";

export const ProductModel = {

    async create(data) {
        try {
            const { name, price, category_id, image, description } = data;

            const result = await query(
                "INSERT INTO products (name, price, category_id, image, description) VALUES (?, ?, ?, ?, ?)",
                [name, price, category_id, image || null, description || null]
            );

            return Result.success({ insertId: result.insertId }, "Product created");
        } catch (err) {
            return Result.error(err.message, "DB_CREATE_ERROR");
        }
    },

    async getById(id) {
        try {
            const rows = await query(
                `SELECT p.*, c.name as category_name 
                 FROM products p 
                 LEFT JOIN categories c ON p.category_id = c.id 
                 WHERE p.id = ?`,
                [id]
            );

            if (rows.length === 0) {
                return Result.success(null, "Product not found");
            }

            return Result.success(rows[0], "Product found");
        } catch (err) {
            return Result.error(err.message, "DB_GET_ERROR");
        }
    },

    async getAll(page = 1, limit = 10, search = "", categoryId = "") {
        try {
            const offset = (page - 1) * limit;
            let whereClause = "WHERE 1=1";
            let params = [];

            if (search) {
                whereClause += " AND p.name LIKE ?";
                params.push(`%${search}%`);
            }

            if (categoryId) {
                whereClause += " AND p.category_id = ?";
                params.push(categoryId);
            }

            const countResult = await query(`SELECT COUNT(*) as total FROM products p ${whereClause}`, params);
            const total = countResult[0].total;

            const rows = await query(
                `SELECT p.*, c.name as category_name 
                 FROM products p 
                 LEFT JOIN categories c ON p.category_id = c.id 
                 ${whereClause}
                 LIMIT ? OFFSET ?`,
                [...params, Number(limit), Number(offset)]
            );

            return Result.success({ data: rows, total, page: Number(page), limit: Number(limit) }, "Paginated products");
        } catch (err) {
            return Result.error(err.message, "DB_GET_ALL_ERROR");
        }
    },

    async update(id, data) {
        try {
            const { name, price, category_id, image, description } = data;

            const result = await query(
                "UPDATE products SET name = ?, price = ?, category_id = ?, image = ?, description = ? WHERE id = ?",
                [name, price, category_id, image || null, description || null, id]
            );

            return Result.success(
                { affectedRows: result.affectedRows },
                "Product updated"
            );
        } catch (err) {
            return Result.error(err.message, "DB_UPDATE_ERROR");
        }
    },

    async delete(id) {
        try {
            const result = await query(
                "DELETE FROM products WHERE id = ?",
                [id]
            );

            return Result.success(
                { affectedRows: result.affectedRows },
                "Product deleted"
            );
        } catch (err) {
            return Result.error(err.message, "DB_DELETE_ERROR");
        }
    }
};
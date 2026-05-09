import { query } from "../init.js";
import { Result } from "../result.js";

export const CategoryModel = {

    async create(data) {
        try {
            const { name, description } = data;

            if (!name) {
                return Result.error("Name is required", "VALIDATION_ERROR");
            }

            const result = await query(
                "INSERT INTO categories (name, description) VALUES (?, ?)",
                [name, description || null]
            );

            return Result.success(
                { insertId: result.insertId },
                "Category created"
            );
        } catch (err) {
            return Result.error(err.message, "DB_CREATE_ERROR");
        }
    },

    async getById(id) {
        try {
            const rows = await query(
                "SELECT * FROM categories WHERE id = ?",
                [id]
            );

            if (rows.length === 0) {
                return Result.success(null, "Category not found");
            }

            return Result.success(rows[0], "Category found");
        } catch (err) {
            return Result.error(err.message, "DB_GET_ERROR");
        }
    },

    async getAll(page = 1, limit = 10) {
        try {
            const offset = (page - 1) * limit;
            const countResult = await query("SELECT COUNT(*) as total FROM categories");
            const total = countResult[0].total;

            const rows = await query(
                "SELECT * FROM categories LIMIT ? OFFSET ?",
                [Number(limit), Number(offset)]
            );

            return Result.success({ data: rows, total, page: Number(page), limit: Number(limit) }, "Paginated categories");
        } catch (err) {
            return Result.error(err.message, "DB_GET_ALL_ERROR");
        }
    },

    async update(id, data) {
        try {
            const { name, description } = data;

            if (!name) {
                return Result.error("Name is required", "VALIDATION_ERROR");
            }

            const result = await query(
                "UPDATE categories SET name = ?, description = ? WHERE id = ?",
                [name, description || null, id]
            );

            return Result.success(
                { affectedRows: result.affectedRows },
                "Category updated"
            );
        } catch (err) {
            return Result.error(err.message, "DB_UPDATE_ERROR");
        }
    },

    async delete(id) {
        try {
            const result = await query(
                "DELETE FROM categories WHERE id = ?",
                [id]
            );

            return Result.success(
                { affectedRows: result.affectedRows },
                "Category deleted"
            );
        } catch (err) {
            return Result.error(err.message, "DB_DELETE_ERROR");
        }
    }
};
import { query } from "../init.js";
import { Result } from "../result.js";
import bcrypt from "bcrypt";

export const UsersModel = {

    async create(data) {
        try {
            const { email, password, role, google_id } = data;

            if (!email || (!password && !google_id)) {
                return Result.error("Email and password (or google_id) are required", "VALIDATION_ERROR");
            }

            const existing = await query(
                "SELECT id FROM users WHERE email = ?",
                [email]
            );

            if (existing.length > 0) {
                return Result.error("Email already exists", "EMAIL_EXISTS");
            }

            const hashedPassword = password ? await bcrypt.hash(password, 10) : "OAUTH_USER";

            const result = await query(
                "INSERT INTO users (email, password, role, google_id) VALUES (?, ?, ?, ?)",
                [email, hashedPassword, role || "user", google_id || null]
            );

            return Result.success(
                { insertId: result.insertId },
                "User created"
            );

        } catch (err) {
            return Result.error(err.message, "DB_CREATE_ERROR");
        }
    },

    async getByGoogleId(google_id) {
        try {
            const rows = await query(
                "SELECT * FROM users WHERE google_id = ?",
                [google_id]
            );

            if (rows.length === 0) {
                return Result.success(null, "User not found");
            }

            return Result.success(rows[0], "User found");

        } catch (err) {
            return Result.error(err.message, "DB_GET_ERROR");
        }
    },

    async getById(id) {
        try {
            const rows = await query(
                "SELECT id, email, role FROM users WHERE id = ?",
                [id]
            );

            if (rows.length === 0) {
                return Result.success(null, "User not found");
            }

            return Result.success(rows[0], "User found");

        } catch (err) {
            return Result.error(err.message, "DB_GET_ERROR");
        }
    },

    async getByEmail(email) {
        try {
            const rows = await query(
                "SELECT * FROM users WHERE email = ?",
                [email]
            );

            if (rows.length === 0) {
                return Result.success(null, "User not found");
            }

            return Result.success(rows[0], "User found");

        } catch (err) {
            return Result.error(err.message, "DB_GET_ERROR");
        }
    },

    async getAll(page = 1, limit = 10) {
        try {
            const offset = (page - 1) * limit;
            const countResult = await query("SELECT COUNT(*) as total FROM users");
            const total = countResult[0].total;

            const rows = await query(
                "SELECT id, email, role FROM users LIMIT ? OFFSET ?",
                [Number(limit), Number(offset)]
            );

            return Result.success({ data: rows, total, page: Number(page), limit: Number(limit) }, "Paginated users");
        } catch (err) {
            return Result.error(err.message, "DB_GET_ALL_ERROR");
        }
    },

    async update(id, data) {
        try {
            const { email, password, role } = data;

            if (!email) {
                return Result.error("Email is required", "VALIDATION_ERROR");
            }

            // cek email dipakai user lain
            const existing = await query(
                "SELECT id FROM users WHERE email = ? AND id != ?",
                [email, id]
            );

            if (existing.length > 0) {
                return Result.error("Email already used by another user", "EMAIL_EXISTS");
            }

            const result = await query(
                "UPDATE users SET email = ?, password = ?, role = ? WHERE id = ?",
                [email, password, role || "user", id]
            );

            return Result.success(
                { affectedRows: result.affectedRows },
                "User updated"
            );

        } catch (err) {
            return Result.error(err.message, "DB_UPDATE_ERROR");
        }
    },

    async delete(id) {
        try {
            const result = await query(
                "DELETE FROM users WHERE id = ?",
                [id]
            );

            return Result.success(
                { affectedRows: result.affectedRows },
                "User deleted"
            );

        } catch (err) {
            return Result.error(err.message, "DB_DELETE_ERROR");
        }
    }
};
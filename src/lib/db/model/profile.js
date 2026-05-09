import { query } from "../init.js";
import { Result } from "../result.js";

export const ProfileModel = {

    async create(data) {
        try {
            const { user_id, full_name, address, phone, avatar } = data;

            if (!user_id) {
                return Result.error("user_id is required", "VALIDATION_ERROR");
            }

            // cek apakah profile sudah ada (1 user = 1 profile)
            const existing = await query(
                "SELECT id FROM profiles WHERE user_id = ?",
                [user_id]
            );

            if (existing.length > 0) {
                return Result.error("Profile already exists for this user", "PROFILE_EXISTS");
            }

            const result = await query(
                "INSERT INTO profiles (user_id, full_name, address, phone, avatar) VALUES (?, ?, ?, ?, ?)",
                [user_id, full_name || null, address || null, phone || null, avatar || null]
            );

            return Result.success(
                { insertId: result.insertId },
                "Profile created"
            );

        } catch (err) {
            return Result.error(err.message, "DB_CREATE_ERROR");
        }
    },

    async getById(id) {
        try {
            const rows = await query(
                `SELECT p.*, u.email, u.role
                 FROM profiles p
                 JOIN users u ON p.user_id = u.id
                 WHERE p.id = ?`,
                [id]
            );

            if (rows.length === 0) {
                return Result.success(null, "Profile not found");
            }

            return Result.success(rows[0], "Profile found");

        } catch (err) {
            return Result.error(err.message, "DB_GET_ERROR");
        }
    },

    async getByUserId(user_id) {
        try {
            const rows = await query(
                `SELECT p.*, u.email, u.role
                 FROM profiles p
                 JOIN users u ON p.user_id = u.id
                 WHERE p.user_id = ?`,
                [user_id]
            );

            if (rows.length === 0) {
                return Result.success(null, "Profile not found");
            }

            return Result.success(rows[0], "Profile found");

        } catch (err) {
            return Result.error(err.message, "DB_GET_ERROR");
        }
    },

    async getAll() {
        try {
            const rows = await query(
                `SELECT p.*, u.email, u.role
                 FROM profiles p
                 JOIN users u ON p.user_id = u.id`
            );

            return Result.success(rows, "All profiles");

        } catch (err) {
            return Result.error(err.message, "DB_GET_ALL_ERROR");
        }
    },

    async update(id, data) {
        try {
            const { full_name, address, phone, avatar } = data;

            const result = await query(
                `UPDATE profiles
                 SET full_name = ?, address = ?, phone = ?, avatar = ?
                 WHERE id = ?`,
                [full_name || null, address || null, phone || null, avatar || null, id]
            );

            return Result.success(
                { affectedRows: result.affectedRows },
                "Profile updated"
            );

        } catch (err) {
            return Result.error(err.message, "DB_UPDATE_ERROR");
        }
    },

    async delete(id) {
        try {
            const result = await query(
                "DELETE FROM profiles WHERE id = ?",
                [id]
            );

            return Result.success(
                { affectedRows: result.affectedRows },
                "Profile deleted"
            );

        } catch (err) {
            return Result.error(err.message, "DB_DELETE_ERROR");
        }
    }
};
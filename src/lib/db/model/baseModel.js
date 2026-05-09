import { query } from "../init.js";
import { Result } from "../result.js";

export class BaseModel {
    constructor(table) {
        this.table = table;
    }

    async create(data) {
        try {
            const keys = Object.keys(data);
            const values = Object.values(data);

            const placeholders = keys.map(() => "?").join(", ");

            const sql = `INSERT INTO ${this.table} (${keys.join(", ")}) VALUES (${placeholders})`;

            const result = await query(sql, values);

            return Result.success(
                { insertId: result.insertId },
                `${this.table} created`
            );
        } catch (err) {
            return Result.error(err.message, "DB_CREATE_ERROR");
        }
    }

    async getById(id) {
        try {
            const rows = await query(
                `SELECT * FROM ${this.table} WHERE id = ?`,
                [id]
            );

            if (rows.length === 0) {
                return Result.success(null, "Not found");
            }

            return Result.success(rows[0], "Found");
        } catch (err) {
            return Result.error(err.message, "DB_GET_ERROR");
        }
    }

    async getAll() {
        try {
            const rows = await query(
                `SELECT * FROM ${this.table}`
            );

            return Result.success(rows, "All data");
        } catch (err) {
            return Result.error(err.message, "DB_GET_ALL_ERROR");
        }
    }

    async update(id, data) {
        try {
            const keys = Object.keys(data);
            const values = Object.values(data);

            const setClause = keys.map(k => `${k} = ?`).join(", ");

            const sql = `UPDATE ${this.table} SET ${setClause} WHERE id = ?`;

            const result = await query(sql, [...values, id]);

            return Result.success(
                { affectedRows: result.affectedRows },
                "Updated"
            );
        } catch (err) {
            return Result.error(err.message, "DB_UPDATE_ERROR");
        }
    }

    async delete(id) {
        try {
            const result = await query(
                `DELETE FROM ${this.table} WHERE id = ?`,
                [id]
            );

            return Result.success(
                { affectedRows: result.affectedRows },
                "Deleted"
            );
        } catch (err) {
            return Result.error(err.message, "DB_DELETE_ERROR");
        }
    }
}
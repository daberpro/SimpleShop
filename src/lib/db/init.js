import mysql from "mysql2/promise";
import { env } from "$env/dynamic/private";

const pool = mysql.createPool({
    host: env.DB_HOST,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    port: Number(env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 10
});

export async function query(sql, params = []) {
    const [rows] = await pool.execute(sql, params);
    return rows;
}

export async function withTransaction(callback) {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const result = await callback(connection);

        await connection.commit();
        return result;

    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
}
import { query } from '../init.js';

export const ShipmentModel = {
    // Get shipment track for an order
    getByOrderId: async (orderId) => {
        try {
            const sql = 'SELECT * FROM shipment_track WHERE order_id = ? ORDER BY datetime_start DESC, id DESC';
            const rows = await query(sql, [orderId]);
            return { success: true, Value: { data: rows } };
        } catch (error) {
            console.error('ShipmentModel.getByOrderId error:', error);
            return { success: false, error: error.message };
        }
    },

    // Add a new track event
    add: async (data) => {
        try {
            const sql = `
                INSERT INTO shipment_track (order_id, title, current_status, description, datetime_start, datetime_finished)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            const params = [
                data.order_id,
                data.title,
                data.current_status || null,
                data.description || null,
                data.datetime_start || new Date(),
                data.datetime_finished || null
            ];
            const result = await query(sql, params);
            return { success: true, Value: { insertId: result.insertId } };
        } catch (error) {
            console.error('ShipmentModel.add error:', error);
            return { success: false, error: error.message };
        }
    },

    // Delete a track event
    delete: async (id) => {
        try {
            const sql = 'DELETE FROM shipment_track WHERE id = ?';
            await query(sql, [id]);
            return { success: true };
        } catch (error) {
            console.error('ShipmentModel.delete error:', error);
            return { success: false, error: error.message };
        }
    }
};

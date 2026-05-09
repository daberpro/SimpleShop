import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import jwt from 'jsonwebtoken';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cookie from 'cookie';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

// Database Connection
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT) || 3306,
});

// Initialize Database Table
async function initDb() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS chat_messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                sender_id INT NOT NULL,
                receiver_id INT, 
                message TEXT NOT NULL,
                is_read TINYINT(1) DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        // Ensure column exists for older tables
        try {
            await pool.execute("SELECT is_read FROM chat_messages LIMIT 1");
        } catch (e) {
            await pool.execute("ALTER TABLE chat_messages ADD COLUMN is_read TINYINT(1) DEFAULT 0");
        }
        console.log('Database initialized');
    } catch (err) {
        console.error('Failed to initialize database:', err);
    }
}
initDb();

const clients = new Map(); // userId -> ws

server.on('upgrade', (request, socket, head) => {
    // CSRF/Origin Protection
    const origin = request.headers.origin;
    const allowedOrigins = ['https://shop.daberdev.my.id'];
    
    if (!allowedOrigins.includes(origin)) {
        console.warn(`Blocked connection from forbidden origin: ${origin}`);
        socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
        socket.destroy();
        return;
    }

    // Parse cookies
    const cookies = cookie.parse(request.headers.cookie || '');
    const token = cookies.access_token;

    if (!token) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        wss.handleUpgrade(request, socket, head, (ws) => {
            ws.user = decoded; // user_id, email, role
            wss.emit('connection', ws, request);
        });
    } catch (err) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
    }
});

wss.on('connection', async (ws) => {
    const userId = ws.user.user_id;
    const role = ws.user.role;

    clients.set(userId, ws);
    console.log(`User connected: ${userId} (${role})`);

    async function sendHistory(offset = 0, targetUserId = null) {
        let sql = '';
        let params = [];
        const limit = 20;

        if (role === 'admin') {
            if (targetUserId) {
                sql = `
                    SELECT cm.*, u.email as sender_email 
                    FROM chat_messages cm 
                    JOIN users u ON cm.sender_id = u.id 
                    WHERE (sender_id = ? AND receiver_id = ?) 
                        OR (sender_id = ? AND receiver_id = ?)
                        OR (sender_id = ? AND receiver_id IS NULL)
                    ORDER BY created_at DESC 
                    LIMIT ? OFFSET ?
                `;
                params = [targetUserId, userId, userId, targetUserId, targetUserId, limit, Number(offset)];
            } else {
                // Global history for admin conversation list
                sql = `
                    SELECT cm.*, u.email as sender_email 
                    FROM chat_messages cm 
                    JOIN users u ON cm.sender_id = u.id 
                    ORDER BY created_at DESC 
                    LIMIT 100 OFFSET ?
                `;
                params = [Number(offset)];
            }
        } else {
            sql = `
                SELECT cm.*, u.email as sender_email 
                FROM chat_messages cm 
                JOIN users u ON cm.sender_id = u.id 
                WHERE cm.sender_id = ? 
                    OR cm.receiver_id = ? 
                    OR (cm.receiver_id IS NULL AND u.role = 'admin')
                ORDER BY cm.created_at ASC 
                LIMIT ? OFFSET ?
            `;
            // For user history, we might want latest ones first too for pagination, 
            // but let's keep it simple for now or use the same DESC pattern.
            // Using DESC for consistency with pagination logic.
            sql = sql.replace('ORDER BY cm.created_at ASC', 'ORDER BY cm.created_at DESC');
            params = [userId, userId, limit, Number(offset)];
        }

        try {
            const [rows] = await pool.execute(sql, params);
            ws.send(JSON.stringify({ 
                type: 'history', 
                data: rows.reverse(), 
                offset, 
                hasMore: rows.length === limit,
                forUserId: targetUserId 
            }));
        } catch (err) {
            console.error('History error:', err);
        }
    }

    // Initial load
    sendHistory(0);

    ws.on('message', async (data) => {
        try {
            const parsed = JSON.parse(data);
            const { type, message, receiverId, offset = 0 } = parsed;

            if (type === 'history') {
                await sendHistory(offset, receiverId);
                return;
            }

            if (type === 'read') {
                // Mark messages as read where I am the receiver
                if (role === 'admin') {
                    // If admin marks as read, they are reading messages FROM a specific user (or broadcasts)
                    await pool.execute(
                        'UPDATE chat_messages SET is_read = 1 WHERE receiver_id IS NULL AND sender_id = ? AND is_read = 0',
                        [receiverId]
                    );
                } else {
                    // If user marks as read, they are reading messages FROM admin
                    await pool.execute(
                        'UPDATE chat_messages SET is_read = 1 WHERE receiver_id = ? AND is_read = 0',
                        [userId]
                    );
                }
                return;
            }

            if (type === 'delete_conversation') {
                if (role !== 'admin') return;
                // Delete all messages between this admin and the target user
                // (including broadcasts from that user)
                await pool.execute(
                    'DELETE FROM chat_messages WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id IS NULL)',
                    [userId, receiverId, receiverId, userId, receiverId]
                );
                ws.send(JSON.stringify({ type: 'deleted', targetId: receiverId }));
                return;
            }

            if (type === 'chat') {
                // Save to DB
                const [result] = await pool.execute(
                    'INSERT INTO chat_messages (sender_id, receiver_id, message) VALUES (?, ?, ?)',
                    [userId, receiverId || null, message]
                );

                const msgData = {
                    id: result.insertId,
                    sender_id: userId,
                    sender_email: ws.user.email,
                    receiver_id: receiverId || null,
                    message,
                    is_read: 0,
                    created_at: new Date()
                };

                // Routing
                if (role === 'admin') {
                    if (!receiverId) {
                        // Admin Broadcast to EVERYONE
                        wss.clients.forEach(client => {
                            if (client.readyState === WebSocket.OPEN) {
                                client.send(JSON.stringify({ type: 'chat', data: msgData }));
                            }
                        });
                    } else {
                        // Admin to specific user
                        const targetClient = clients.get(receiverId);
                        if (targetClient && targetClient.readyState === WebSocket.OPEN) {
                            targetClient.send(JSON.stringify({ type: 'chat', data: msgData }));
                        }
                        // Send back to admin
                        ws.send(JSON.stringify({ type: 'chat', data: msgData }));
                    }
                } else {
                    // User message
                    if (!receiverId) {
                        // User to all admins
                        wss.clients.forEach(client => {
                            if (client.readyState === WebSocket.OPEN && client.user.role === 'admin') {
                                client.send(JSON.stringify({ type: 'chat', data: msgData }));
                            }
                        });
                    } else {
                        // User to specific recipient (e.g. specific admin)
                        const targetClient = clients.get(receiverId);
                        if (targetClient && targetClient.readyState === WebSocket.OPEN) {
                            targetClient.send(JSON.stringify({ type: 'chat', data: msgData }));
                        }
                    }
                    // Send back to user
                    ws.send(JSON.stringify({ type: 'chat', data: msgData }));
                }
            }
        } catch (err) {
            console.error('Error processing message:', err);
        }
    });

    ws.on('close', () => {
        clients.delete(userId);
        console.log(`User disconnected: ${userId}`);
    });
});

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`WebSocket server running on port ${PORT}`);
});

const pool = require('../config/db');

const User = {
    async findByEmail(email) {
        const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        return res.rows[0];
    },

    
    async create(email, hashedPassword, name) {
        const res = await pool.query(
            'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name',
            [email, hashedPassword, name]
        );
        return res.rows[0];
    },

    async findById(id) {
        const res = await pool.query('SELECT id, email, name FROM users WHERE id = $1', [id]); // Also fetch name
        return res.rows[0];
    },

    async addSentEmail(userId, sender, recipients, subject, plain_body) {
        const res = await pool.query(
            'INSERT INTO sent_emails (user_id, sender, recipients, subject, plain_body, received_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *',
            [userId, sender, JSON.stringify(recipients), subject, plain_body]
        );
        return res.rows[0];
    },

    async addReceivedEmail(userId, sender, recipients, subject, plain_body) {
        const res = await pool.query(
            'INSERT INTO received_emails (user_id, sender, recipients, subject, plain_body, received_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *',
            [userId, sender, JSON.stringify(recipients), subject, plain_body]
        );
        return res.rows[0];
    },

    async getSentEmails(userId) {
        const res = await pool.query(
            'SELECT id, sender, recipients, subject, plain_body, received_at FROM sent_emails WHERE user_id = $1 ORDER BY received_at DESC',
            [userId]
        );
        return res.rows.map(row => ({
            ...row,
            recipients: row.recipients
        }));
    },

    async getReceivedEmails(userId) {
        const res = await pool.query(
            'SELECT id, sender, recipients, subject, plain_body, received_at FROM received_emails WHERE user_id = $1 ORDER BY received_at DESC',
            [userId]
        );
        return res.rows.map(row => ({
            ...row,
            recipients: row.recipients
        }));
    }
};

module.exports = User;
import db from './db.js';

// Saves a message from the contact form and returns its new id
const createContactMessage = async (name, email, message) => {
    const sql = `
        INSERT INTO contact_messages (name, email, message)
        VALUES ($1, $2, $3)
        RETURNING id`;
    const result = await db.query(sql, [name, email, message]);
    return result.rows[0].id;
};

export { createContactMessage };
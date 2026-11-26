import db from './db.js';

// true if an account already uses this email
const emailExists = async (email) => {
    const sql = 'SELECT EXISTS (SELECT 1 FROM users WHERE email = $1) AS taken';
    const result = await db.query(sql, [email]);
    return result.rows[0].taken;
};

// Saves a new account and returns its id. The password arrives already hashed.
// Everyone who registers is a client; the admin can change roles later.
const createUser = async (name, email, passwordHash) => {
    const sql = `
        INSERT INTO users (name, email, password_hash, role_id)
        VALUES ($1, $2, $3, (SELECT id FROM roles WHERE name = 'client'))
        RETURNING id`;
    const result = await db.query(sql, [name, email, passwordHash]);
    return result.rows[0].id;
};

export { emailExists, createUser };
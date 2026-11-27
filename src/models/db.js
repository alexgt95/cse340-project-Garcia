import { Pool } from 'pg';

// One shared pool of connections for the whole app.
// DB_URL comes from .env locally and from Render's settings in production.
const pool = new Pool({
    connectionString: process.env.DB_URL
});

// Runs several queries as one unit: if any of them fails, none is saved (ROLLBACK).
// All the queries must use the client it hands you, not the pool.
const transaction = async (work) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await work(client);
        await client.query('COMMIT');
        return result;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

export default pool;
export { transaction };
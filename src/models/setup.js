import db from './db.js';

// Asks the database for its current time: if this works, the connection works
const testConnection = async () => {
    const result = await db.query('SELECT NOW() AS now');
    console.log('Database connected:', result.rows[0].now);
};

export { testConnection };
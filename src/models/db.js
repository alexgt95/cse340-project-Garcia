import { Pool } from 'pg';

// One shared pool of connections for the whole app.
// DB_URL comes from .env locally and from Render's settings in production.
const pool = new Pool({
    connectionString: process.env.DB_URL
});

export default pool;
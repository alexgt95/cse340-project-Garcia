import { readFile } from 'fs/promises';
import db from './db.js';

// Reads a .sql file from src/models/sql/ and runs it
const runSqlFile = async (fileName) => {
    const sql = await readFile(new URL(`./sql/${fileName}`, import.meta.url), 'utf8');
    await db.query(sql);
};

// Creates missing tables on every start; adds sample data only to an empty database
const setupDatabase = async () => {
    await runSqlFile('schema.sql');

    const result = await db.query('SELECT COUNT(*)::int AS total FROM categories');
    if (result.rows[0].total === 0) {
        await runSqlFile('seed.sql');
        console.log('Database seeded with sample data');
    }

    console.log('Database ready');
};

export { setupDatabase };
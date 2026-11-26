import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import routes from './src/controllers/routes.js';
import { notFound, errorHandler } from './src/middleware/errors.js';
import { setupDatabase } from './src/models/setup.js';

// In ES Modules __dirname does not exist; we rebuild it
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NODE_ENV = process.env.NODE_ENV?.toLowerCase() || 'production';
const PORT = process.env.PORT || 3000;

const app = express();

// EJS renders the templates in src/views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));

// CSS, images and browser JS are served as-is from public/
app.use(express.static(path.join(__dirname, 'public')));

// Every page route lives in src/controllers/routes.js
app.use('/', routes);

// Error handling always goes last
app.use(notFound);
app.use(errorHandler);

// Create missing tables (and sample data) before accepting visitors
await setupDatabase();

app.listen(PORT, () => {
    console.log(`Server running on http://127.0.0.1:${PORT} (${NODE_ENV})`);
});

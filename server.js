import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

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

// Home page rendered on the server
app.get('/', (req, res) => {
    res.render('home', { title: 'Home' });
});

// 404: runs only when no route above answered the request
app.use((req, res, next) => {
    const err = new Error('Page Not Found');
    err.status = 404;
    next(err);
});

// Global error handler: Express recognizes it because it has 4 parameters
app.use((err, req, res, next) => {
    const status = err.status || 500;
    const isServerError = status >= 500;

    // Full details go to the terminal (and Render logs), never to the visitor
    if (isServerError) console.error(err.stack);

    res.status(status).render('errors/error', {
        title: isServerError ? 'Server Error' : err.message,
        status,
        message: isServerError
            ? 'Something went wrong on our end. Please try again later.'
            : 'Check the address or use the menu to keep browsing.',
        stack: NODE_ENV === 'development' && isServerError ? err.stack : null
    });
});


app.listen(PORT, () => {
    console.log(`Server running on http://127.0.0.1:${PORT} (${NODE_ENV})`);
});

// True only when .env says development; anything else (or nothing) counts as production
const isDevelopment = process.env.NODE_ENV?.toLowerCase() === 'development';

// 404: runs only when no route answered the request
const notFound = (req, res, next) => {
    const err = new Error('Page Not Found');
    err.status = 404;
    next(err);
};

// Global error handler: Express recognizes it because it has 4 parameters
const errorHandler = (err, req, res, next) => {
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
        stack: isDevelopment && isServerError ? err.stack : null
    });
};

export { notFound, errorHandler };

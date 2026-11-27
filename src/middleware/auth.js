// Route guards: put them in a route before the controller.
//   router.get('/account', requireLogin, showAccount);
//   router.get('/admin', requireRole('admin'), showDashboard);

// Lets the request through only if someone is logged in
const requireLogin = (req, res, next) => {
    if (req.session.user) {
        return next();
    }
    req.flash('error', 'Please log in to see that page.');
    res.redirect('/login');
};

// Lets the request through only if the user has one of these roles.
// requireRole('admin') or requireRole('admin', 'stylist')
const requireRole = (...roles) => [
    requireLogin,
    (req, res, next) => {
        if (roles.includes(req.session.user.role)) {
            return next();
        }
        // Logged in, but not allowed: 403 goes to the error page
        const err = new Error('Access Denied');
        err.status = 403;
        next(err);
    }
];

export { requireLogin, requireRole };
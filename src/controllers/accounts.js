import bcrypt from 'bcrypt';
import { validationResult, matchedData } from 'express-validator';
import { createUser, findUserByEmail } from '../models/users.js';

// GET /register
const showRegister = (req, res) => {
    res.render('register', { title: 'Create an Account', errors: {}, values: {} });
};

// POST /register   (registerRules already ran as middleware)
const processRegister = async (req, res) => {
    const result = validationResult(req);

    // Invalid: show the form again. Only name and email go back, never the passwords.
    if (!result.isEmpty()) {
        return res.status(400).render('register', {
            title: 'Create an Account',
            errors: result.mapped(),
            values: { name: req.body.name, email: req.body.email }
        });
    }

    const { name, email, password } = matchedData(req);

    // 10 = salt rounds: bcrypt repeats its work 2^10 times, so guessing is slow
    const passwordHash = await bcrypt.hash(password, 10);
    await createUser(name, email, passwordHash);

    req.flash('success', 'Your account was created! Please log in.');
    res.redirect('/login');
};

// GET /login
const showLogin = (req, res) => {
    res.render('login', { title: 'Log In', error: null, email: '' });
};

// POST /login   (loginRules already ran as middleware)
const processLogin = async (req, res, next) => {
    const result = validationResult(req);
    const { email, password } = matchedData(req);

    // Look the account up only if the form is valid, then compare the password with the saved hash
    const user = result.isEmpty() ? await findUserByEmail(email) : undefined;
    const passwordOk = user ? await bcrypt.compare(password, user.password_hash) : false;

    // One message for every failure, so nobody can find out which emails have an account
    if (!passwordOk) {
        return res.status(401).render('login', {
            title: 'Log In',
            error: 'Invalid email or password.',
            email: req.body.email
        });
    }

    // New session id on login: an id someone planted before can't be reused (session fixation)
    req.session.regenerate((err) => {
        if (err) return next(err);

        // Save only what the pages need. Never the password hash.
        req.session.user = { id: user.id, name: user.name, email: user.email, role: user.role };
        req.flash('success', `Welcome back, ${user.name}!`);
        res.redirect('/');
    });
};

// GET /logout: delete the session in the database and the cookie in the browser
const processLogout = (req, res, next) => {
    req.session.destroy((err) => {
        if (err) return next(err);
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
};

export { showRegister, processRegister, showLogin, processLogin, processLogout };
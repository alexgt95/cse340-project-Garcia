import bcrypt from 'bcrypt';
import { validationResult, matchedData } from 'express-validator';
import { createUser } from '../models/users.js';

// GET /register   (?created=1 after a successful sign-up)
const showRegister = (req, res) => {
    res.render('register', {
        title: 'Create an Account',
        errors: {},
        values: {},
        created: req.query.created === '1'
    });
};

// POST /register   (registerRules already ran as middleware)
const processRegister = async (req, res) => {
    const result = validationResult(req);

    // Invalid: show the form again. Only name and email go back, never the passwords.
    if (!result.isEmpty()) {
        return res.status(400).render('register', {
            title: 'Create an Account',
            errors: result.mapped(),
            values: { name: req.body.name, email: req.body.email },
            created: false
        });
    }

    const { name, email, password } = matchedData(req);

    // 10 = salt rounds: bcrypt repeats its work 2^10 times, so guessing is slow
    const passwordHash = await bcrypt.hash(password, 10);
    await createUser(name, email, passwordHash);

    res.redirect('/register?created=1');
};

export { showRegister, processRegister };
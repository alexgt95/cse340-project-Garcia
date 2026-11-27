import { body } from 'express-validator';
import { emailExists } from '../../models/users.js';

// Rules for the contact form. Sanitizers (trim, toLowerCase) clean the value first;
// validators (notEmpty, isEmail, isLength) then check it. Each failure adds a message.
const contactRules = [
    body('name')
        .trim()
        .notEmpty().withMessage('Please enter your name.').bail()
        .isLength({ max: 100 }).withMessage('Name must be 100 characters or fewer.'),
    body('email')
        .trim()
        .toLowerCase()
        .notEmpty().withMessage('Please enter your email.').bail()
        .isEmail().withMessage('Please enter a valid email address.').bail()
        .isLength({ max: 255 }).withMessage('Email must be 255 characters or fewer.'),
    body('message')
        .trim()
        .isLength({ min: 10, max: 2000 }).withMessage('Message must be between 10 and 2000 characters.')
];

// Rules for the registration form
const registerRules = [
    body('name')
        .trim()
        .notEmpty().withMessage('Please enter your name.').bail()
        .isLength({ max: 100 }).withMessage('Name must be 100 characters or fewer.'),
    body('email')
        .trim()
        .toLowerCase()
        .notEmpty().withMessage('Please enter your email.').bail()
        .isEmail().withMessage('Please enter a valid email address.').bail()
        .isLength({ max: 255 }).withMessage('Email must be 255 characters or fewer.').bail()
        .custom(async (email) => {
            if (await emailExists(email)) {
                throw new Error('An account with this email already exists.');
            }
        }),
    // No trim() on passwords: spaces are allowed and must stay exactly as typed
    body('password')
        .isStrongPassword()
        .withMessage('Password needs at least 8 characters, with an uppercase letter, a lowercase letter, a number and a symbol.').bail()
        .isLength({ max: 72 }).withMessage('Password must be 72 characters or fewer.'),
    body('passwordConfirm')
        .custom((value, { req }) => value === req.body.password)
        .withMessage('Passwords do not match.')
];

// Rules for the login form. No password strength check here: just "is it there?"
const loginRules = [
    body('email')
        .trim()
        .toLowerCase()
        .isEmail().withMessage('Please enter a valid email address.'),
    body('password')
        .notEmpty().withMessage('Please enter your password.')
];

export { contactRules, registerRules, loginRules };
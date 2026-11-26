import { body } from 'express-validator';

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

export { contactRules };
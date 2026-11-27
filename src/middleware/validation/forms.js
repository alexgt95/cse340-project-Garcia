import { body } from 'express-validator';
import { emailExists } from '../../models/users.js';
import { getCategories, listServiceImages } from '../../models/services.js';

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

// Rules for the admin service form (create and edit).
// Field names match the database columns, so matchedData(req) is ready to save.
const serviceRules = [
    body('name')
        .trim()
        .notEmpty().withMessage('Please enter a name.').bail()
        .isLength({ max: 100 }).withMessage('Name must be 100 characters or fewer.').bail()
        .matches(/[a-z0-9]/i).withMessage('Name must include letters or numbers.'),
    body('category_id')
        .toInt()
        .custom(async (id) => {
            const categories = await getCategories();
            if (!categories.some((category) => category.id === id)) {
                throw new Error('Please choose a category.');
            }
        }),
    body('description')
        .trim()
        .isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters.'),
    body('duration_minutes')
        .isInt({ min: 5, max: 600 }).withMessage('Duration must be a whole number from 5 to 600 minutes.')
        .toInt(),
    body('image_url')
        .custom(async (url) => {
            const images = await listServiceImages();
            if (!images.includes(url)) {
                throw new Error('Please choose an image from the list.');
            }
        }),
    body(['price_short', 'price_mid', 'price_long'])
        .isFloat({ min: 0, max: 99999.99 }).withMessage('Enter a price from 0 to 99999.99.')
        .toFloat(),
    // Checkbox: browsers send nothing when it's unchecked, and toBoolean turns that into false
    body('is_active').toBoolean()
];

// Rules for the admin category forms (add and rename)
const categoryRules = [
    body('name')
        .trim()
        .notEmpty().withMessage('Please enter a category name.').bail()
        .isLength({ max: 50 }).withMessage('Category names must be 50 characters or fewer.').bail()
        .matches(/[a-z0-9]/i).withMessage('Category names must include letters or numbers.')
];

export { contactRules, registerRules, loginRules, serviceRules, categoryRules };
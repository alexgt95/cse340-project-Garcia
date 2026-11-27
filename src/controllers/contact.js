import { validationResult, matchedData } from 'express-validator';
import { createContactMessage } from '../models/contact.js';

// GET /contact
const showContact = (req, res) => {
    res.render('contact', {
        title: 'Contact Us',
        errors: {},
        values: {}
    });
};

// POST /contact   (contactRules already ran as middleware)
const processContact = async (req, res) => {
    const result = validationResult(req);

    // Invalid: show the form again with the messages and what the visitor typed
    if (!result.isEmpty()) {
        return res.status(400).render('contact', {
            title: 'Contact Us',
            errors: result.mapped(),
            values: req.body
        });
    }

    // Valid: matchedData returns only the fields that have rules, already cleaned
    const { name, email, message } = matchedData(req);
    await createContactMessage(name, email, message);

    // Post/Redirect/Get: refreshing the next page won't send the message twice
    req.flash('success', 'Thank you! We received your message and will reply soon.');
    res.redirect('/contact');
};

export { showContact, processContact };
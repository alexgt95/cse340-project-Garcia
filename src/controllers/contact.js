import { validationResult, matchedData } from 'express-validator';
import { createContactMessage } from '../models/contact.js';

// GET /contact   (?sent=1 after a successful submission)
const showContact = (req, res) => {
    res.render('contact', {
        title: 'Contact Us',
        errors: {},
        values: {},
        sent: req.query.sent === '1'
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
            values: req.body,
            sent: false
        });
    }

    // Valid: matchedData returns only the fields that have rules, already cleaned
    const { name, email, message } = matchedData(req);
    await createContactMessage(name, email, message);

    // Post/Redirect/Get: refreshing the next page won't send the message twice
    res.redirect('/contact?sent=1');
};

export { showContact, processContact };
import { Router } from 'express';
import { showHome } from './home.js';
import { showServices, showServiceDetail } from './services.js';
import { showBooking } from './appointments.js';
import { showContact, processContact } from './contact.js';
import { contactRules } from '../middleware/validation/forms.js';

const router = Router();

// Public pages
router.get('/', showHome);
router.get('/services', showServices);
router.get('/services/:slug', showServiceDetail);
router.get('/book', showBooking);

// Contact form
router.get('/contact', showContact);
router.post('/contact', contactRules, processContact);

export default router;

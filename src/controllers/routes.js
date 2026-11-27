import { Router } from 'express';
import { showHome } from './home.js';
import { showServices, showServiceDetail } from './services.js';
import { showBooking } from './appointments.js';
import { showContact, processContact } from './contact.js';
import { showRegister, processRegister, showLogin, processLogin, processLogout } from './accounts.js';
import { contactRules, registerRules, loginRules } from '../middleware/validation/forms.js';

const router = Router();

// Public pages
router.get('/', showHome);
router.get('/services', showServices);
router.get('/services/:slug', showServiceDetail);
router.get('/book', showBooking);

// Contact form
router.get('/contact', showContact);
router.post('/contact', contactRules, processContact);

// Accounts
router.get('/register', showRegister);
router.post('/register', registerRules, processRegister);
router.get('/login', showLogin);
router.post('/login', loginRules, processLogin);
router.get('/logout', processLogout);

export default router;

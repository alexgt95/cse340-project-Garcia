import { Router } from 'express';
import { showHome } from './home.js';
import { showServices, showServiceDetail } from './services.js';
import { showBooking } from './appointments.js';
import { showContact, processContact } from './contact.js';
import { showRegister, processRegister, showLogin, processLogin, processLogout, showAccount } from './accounts.js';
import {
    showDashboard,
    showAdminServices, showNewService, processNewService,
    showEditService, processEditService, processDeleteService,
    showAdminCategories, processNewCategory, processEditCategory, processDeleteCategory
} from './admin.js';
import { requireLogin, requireRole } from '../middleware/auth.js';
import {
    contactRules, registerRules, loginRules, serviceRules, categoryRules
} from '../middleware/validation/forms.js';

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
router.get('/account', requireLogin, showAccount);

// Admin only: one sub-router, guarded once, mounted at /admin
const admin = Router();
admin.use(requireRole('admin'));

// :id must be a whole number; anything else ("abc") skips to the 404 page
admin.param('id', (req, res, next, id) => (/^\d{1,9}$/.test(id) ? next() : next('route')));

admin.get('/', showDashboard);

admin.get('/services', showAdminServices);
admin.get('/services/new', showNewService);
admin.post('/services', serviceRules, processNewService);
admin.get('/services/:id/edit', showEditService);
admin.post('/services/:id', serviceRules, processEditService);
admin.post('/services/:id/delete', processDeleteService);

admin.get('/categories', showAdminCategories);
admin.post('/categories', categoryRules, processNewCategory);
admin.post('/categories/:id', categoryRules, processEditCategory);
admin.post('/categories/:id/delete', processDeleteCategory);

router.use('/admin', admin);

export default router;
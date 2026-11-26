import { Router } from 'express';
import { showHome } from './home.js';
import { showServices, showServiceDetail } from './services.js';
import { showBooking } from './appointments.js';

const router = Router();

// Public pages
router.get('/', showHome);
router.get('/services', showServices);
router.get('/services/:slug', showServiceDetail);
router.get('/book', showBooking);

export default router;

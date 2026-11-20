import { Router } from 'express';
import { showHome } from './home.js';
import { showServices } from './services.js';
import { showBooking } from './appointments.js';

const router = Router();

// Public pages
router.get('/', showHome);
router.get('/services', showServices);
router.get('/book', showBooking);

export default router;

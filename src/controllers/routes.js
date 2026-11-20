 import { Router } from 'express';
import { showHome } from './home.js';

const router = Router();

// Public pages
router.get('/', showHome);

export default router;

import { Router } from 'express';
import { parse } from '../controllers/aisearch.controller.js';

const router = Router();

router.post('/parse', parse);

export default router;

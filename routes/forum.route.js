import express from 'express';

import { getForums } from '../controllers/forum.controller.js';

const router = express.Router();

router.get('/list', getForums);
export default router;

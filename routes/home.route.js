import express from 'express';

import { getContent } from '../controllers/home.controller.js';

const router = express.Router();

router.get('/content', getContent);

export default router;

import express from 'express';

import { getUser } from '../controllers/user.controller.js';

import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', protect, getUser);

export default router;

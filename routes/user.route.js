import express from 'express';

import { getUser, getUserProfile } from '../controllers/user.controller.js';

import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', protect, getUser).get('/:userId', getUserProfile);

export default router;

import express from 'express';

import { getForums, newDiscussion } from '../controllers/forum.controller.js';

import { protect } from '../middlewares/auth.middleware.js';

import { newDiscussionValidator } from '../validators/forum.validator.js';

const router = express.Router();

router.get('/list', getForums).post('/discussion', protect, newDiscussionValidator, newDiscussion);

export default router;

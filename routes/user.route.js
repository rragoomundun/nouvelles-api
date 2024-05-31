import express from 'express';

import { getUser, getUserProfile, getUserArticles } from '../controllers/user.controller.js';

import { getUserArticlesValidator } from '../validators/user.validator.js';

import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router
  .get('/', protect, getUser)
  .get('/:userId', getUserProfile)
  .get('/:userId/article/all', getUserArticlesValidator, getUserArticles);

export default router;

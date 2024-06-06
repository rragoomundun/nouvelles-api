import express from 'express';

import {
  getUser,
  getUserProfile,
  getUserArticles,
  getUserDiscussions,
  getUserMessages,
  updateUserImage
} from '../controllers/user.controller.js';

import {
  getUserArticlesValidator,
  getUserDiscussionsValidator,
  getUserMessagesValidator,
  updateUserImageValidator
} from '../validators/user.validator.js';

import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router
  .get('/', protect, getUser)
  .get('/:userId', getUserProfile)
  .get('/:userId/article/all', getUserArticlesValidator, getUserArticles)
  .get('/:userId/discussion/all', getUserDiscussionsValidator, getUserDiscussions)
  .get('/:userId/message/all', getUserMessagesValidator, getUserMessages)
  .put('/:userId/image', protect, updateUserImageValidator, updateUserImage);

export default router;

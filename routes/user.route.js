import express from 'express';

import {
  getUser,
  getUserProfile,
  getUserArticles,
  getUserDiscussions,
  getUserMessages,
  updateUserImage,
  updateUserPassword,
  updateUserBiography
} from '../controllers/user.controller.js';

import {
  getUserArticlesValidator,
  getUserDiscussionsValidator,
  getUserMessagesValidator,
  updateUserImageValidator,
  updateUserPasswordValidator,
  updateUserBiographyValidator
} from '../validators/user.validator.js';

import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router
  .get('/', protect, getUser)
  .get('/:userId', getUserProfile)
  .get('/:userId/article/all', getUserArticlesValidator, getUserArticles)
  .get('/:userId/discussion/all', getUserDiscussionsValidator, getUserDiscussions)
  .get('/:userId/message/all', getUserMessagesValidator, getUserMessages)
  .put('/:userId/image', protect, updateUserImageValidator, updateUserImage)
  .put('/:userId/password', protect, updateUserPasswordValidator, updateUserPassword)
  .put('/:userId/biography', protect, updateUserBiographyValidator, updateUserBiography);

export default router;

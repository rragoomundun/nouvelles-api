import express from 'express';

import { getForums, newDiscussion, answerDiscussion, editMessage } from '../controllers/forum.controller.js';

import {
  newDiscussionValidator,
  answerDiscussionValidator,
  editMessageValidator
} from '../validators/forum.validator.js';

import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router
  .get('/list', getForums)
  .post('/discussion', protect, newDiscussionValidator, newDiscussion)
  .post('/discussion/:id', protect, answerDiscussionValidator, answerDiscussion)
  .put('/discussion/:discussionId/message/:messageId', protect, editMessageValidator, editMessage);

export default router;

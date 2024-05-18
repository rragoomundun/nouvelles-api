import express from 'express';

import {
  getForums,
  getDiscussions,
  getMessagesInDiscussion,
  newDiscussion,
  answerDiscussion,
  editMessage,
  likeMessage,
  dislikeMessage,
  deleteVote
} from '../controllers/forum.controller.js';

import {
  getDiscussionsValidator,
  getMessagesInDiscussionValidator,
  newDiscussionValidator,
  answerDiscussionValidator,
  editMessageValidator
} from '../validators/forum.validator.js';

import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router
  .get('/list', getForums)
  .get('/:forum/discussions', getDiscussionsValidator, getDiscussions)
  .get('/discussion/:discussionId/messages', getMessagesInDiscussionValidator, getMessagesInDiscussion)
  .post('/discussion', protect, newDiscussionValidator, newDiscussion)
  .post('/discussion/:id', protect, answerDiscussionValidator, answerDiscussion)
  .put('/discussion/:discussionId/message/:messageId', protect, editMessageValidator, editMessage)
  .put('/discussion/:discussionId/message/:messageId/like', protect, likeMessage)
  .put('/discussion/:discussionId/message/:messageId/dislike', protect, dislikeMessage)
  .delete('/discussion/:discussionId/message/:messageId/delete-vote', protect, deleteVote);

export default router;

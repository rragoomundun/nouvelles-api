import express from 'express';

import {
  getForums,
  getForumMeta,
  getDiscussions,
  getDiscussionMeta,
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
  getForumMetaValidator,
  getDiscussionMetaValidator,
  getMessagesInDiscussionValidator,
  newDiscussionValidator,
  answerDiscussionValidator,
  editMessageValidator
} from '../validators/forum.validator.js';

import { protect, setUser } from '../middlewares/auth.middleware.js';

const router = express.Router();

router
  .get('/list', getForums)
  .get('/:forum/meta', getForumMetaValidator, getForumMeta)
  .get('/:forum/discussions', getDiscussionsValidator, getDiscussions)
  .get('/:forum/discussion/:discussionId/meta', getDiscussionMetaValidator, getDiscussionMeta)
  .get('/discussion/:discussionId/messages', setUser, getMessagesInDiscussionValidator, getMessagesInDiscussion)
  .post('/discussion', protect, newDiscussionValidator, newDiscussion)
  .post('/discussion/:id', protect, answerDiscussionValidator, answerDiscussion)
  .put('/discussion/:discussionId/message/:messageId', protect, editMessageValidator, editMessage)
  .put('/discussion/:discussionId/message/:messageId/like', protect, likeMessage)
  .put('/discussion/:discussionId/message/:messageId/dislike', protect, dislikeMessage)
  .delete('/discussion/:discussionId/message/:messageId/delete-vote', protect, deleteVote);

export default router;

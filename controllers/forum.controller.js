import httpStatus from 'http-status-codes';
import { Sequelize } from 'sequelize';

import asyncHandler from '../middlewares/async.middleware.js';

import ErrorResponse from '../classes/errorResponse.class.js';

import dbUtil from '../utils/db.util.js';
import validatorUtil from '../utils/validator.util.js';

const DISCUSSIONS_PAGE_LIMIT = 20;

/**
 * @api {GET} /forum/list List All Forums
 * @apiGroup Forum
 * @apiName ForumList
 *
 * @apiDescription Get the list of forums.
 *
 * @apiSuccess (Success (200)) {Number} id The forum id
 * @apiSuccess (Success (200)) {String} label The forum label
 * @apiSuccess (Success (200)) {String} name The forum name
 * @apiSuccess (Success (200)) {Number} nbDiscussions The number of discussions in the forum
 * @apiSuccess (Success (200)) {Number} nbMessages The number of messages in the forum
 *
 * @apiSuccessExample Success Example
 * [
 *   {
 *     "id": 1,
 *     "label": "general",
 *     "name": "Général",
 *     "nbDiscussions": 12,
 *     "nbMessages": 53
 *   },
 *   {
 *     "id": 2,
 *     "label": "politique",
 *     "name": "Politique",
 *     "nbDiscussions": 42,
 *     "nbMessages": 206
 *   },
 *   {
 *     "id": 3,
 *     "label": "science",
 *     "name": "Science",
 *     "nbDiscussions": 30,
 *     "nbMessages": 83
 *   }
 * ]
 *
 * @apiPermission Public
 */
const getForums = asyncHandler(async (req, res, next) => {
  let forums = await dbUtil.Forum.findAll({
    attributes: [
      'id',
      'label',
      'name',
      [Sequelize.literal('COUNT(DISTINCT "Discussions"."id")'), 'nbDiscussions'],
      [Sequelize.literal('COUNT(DISTINCT "Discussions->Messages"."id")'), 'nbMessages']
    ],
    include: {
      model: dbUtil.Discussion,
      attributes: [],
      include: {
        model: dbUtil.Message,
        attributes: []
      }
    },
    group: ['Forum.id'],
    order: ['id'],
    raw: true
  });

  res.status(httpStatus.OK).json(forums);
});

/**
 * @api {GET} /forum/:forum/meta Get Forum Meta
 * @apiGroup Forum
 * @apiName ForumGetMeta
 *
 * @apiDescription Get meta information of a forum.
 *
 * @apiParam {String} forum The forum label
 *
 * @apiSuccess (Success (200)) {Number} nbPages The number of pages in a forum
 *
 * @apiSuccessExample Success Example
 * {
 *   "nbPages": 4
 * }
 *
 * @apiError (Error (400)) FORUM_INCORRECT The forum is incorrect
 *
 * @apiPermission Public
 */
const getForumMeta = asyncHandler(async (req, res, next) => {
  const validationError = validatorUtil.validate(req);

  if (validationError) {
    return next(validationError);
  }

  const { forum } = req.params;

  const forumId = (await dbUtil.Forum.findOne({ where: { label: forum }, raw: true })).id;
  const totalDiscussions = await dbUtil.Discussion.count({
    where: {
      forum_id: forumId
    }
  });
  const nbPages = Math.ceil(totalDiscussions / DISCUSSIONS_PAGE_LIMIT);

  res.status(httpStatus.OK).json({ nbPages });
});

/**
 * @api {GET} /forum/:forum/discussions Get Discussions
 * @apiGroup Forum
 * @apiName ForumGetDiscussions
 *
 * @apiDescription Get discussions in a forum.
 *
 * @apiParam {String} forum The forum label
 * @apiQuery {Number} [page] The page
 *
 * @apiSuccess (Success (200)) {Number} id The discussion id
 * @apiSuccess (Success (200)) {String} name The name of the discussion
 * @apiSuccess (Success (200)) {Boolean} open The open status of the discussion
 * @apiSuccess (Success (200)) {Number} nbMessages The number of messages in the discussion
 * @apiSuccess (Success (200)) {Date} firstMessageDate The date of the first message
 * @apiSuccess (Success (200)) {Date} lastMessageDate The date of the last message
 * @apiSuccess (Success (200)) {Object} author The author of the original post
 *
 * @apiSuccessExample Success Example
 * [
 *   {
 *     "id": 6,
 *     "name": "L'impact de la globalisation",
 *     "open": true,
 *     "nbMessages": "22",
 *     "firstMessageDate": "2024-05-14T17:00:15.647Z",
 *     "lastMessageDate": "2024-05-18T10:39:49.856Z",
 *     "author": {
 *       "id": 2,
 *       "name": "Raphael",
 *       "image": null
 *     }
 *   }
 * ]
 *
 * @apiError (Error (400)) FORUM_INCORRECT The forum is incorrect
 *
 * @apiPermission Public
 */
const getDiscussions = asyncHandler(async (req, res, next) => {
  const validationError = validatorUtil.validate(req);

  if (validationError) {
    return next(validationError);
  }

  const { forum } = req.params;
  let page, offset;

  if (req.query.page) {
    page = req.query.page - 1;
  } else {
    page = 0;
  }

  offset = page * DISCUSSIONS_PAGE_LIMIT;

  const forumId = (await dbUtil.Forum.findOne({ where: { label: forum }, raw: true })).id;
  const discussions = (
    await dbUtil.Discussion.findAll({
      attributes: ['id', 'name', 'open'],
      include: [
        {
          model: dbUtil.Message,
          attributes: [
            [Sequelize.fn('MIN', Sequelize.col('date')), 'first_message_date'],
            [Sequelize.fn('MAX', Sequelize.col('date')), 'last_message_date'],
            [Sequelize.fn('COUNT', Sequelize.col('date')), 'nb_messages']
          ],
          required: true
        },
        {
          model: dbUtil.User,
          required: true
        }
      ],
      where: {
        forum_id: forumId
      },
      group: ['Discussion.id', 'User.id'],
      order: [[Sequelize.fn('MAX', Sequelize.col('date')), 'DESC']],
      limit: DISCUSSIONS_PAGE_LIMIT,
      offset,
      raw: true,
      subQuery: false
    })
  ).map((discussion) => {
    return {
      id: discussion.id,
      name: discussion.name,
      open: discussion.open,
      nbMessages: discussion['Messages.nb_messages'],
      firstMessageDate: discussion['Messages.first_message_date'],
      lastMessageDate: discussion['Messages.last_message_date'],
      author: {
        id: discussion['User.id'],
        name: discussion['User.name'],
        image: discussion['User.image']
      }
    };
  });

  res.status(httpStatus.OK).json(discussions);
});

/**
 * @api {GET} /forum/discussion/:discussionId/messages Get Discussion Messages
 * @apiGroup Forum
 * @apiName ForumGetDiscussionsMessages
 *
 * @apiDescription Get messages in a discussion.
 *
 * @apiParam {Number} discussionId The discussion id
 * @apiQuery {Number} [page] The page
 *
 * @apiSuccess (Success (200)) {Number} id The message id
 * @apiSuccess (Success (200)) {String} content The message content
 * @apiSuccess (Success (200)) {Date} date The posted date
 * @apiSuccess (Success (200)) {Date} updated_date The updated date of the message
 * @apiSuccess (Success (200)) {Object} author The author of the message
 * @apiSuccess (Success (200)) {Number} nbLikes The number of likes
 * @apiSuccess (Success (200)) {Number} nbDislikes The number of dislikes
 *
 * @apiSuccessExample Success Example
 * [
 *   {
 *     "id": 2,
 *     "content": "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
 *     "date": "2024-05-14T17:00:15.647Z",
 *     "updated_date": null,
 *     "author": {
 *       "id": 2,
 *       "name": "Elliot",
 *       "image": null
 *     },
 *     "nbLikes": 1,
 *     "nbDislikes": 1
 *   }
 * ]
 *
 * @apiError (Error (400)) DISCUSSION_INCORRECT The discussion is incorrect
 *
 * @apiPermission Public
 */
const getMessagesInDiscussion = asyncHandler(async (req, res, next) => {
  const validationError = validatorUtil.validate(req);

  if (validationError) {
    return next(validationError);
  }

  const PAGE_LIMIT = 20;

  const { discussionId } = req.params;
  let page, offset;

  if (req.query.page) {
    page = req.query.page - 1;
  } else {
    page = 0;
  }

  offset = page * PAGE_LIMIT;

  const messages = (
    await dbUtil.Message.findAll({
      attributes: ['id', 'content', 'date', 'updated_date'],
      include: [
        {
          model: dbUtil.User,
          attributes: ['id', 'name', 'image'],
          required: true
        },
        {
          model: dbUtil.MessageLike,
          attributes: ['like']
        }
      ],
      where: {
        discussion_id: discussionId
      },
      order: ['date'],
      limit: PAGE_LIMIT,
      offset
    })
  ).map((message) => {
    const formattedMessage = {
      id: message.id,
      content: message.content,
      date: message.date,
      updated_date: message.updated_date,
      author: message.User,
      nbLikes: 0,
      nbDislikes: 0
    };

    if (message.MessageLikes.length) {
      for (const messageLike of message.MessageLikes) {
        if (messageLike.dataValues.like === 'like') {
          formattedMessage.nbLikes++;
        } else {
          formattedMessage.nbDislikes++;
        }
      }
    }

    return formattedMessage;
  });

  res.status(httpStatus.OK).json(messages);
});

/**
 * @api {POST} /forum/discussion New Discussion
 * @apiGroup Forum
 * @apiName ForumNewDiscussion
 *
 * @apiDescription Create a new discussion.
 *
 * @apiBody {String} name The discussion name
 * @apiBody {String} message The discussion first message
 * @apiBody {String} forum The forum of the discussion
 *
 * @apiParamExample {json} Body Example
 * {
 *   "name": "The impact of globalization",
 *   "message": "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
 *   "forum": "politique"
 * }
 *
 * @apiSuccess (Success (200)) {Number} id The discussion id
 * @apiSuccess (Success (200)) {String} name The discussion name
 *
 * @apiSuccessExample Success Example
 * {
 *   "id": 28,
 *   "name": "The impact of globalization"
 * }
 *
 * @apiError (Error (400)) NO_NAME There is no name for the discussion
 * @apiError (Error (400)) NAME_IS_USE A discussion with this name already exists
 * @apiError (Error (400)) NO_MESSAGE There is no message
 * @apiError (Error (400)) NO_FORUM There is no forum
 * @apiError (Error (400)) FORUM_INCORRECT The specified forum is incorrect
 *
 * @apiPermission Private
 */
const newDiscussion = asyncHandler(async (req, res, next) => {
  const validationError = validatorUtil.validate(req);

  if (validationError) {
    return next(validationError);
  }

  const { name, message, forum } = req.body;

  let result;

  try {
    result = await dbUtil.sequelize.transaction(async (transaction) => {
      const forumData = await dbUtil.Forum.findOne({ where: { label: forum }, raw: true }, { transaction });
      const discussion = await dbUtil.Discussion.create(
        { name, forum_id: forumData.id, user_id: req.user.id },
        { transaction }
      );
      await dbUtil.Message.create(
        { content: message, discussion_id: discussion.dataValues.id, user_id: req.user.id },
        { transaction }
      );

      return { id: discussion.dataValues.id, name };
    });
  } catch {
    return next(new ErrorResponse('Cannot create discussion', httpStatus.INTERNAL_SERVER_ERROR));
  }

  res.status(httpStatus.CREATED).json(result);
});

/**
 * @api {POST} /forum/discussion/:id Answer Discussion
 * @apiGroup Forum
 * @apiName ForumAnswerDiscussion
 *
 * @apiDescription Answer to a discussion.
 *
 * @apiParam {Number} id The discussion id
 *
 * @apiBody {String} message The new message
 *
 * @apiParamExample {json} Body Example
 * {
 *   "message": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
 * }
 *
 * @apiError (Error (400)) DISCUSSION_INCORRECT The discussion id is incorrect
 * @apiError (Error (400)) DISCUSSION_CLOSED The discussion is closed to new answers
 * @apiError (Error (400)) NO_MESSAGE There is no message
 *
 * @apiPermission Private
 */
const answerDiscussion = asyncHandler(async (req, res, next) => {
  const validationError = validatorUtil.validate(req);

  if (validationError) {
    return next(validationError);
  }

  const { id } = req.params;
  const { message } = req.body;
  const discussion = await dbUtil.Discussion.findOne({ where: { id }, raw: true });

  if (discussion.open === false) {
    return next(new ErrorResponse('Discussion is closed to new answers', httpStatus.BAD_REQUEST, 'DISCUSSION_CLOSED'));
  }

  await dbUtil.Message.create({ content: message, discussion_id: discussion.id, user_id: req.user.id });
  res.status(httpStatus.CREATED).end();
});

/**
 * @api {PUT} /forum/discussion/:discussionId/message/:messageId Edit Message
 * @apiGroup Forum
 * @apiName ForumEditMessage
 *
 * @apiParam {Number} discussionId The discussion id
 * @apiParam {Number} messageId The message id
 *
 * @apiBody {String} message The edited message
 *
 * @apiParamExample {json} Body Examle
 * {
 *   "message": "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
 * }
 *
 * @apiError (Error (400)) DISCUSSION_INCORRECT The discussion id is incorrect
 * @apiError (Error (400)) MESSAGE_INCORRECT The message id is incorrect
 * @apiError (Error (400)) MESSAGE_NOT_OWNER The user isn't the owner of the message
 * @apiError (Error (400)) NO_MESSAGE There is no message
 *
 * @apiPermission Private
 */
const editMessage = asyncHandler(async (req, res, next) => {
  const validationError = validatorUtil.validate(req);

  if (validationError) {
    return next(validationError);
  }

  const { messageId } = req.params;
  const messageInstance = await dbUtil.Message.findOne({ where: { id: messageId }, raw: true });

  if (messageInstance.user_id !== req.user.id) {
    return next(
      new ErrorResponse('The user is not the owner of the message', httpStatus.BAD_REQUEST, 'MESSAGE_NOT_OWNER')
    );
  }

  const { message } = req.body;

  await dbUtil.Message.update({ content: message, updated_date: Date.now() }, { where: { id: messageId } });
  res.status(httpStatus.OK).end();
});

/**
 * @api {PUT} /forum/discussion/:discussionId/message/:messageId/like Like Message
 * @apiGroup Forum
 * @apiName ForumLikeMessage
 *
 * @apiParam {Number} discussionId The discussion id
 * @apiParam {Number} messageId The message id
 *
 * @apiDescription Like a message.
 *
 * @apiPermission Private
 */
const likeMessage = asyncHandler(async (req, res, next) => {
  const { messageId } = req.params;
  const messageLike = await dbUtil.MessageLike.findOne({ where: { message_id: messageId, user_id: req.user.id } });

  if (messageLike) {
    messageLike.like = 'like';
    await messageLike.save();
  } else {
    await dbUtil.MessageLike.create({ message_id: messageId, user_id: req.user.id, like: 'like' });
  }

  res.status(httpStatus.OK).end();
});

/**
 * @api {PUT} /forum/discussion/:discussionId/message/:messageId/dislike Dislike Message
 * @apiGroup Forum
 * @apiName ForumDislikeMessage
 *
 * @apiParam {Number} discussionId The discussion id
 * @apiParam {Number} messageId The message id
 *
 * @apiDescription Dislike a message.
 *
 * @apiPermission Private
 */
const dislikeMessage = asyncHandler(async (req, res, next) => {
  const { messageId } = req.params;
  const messageLike = await dbUtil.MessageLike.findOne({ where: { message_id: messageId, user_id: req.user.id } });

  if (messageLike) {
    messageLike.like = 'dislike';
    await messageLike.save();
  } else {
    await dbUtil.MessageLike.create({ message_id: messageId, user_id: req.user.id, like: 'dislike' });
  }

  res.status(httpStatus.OK).end();
});

/**
 * @api {DELETE} /forum/discussion/:discussionId/message/:messageId/delete-vote Delete Vote
 * @apiGroup Forum
 * @apiName ForumDeleteVote
 *
 * @apiParam {Number} discussionId The discussion id
 * @apiParam {Number} messageId The message id
 *
 * @apiDescription Delete a message vote.
 *
 * @apiPermission Private
 */
const deleteVote = asyncHandler(async (req, res, next) => {
  const { messageId } = req.params;

  await dbUtil.MessageLike.destroy({ where: { message_id: messageId, user_id: req.user.id } });

  res.status(httpStatus.OK).end();
});

export {
  getForums,
  getForumMeta,
  getDiscussions,
  getMessagesInDiscussion,
  newDiscussion,
  answerDiscussion,
  editMessage,
  likeMessage,
  dislikeMessage,
  deleteVote
};

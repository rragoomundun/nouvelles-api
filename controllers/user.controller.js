import httpStatus from 'http-status-codes';
import { Sequelize, Op } from 'sequelize';

import asyncHandler from '../middlewares/async.middleware.js';

import ErrorResponse from '../classes/errorResponse.class.js';

import dbUtil from '../utils/db.util.js';
import validatorUtil from '../utils/validator.util.js';

const PAGE_LIMIT = 20;

/**
 * @api {GET} /user Get Current User
 * @apiGroup User
 * @apiName UserGetCurrent
 *
 * @apiDescription Get the current user if authorized
 *
 * @apiSuccess (Success (200)) {Number} id The user's id
 * @apiSuccess (Success (200)) {String} name The user's name
 * @apiSuccess (Success (200)) {String} email The user's email address
 * @apiSuccess (Success (200)) {String} image The user's profile image
 * @apiSuccess (Success (200)) {String} biography The user's biography
 * @apiSuccess (Success (200)) {String[]} roles The user's roles
 *
 * @apiSuccessExample Success Example
 * {
 *   "id": 2,
 *   "name": "Thomas"
 *   "email": "thomas.hugo@remail.com",
 *   "image": "https://img.r3tests.net/users/2/profile-picture.png",
 *   "biography": null,
 *   "roles": ["regular"]
 * }
 *
 * @apiPermission Private
 */
const getUser = asyncHandler(async (req, res, next) => {
  const userData = await dbUtil.User.findOne({
    include: [
      {
        model: dbUtil.Role,
        required: true
      }
    ],
    where: { id: req.user.id }
  });
  const user = {
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    image: userData.image,
    biography: userData.biography,
    roles: userData.Roles.map((role) => role.dataValues.label)
  };

  res.status(httpStatus.OK).json(user);
});

/**
 * @api {GET} /user/:userId Get User Profile
 * @apiGroup User
 * @apiName UserGetProfile
 *
 * @apiDescription Get profile information of a specific user
 *
 * @apiParam {Number} userId The user id
 *
 * @apiSuccess (Success (200)) {Number} id The user's id
 * @apiSuccess (Success (200)) {String} name The user's name
 * @apiSuccess (Success (200)) {String} image The user's profile image
 * @apiSuccess (Success (200)) {String} biography The user's biography
 * @apiSuccess (Success (200)) {Number} nbArticles The number of articles created
 * @apiSuccess (Success (200)) {Number} nbDiscussions The number of discussions started
 * @apiSuccess (Success (200)) {Number} nbMessages The number of messages posted
 * @apiSuccess (Success (200)) {Date} registrationDate The user's registration date
 *
 * @apiSuccessExample Success Example
 * {
 *   "id": 2,
 *   "name": "Thomas"
 *   "image": "https://img.r3tests.net/users/2/profile-picture.png",
 *   "biography": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
 *   "nbArticles": 1,
 *   "nbDiscussions": 4,
 *   "nbMessages": "61",
 *   "registrationDate": "2024-04-18T08:07:40.736Z"
 * }
 *
 * @apiError (Error (404)) NOT_FOUND No user can be found for the specified id
 *
 * @apiPermission Public
 */
const getUserProfile = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const user = await dbUtil.User.findOne({
    attributes: ['id', 'name', 'image', 'biography', 'registration_date'],
    include: {
      model: dbUtil.Role,
      required: true
    },
    where: { id: userId }
  });

  if (user === null) {
    return next(new ErrorResponse('Cannot find user', httpStatus.NOT_FOUND, 'NOT_FOUND'));
  }

  const nbArticles = await dbUtil.Article.count({ where: { user_id: userId } });
  const nbDiscussions = await dbUtil.Discussion.count({ where: { user_id: userId } });
  const nbMessages = await dbUtil.Message.count({ where: { user_id: userId } });

  const userFormatted = {
    id: user.id,
    name: user.name,
    image: user.image,
    biography: user.biography,
    nbArticles: nbArticles,
    articlesNbPages: Math.ceil(nbArticles / PAGE_LIMIT),
    nbDiscussions: nbDiscussions,
    discussionsNbPages: Math.ceil(nbDiscussions / PAGE_LIMIT),
    nbMessages: nbMessages,
    messagesNbPages: Math.ceil(nbMessages / PAGE_LIMIT),
    registrationDate: user.registration_date,
    roles: user.Roles.map((role) => role.dataValues.label)
  };

  res.status(httpStatus.OK).json(userFormatted);
});

/**
 * @api {GET} /user/:userId/article/all Get User Articles
 * @apiGroup User
 * @apiName UserGetArticles
 *
 * @apiDescription Get articles of a specific user
 *
 * @apiParam {Number} userId The user id
 *
 * @apiQuery {Number} [page] The page
 *
 * @apiSuccess (Success (200)) {Number} id The article id
 * @apiSuccess (Success (200)) {String} title The article title
 * @apiSuccess (Success (200)) {String} image The article cover image
 * @apiSuccess (Success (200)) {String} date The article published date
 * @apiSuccess (Success (200)) {Object} category The article category
 *
 * @apiSuccessExample Success Example
 * {
 *   "id": 2,
 *   "title": "The impact of globalization",
 *   "image": "https://img.r3tests.net/nouvelles/users/2/Raphael/1716983115106.jpeg",
 *   "date": "2024-05-10T10:30:35.736Z",
 *   "category": {
 *     "label": "politique",
 *     "name": "Politique"
 *   }
 * }
 *
 * @apiError (Error (400)) USER_INCORRECT The user id is incorrect
 *
 * @apiPermission Public
 */
const getUserArticles = asyncHandler(async (req, res, next) => {
  const validationError = validatorUtil.validate(req);

  if (validationError) {
    return next(validationError);
  }

  const { userId } = req.params;
  let page, offset;

  if (req.query.page) {
    page = req.query.page - 1;
  } else {
    page = 0;
  }

  offset = page * PAGE_LIMIT;

  const articles = (
    await dbUtil.Article.findAll({
      attributes: ['id', 'title', 'image', 'date'],
      where: {
        user_id: userId
      },
      include: {
        model: dbUtil.Category,
        attributes: ['label', 'name'],
        required: true
      },
      order: [['date', 'DESC']],
      limit: PAGE_LIMIT,
      offset
    })
  ).map((article) => {
    return {
      id: article.id,
      title: article.title,
      image: article.image,
      date: article.date,
      category: article.Category
    };
  });

  res.status(httpStatus.OK).json(articles);
});

/**
 * @api {GET} /user/:userId/discussion/all Get User Discussions
 * @apiGroup User
 * @apiName UserGetDiscussions
 *
 * @apiDescription Get discussions of a specific user
 *
 * @apiParam {Number} userId The user id
 *
 * @apiQuery {Number} [page] The page
 *
 * @apiSuccess (Success (200)) {Number} id The discussion id
 * @apiSuccess (Success (200)) {String} name The discussion name
 * @apiSuccess (Success (200)) {Number} nbMessages The number of messages in a discussion
 * @apiSuccess (Success (200)) {Date} firstMessageDate The date of the first message
 * @apiSuccess (Success (200)) {Date} lastMessageDate The date of the last message
 * @apiSuccess (Success (200)) {Object} forum The forum where the discussion was created
 *
 * @apiSuccessExample Success Example
 * [
 *   {
 *     "id": 52,
 *     "name": "Where do you live?",
 *     "nbMessages": 6,
 *     "firstMessageDate": "2024-05-14T17:00:15.647Z",
 *     "lastMessageDate": "2024-05-18T10:39:49.856Z",
 *     "forum": {
 *       "label": "general",
 *       "name": "Général"
 *     }
 *   }
 * ]
 *
 * @apiError (Error (400)) USER_INCORRECT The user id is incorrect
 *
 * @apiPermission Public
 */
const getUserDiscussions = asyncHandler(async (req, res, next) => {
  const validationError = validatorUtil.validate(req);

  if (validationError) {
    return next(validationError);
  }

  const { userId } = req.params;
  let page, offset;

  if (req.query.page) {
    page = req.query.page - 1;
  } else {
    page = 0;
  }

  offset = page * PAGE_LIMIT;

  const discussions = (
    await dbUtil.Discussion.findAll({
      attributes: ['id', 'name'],
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
          model: dbUtil.Forum,
          attributes: ['label', 'name'],
          required: true
        }
      ],
      where: { user_id: userId },
      group: ['Discussion.id', 'Forum.id'],
      order: [[Sequelize.fn('MAX', Sequelize.col('date')), 'DESC']],
      limit: PAGE_LIMIT,
      offset,
      raw: true,
      subQuery: false
    })
  ).map((discussion) => {
    return {
      id: discussion.id,
      name: discussion.name,
      nbMessages: Number(discussion['Messages.nb_messages']),
      firstMessageDate: discussion['Messages.first_message_date'],
      lastMessageDate: discussion['Messages.last_message_date'],
      forum: {
        label: discussion['Forum.label'],
        name: discussion['Forum.name']
      }
    };
  });

  res.status(httpStatus.OK).json(discussions);
});

/**
 * @api {GET} /user/:userId/message/all Get User Messages
 * @apiGroup User
 * @apiName UserGetMessages
 *
 * @apiDescription Get messages of a specific user
 *
 * @apiParam {Number} userId The user id
 *
 * @apiQuery {Number} [page] The page
 *
 * @apiSuccess (Success (200)) {Number} id The message id
 * @apiSuccess (Success (200)) {String} content The message content
 * @apiSuccess (Success (200)) {Date} date The message date
 * @apiSuccess (Success (200)) {Object} discussion The discussion where the message was posted
 * @apiSuccess (Success (200)) {Object} forum The forum where the message was posted
 *
 * @apiSuccessExample Success Example
 * [
 *   {
 *     "id": 31,
 *     "content": "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
 *     "date": "2024-05-14T17:00:15.647Z",
 *     "discussion": {
 *       "id": 2,
 *       "name": "The impact of globalization"
 *     },
 *     "forum": {
 *       "label": "politique",
 *       "name": "Politique"
 *     }
 *   }
 * ]
 *
 * @apiError (Error (400)) USER_INCORRECT The user id is incorrect
 *
 * @apiPermission Public
 */
const getUserMessages = asyncHandler(async (req, res, next) => {
  const validationError = validatorUtil.validate(req);

  if (validationError) {
    return next(validationError);
  }

  const { userId } = req.params;
  let page, offset;

  if (req.query.page) {
    page = req.query.page - 1;
  } else {
    page = 0;
  }

  offset = page * PAGE_LIMIT;

  const messages = (
    await dbUtil.Message.findAll({
      attributes: ['id', 'content', 'date'],
      include: [
        {
          model: dbUtil.Discussion,
          attributes: ['id', 'name'],
          required: true,
          include: {
            model: dbUtil.Forum,
            attributes: ['label', 'name'],
            required: true
          }
        }
      ],
      where: {
        user_id: userId
      },
      order: [['date', 'DESC']],
      limit: PAGE_LIMIT,
      offset,
      raw: true
    })
  ).map((message) => {
    return {
      id: message.id,
      content: message.content,
      date: message.date,
      discussion: {
        id: message['Discussion.id'],
        name: message['Discussion.name']
      },
      forum: {
        label: message['Discussion.Forum.label'],
        name: message['Discussion.Forum.name']
      }
    };
  });

  for (const message of messages) {
    const nbPreviousMessages = await dbUtil.Message.count({
      where: { discussion_id: message.discussion.id, id: { [Op.lt]: message.id } }
    });
    let page = nbPreviousMessages / PAGE_LIMIT;

    if (Number.isInteger(page)) {
      page++;
    } else {
      page = Math.ceil(page);
    }

    message.discussion.page = page;
  }

  res.status(httpStatus.OK).json(messages);
});

/**
 * @api {PUT} /user/:userId/image Update User Image
 * @apiGroup User
 * @apiName UserUpdateImage
 *
 * @apiDescription Update the user image.
 *
 * @apiParam {Number} userId The user id
 *
 * @apiBody {String} image The link to the image.
 *
 * @apiParamExample {json} Body Example
 * {
 *   "image": "https://img.r3tests.net/nouvelles/users/2/Raphael/profile-picture.jpeg"
 * }
 *
 * @apiError (Error (400)) USER_INCORRECT The user id is incorrect
 * @apiError (Error (400)) NO_IMAGE There are no image
 *
 * @apiPermission Private
 */
const updateUserImage = asyncHandler(async (req, res, next) => {
  const validationError = validatorUtil.validate(req);

  if (validationError) {
    return next(validationError);
  }

  const { userId } = req.params;
  const { image } = req.body;
  const user = await dbUtil.User.findOne({ where: { id: userId } });

  user.image = image;

  await user.save();

  res.status(httpStatus.OK).end();
});

/**
 * @api {PUT} /user/:userId/password Update User Password
 * @apiGroup User
 * @apiName UserUpdatePassword
 *
 * @apiDescription Update the user password.
 *
 * @apiParam {Number} userId The user id
 *
 * @apiBody {String} password The password
 * @apiBody {String} repeatedPassword The repeated password
 *
 * @apiParamExample {json} Body Example
 * {
 *   "password": "ja_20PoK9-Gp",
 *   "repeatedPassword": "ja_20PoK9-Gp"
 * }
 *
 * @apiError (Error (400)) USER_INCORRECT The user id is incorrect
 * @apiError (Error (400)) NO_PASSWORD There are no password
 * @apiError (Error (400)) PASSWORD_MIN_LENGTH The password doesn't have at least 12 characters
 * @apiError (Error (400)) NO_REPEATED_PASSWORD There is no repeated password
 * @apiError (Error (400)) REPEATED_PASSWORD_MIN_LENGTH The repeated password doesn't have at least 12 characters
 * @apiError (Error (400)) REPEATED_PASSWORD_NO_MATCH The repeated password doesn't match the password
 *
 * @apiPermission Private
 */
const updateUserPassword = asyncHandler(async (req, res, next) => {
  const validationError = validatorUtil.validate(req);

  if (validationError) {
    return next(validationError);
  }

  const { userId } = req.params;
  const { password } = req.body;
  const user = await dbUtil.User.findOne({ where: { id: userId } });

  user.password = password;

  await user.save();

  res.status(httpStatus.OK).end();
});

/**
 * @api {PUT} /user/:userId/biography Update User Biography
 * @apiGroup User
 * @apiName UserUpdateBiography
 *
 * @apiDescription Update the user biography.
 *
 * @apiParam {Number} userId The user id
 *
 * @apiBody {String} biography The biography
 *
 * @apiParamExample {json} Body Example
 * {
 *   "biography": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
 * }
 *
 * @apiError (Error (400)) USER_INCORRECT The user id is incorrect
 *
 * @apiPermission Private
 */
const updateUserBiography = asyncHandler(async (req, res, next) => {
  const validationError = validatorUtil.validate(req);

  if (validationError) {
    return next(validationError);
  }

  const { userId } = req.params;
  const { biography } = req.body;
  const user = await dbUtil.User.findOne({ where: { id: userId } });

  user.biography = biography;

  await user.save();

  res.status(httpStatus.OK).end();
});

/**
 * @api {DELETE} /user/:userId Delete User
 * @apiGroup User
 * @apiName UserDelete
 *
 * @apiDescription Delete a user.
 *
 * @apiParam {Number} userId The user id
 *
 * @apiError (Error (400)) USER_INCORRECT The user id is incorrect
 *
 * @apiPermission Private
 */
const deleteUser = asyncHandler(async (req, res, next) => {
  const validationError = validatorUtil.validate(req);

  if (validationError) {
    return next(validationError);
  }

  const { userId } = req.params;
  const anonymousUser = await dbUtil.User.findOne({ where: { name: 'Anonyme' }, raw: true });

  // Set articles, discussions, and messages to Anonymous user
  await dbUtil.Article.update({ user_id: anonymousUser.id }, { where: { user_id: userId } });
  await dbUtil.Discussion.update({ user_id: anonymousUser.id }, { where: { user_id: userId } });
  await dbUtil.Message.update({ user_id: anonymousUser.id }, { where: { user_id: userId } });

  // Delete the user
  await dbUtil.User.destroy({ where: { id: userId } });

  res.status(httpStatus.OK).end();
});

export {
  getUser,
  getUserProfile,
  getUserArticles,
  getUserDiscussions,
  getUserMessages,
  updateUserImage,
  updateUserPassword,
  updateUserBiography,
  deleteUser
};

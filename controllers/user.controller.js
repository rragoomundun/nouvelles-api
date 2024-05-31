import httpStatus from 'http-status-codes';
import { Sequelize } from 'sequelize';

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
 * @apiSuccess (Success (200)) {String[]} roles The user's roles
 *
 * @apiSuccessExample Success Example
 * {
 *   "id": 2,
 *   "name": "Thomas"
 *   "email": "thomas.hugo@remail.com",
 *   "image": "https://img.r3tests.net/users/2/profile-picture.png",
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
    image: req.user.image,
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
    where: { id: userId },
    raw: true
  });

  if (user === null) {
    return next(new ErrorResponse('Cannot find user', httpStatus.NOT_FOUND, 'NOT_FOUND'));
  }

  const nbArticles = await dbUtil.Article.count({ where: { user_id: userId } });
  const nbDiscussions = await dbUtil.Discussion.count({ where: { user_id: userId } });
  const nbMessages = await dbUtil.Message.count({ where: { user_id: userId } });

  user.nbArticles = nbArticles;
  user.nbDiscussions = nbDiscussions;
  user.nbMessages = nbMessages;
  user.registrationDate = user.registration_date;

  delete user.registration_date;

  res.status(httpStatus.OK).json(user);
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
 * @apiError (Error (404)) NOT_FOUND No user can be found for the specified id
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

export { getUser, getUserProfile, getUserArticles };

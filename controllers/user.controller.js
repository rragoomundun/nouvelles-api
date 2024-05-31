import httpStatus from 'http-status-codes';
import { Sequelize } from 'sequelize';

import asyncHandler from '../middlewares/async.middleware.js';

import ErrorResponse from '../classes/errorResponse.class.js';

import dbUtil from '../utils/db.util.js';

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

  const nbDiscussions = await dbUtil.Discussion.count({ where: { user_id: userId } });
  const nbMessages = await dbUtil.Message.count({ where: { user_id: userId } });

  user.nbDiscussions = nbDiscussions;
  user.nbMessages = nbMessages;
  user.registrationDate = user.registration_date;

  delete user.registration_date;

  res.status(httpStatus.OK).json(user);
});

export { getUser, getUserProfile };

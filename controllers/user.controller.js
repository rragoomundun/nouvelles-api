import httpStatus from 'http-status-codes';

import asyncHandler from '../middlewares/async.middleware.js';

import dbUtil from '../utils/db.util.js';

/**
 * @api {GET} /user Get User
 * @apiGroup User
 * @apiName UserGet
 *
 * @apiDescription Get the current user if authorized
 *
 * @apiSuccess (Success (200)) {Int} id The user's id
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

export { getUser };

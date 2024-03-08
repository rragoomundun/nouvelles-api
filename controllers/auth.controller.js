import httpStatus from 'http-status-codes';

import asyncHandler from '../middlewares/async.middleware.js';

import ErrorResponse from '../classes/errorResponse.class.js';

import dbUtil from '../utils/db.util.js';

/**
 * @api {POST} /auth/register Register User
 * @apiGroup Auth
 * @apiName AuthRegister
 *
 * @apiDescription Register a new user in the database
 *
 * @apiBody {String} name User's name
 * @apiBody {String} email User's email
 * @apiBody {String{12..}} password User's password
 *
 * @apiParamExample {json} Body Example
 * {
 *   "name": "Tom",
 *   "email": "tom.bizarre@example.com",
 *   "password": "jf8uaFa%5yIp"
 * }
 *
 * @apiError (Error (400)) ALREADY_REGISTERED Email address is already registered
 * @apiError (Error (400)) PASSWORD_TOO_SHORT The password is too short
 *
 * @apiPermission Public
 */
const register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;
  const emailExists = await dbUtil.User.findOne({ where: { email: email } });

  if (emailExists) {
    return next(new ErrorResponse('Email already registered', httpStatus.BAD_REQUEST, 'ALREADY_REGISTERED'));
  }

  if (password.length < 12) {
    return next(new ErrorResponse('Password too short', httpStatus.BAD_REQUEST, 'PASSWORD_TOO_SHORT'));
  }

  await dbUtil.User.create({ name, email, password });

  return res.status(httpStatus.CREATED).json({ msg: 'User registered' });

  /**
   * TODO:
   *  1. explorer la validation avec sequelize
   *  2. utiliser la transaction pour créer l'utilisateur et le token
   *  3. Token
   *  4. encrypt password
   *  4. send email
   */
});

export { register };

import httpStatus from 'http-status-codes';

import asyncHandler from '../middlewares/async.middleware.js';

/**
 * @api {POST} /auth/register Register User
 * @apiGroup Auth
 * @apiName AuthRegister
 *
 * @apiDescription Register a new user in the database
 *
 * @apiParam {Srting} name User's name
 * @apiParam {String} email User's email
 * @apiParam {String{12..}} password User's password
 *
 * @apiParamExample
 * {
 *   "name": "Tom",
 *   "email": "tom.bizarre@example.com",
 *   "password": "jf8uaFa%5yIp"
 * }
 *
 * @apiError (Error (400)) ALREADY_REGISTERED Email address is already registered
 *
 * @apiPermission Public
 */
const register = asyncHandler(async (req, res, next) => {
  res.status(httpStatus.OK).json({});
});

export { register };

import httpStatus from 'http-status-codes';
import { ValidationError } from 'sequelize';

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
 * @apiPermission Public
 */
const register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;
  const emailExists = await dbUtil.User.findOne({ where: { email } });
  const nameExists = await dbUtil.User.findOne({ where: { name } });

  if (emailExists) {
    return next(new ErrorResponse("L'adresse email est déjà utilisée", httpStatus.BAD_REQUEST));
  }

  if (nameExists) {
    return next(new ErrorResponse("Le nom d'utilisateur est déjà utilisé", httpStatus.BAD_REQUEST));
  }

  try {
    const result = await dbUtil.sequelize.transaction(async (transaction) => {
      const user = await dbUtil.User.create({ name, email, password }, { transaction });

      return user;
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return next(new ErrorResponse(error.errors[0].message, httpStatus.BAD_REQUEST));
    } else {
      return next(new ErrorResponse('Impossible de créer le compte', httpStatus.BAD_REQUEST));
    }
  }

  return res.status(httpStatus.OK).json({});

  // return res.status(httpStatus.CREATED).json({ msg: 'User registered' });

  /**
   * TODO:
   *  1. explorer la validation avec sequelize (validate message)
   *  2. utiliser la transaction pour créer l'utilisateur et le token
   *  3. Token
   *  4. encrypt password
   *  4. send email
   */
});

export { register };

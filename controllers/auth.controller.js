import httpStatus from 'http-status-codes';
import { ValidationError } from 'sequelize';

import asyncHandler from '../middlewares/async.middleware.js';

import ErrorResponse from '../classes/errorResponse.class.js';

import dbUtil from '../utils/db.util.js';
import { deleteUser } from '../utils/user.util.js';
import { send } from '../utils/mail.util.js';

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

  // Create user
  let result;

  try {
    result = await dbUtil.sequelize.transaction(async (transaction) => {
      const user = await dbUtil.User.create({ name, email, password }, { transaction });
      const token = await dbUtil.Token.create(
        { type: 'register-confirm', token: 'empty', expire: Date.now(), user_id: user.id },
        { transaction }
      );
      const role = await dbUtil.Role.findOne({ where: { label: 'regulier' } }, { transaction });
      const userRole = await dbUtil.UserRole.create({ user_id: user.id, role_id: role.id }, { transaction });

      return { user, token };
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return next(new ErrorResponse(error.errors[0].message, httpStatus.BAD_REQUEST));
    } else {
      return next(new ErrorResponse('Impossible de créer le compte', httpStatus.BAD_REQUEST));
    }
  }

  // Send confirmation email
  try {
    const mailOptions = {
      mail: 'registration',
      userId: result.user.id,
      templateOptions: {
        confirmationLink: `${process.env.APP_URL}/inscription/confirmer/${result.token.token}`
      }
    };

    await send(mailOptions);
  } catch {
    await deleteUser(result.user.id);
    return next(new ErrorResponse('Impossible de créer le compte', httpStatus.INTERNAL_SERVER_ERROR));
  }

  return res.status(httpStatus.CREATED).json({ msg: 'User registered' });
});

export { register };

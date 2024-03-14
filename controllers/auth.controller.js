import httpStatus from 'http-status-codes';
import { ValidationError } from 'sequelize';

import asyncHandler from '../middlewares/async.middleware.js';

import ErrorResponse from '../classes/errorResponse.class.js';

import dbUtil from '../utils/db.util.js';
import cryptUtil from '../utils/crypt.util.js';
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

/**
 * @api {PUT} /auth/register/confirm/:confirmationToken Confirm User Registration
 * @apiGroup Auth
 * @apiName AuthRegisterConfirm
 *
 * @apiDescription Confirm a user account by validating its confirmation token.
 *
 * @apiParam {String} confirmationToken User's confirmation token

 * @apiSuccess (Success(200)) {String} token JWT token
 * @apiSuccessExample Success Example
 * {
 *   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlNmY0MDQ1MzVlNzU3NWM1NGExNTMyNyIsImlhdCI6MTU4NDM0OTI1MywiZXhwIjoxNTg2OTQxMjUzfQ.2f59_zRuYVXADCQWnQb6mG8NG3zulj12HZCgoIdMEfw"
 * }
 *
 * @apiPermission Public
 * 
 * TODO: get the user from the token and send the user id to sendTokenResponse
 */
const registerConfirm = asyncHandler(async (req, res, next) => {
  const confirmationToken = cryptUtil.getDigestHash(req.params.confirmationToken);

  const token = await dbUtil.Token.findOne({ where: { token: confirmationToken } });

  if (!token) {
    return next(new ErrorResponse('Invalid token', httpStatus.BAD_REQUEST));
  }

  await dbUtil.Token.destroy({ where: { token: confirmationToken } });

  sendTokenResponse(userId, httpStatus.OK, res);
});

// Get token from model, create cookie, and send response
const sendTokenResponse = (userId, statusCode, res) => {
  const token = dbUtil.User.getSignedJWTToken(userId);

  const options = {
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * process.env.JWT_COOKIE_EXPIRE),
    sameSite: 'None',
    secure: true
  };

  res.status(statusCode).cookie('token', token, options).json({ token });
};

export { register, registerConfirm };

import httpStatus from 'http-status-codes';

import asyncHandler from '../middlewares/async.middleware.js';

import ErrorResponse from '../classes/errorResponse.class.js';

import dbUtil from '../utils/db.util.js';
import htmlUtil from '../utils/html.util.js';
import cookieUtil from '../utils/cookie.util.js';
import mailUtil from '../utils/mail.util.js';
import userUtil from '../utils/user.util.js';
import validatorUtil from '../utils/validator.util.js';

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
 * @apiError (Error (400)) NO_NAME There is no name
 * @apiError (Error (400)) NAME_IN_USE The username is already in use
 * @apiError (Error (400)) NO_EMAIL There is no email
 * @apiError (Error (400)) INVALID_EMAIL The email address is invalid
 * @apiError (Error (400)) EMAIL_IN_USE The email address is already in use
 * @apiError (Error (400)) NO_PASSWORD There is no password
 * @apiError (Error (400)) PASSWORD_MIN_LENGTH The password doesn't have at least 12 characters
 * @apiError (Error (500)) ACCOUNT_CREATION_FAILED Unable to create the account
 *
 * @apiPermission Public
 */
const register = asyncHandler(async (req, res, next) => {
  const validationError = validatorUtil.validate(req);

  if (validationError) {
    return next(validationError);
  }

  const { name, email, password } = req.body;

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
  } catch {
    return next(
      new ErrorResponse('Cannot create account', httpStatus.INTERNAL_SERVER_ERROR, 'ACCOUNT_CREATION_FAILED')
    );
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
    await mailUtil.send(mailOptions);
  } catch {
    await userUtil.deleteUser(result.user.id);
    return next(
      new ErrorResponse('Cannot create account', httpStatus.INTERNAL_SERVER_ERROR, 'ACCOUNT_CREATION_FAILED')
    );
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
 * @apiError (Error (400)) INVALID_TOKEN Invalid token
 *
 * @apiPermission Public
 */
const registerConfirm = asyncHandler(async (req, res, next) => {
  const confirmationToken = htmlUtil.sanitize(req.params.confirmationToken);
  const token = await dbUtil.Token.findOne({ where: { token: confirmationToken } });

  if (!token) {
    return next(new ErrorResponse('Invalid token', httpStatus.BAD_REQUEST, 'INVALID_TOKEN'));
  }

  const userId = token.user_id;

  await token.destroy();

  sendTokenResponse(userId, httpStatus.OK, res);
});

/**
 * @api {POST} /auth/login Login User
 * @apiGroup Auth
 * @apiName AuthLogin
 *
 * @apiDescription Login user and returns token.
 *
 * @apiBody {String} email User's email
 * @apiBody {String{12..}} password User's password
 *
 * @apiParamExample Body Example
 * {
 *   "email": "newuser@test.com",
 *   "password": "123456789012"
 * }
 *
 * @apiSuccess (Success(200)) {String} token JWT token
 * @apiSuccessExample Success Example
 * {
 *   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlNmY0MDQ1MzVlNzU3NWM1NGExNTMyNyIsImlhdCI6MTU4NDM0OTI1MywiZXhwIjoxNTg2OTQxMjUzfQ.2f59_zRuYVXADCQWnQb6mG8NG3zulj12HZCgoIdMEfw"
 * }
 *
 * @apiError (Error (400)) NO_EMAIL There is no email
 * @apiError (Error (400)) INVALID_EMAIL The email address is invalid
 * @apiError (Error (400)) NO_PASSWORD There is no password
 * @apiError (Error (400)) PASSWORD_MIN_LENGTH The password doesn't have at least 12 characters
 * @apiError (Error (401)) INVALID The data entered is invalid
 * @apiError (Error (401)) UNCONFIRMED The account is unconfirmed
 *
 * @apiPermission Public
 */
const login = asyncHandler(async (req, res, next) => {
  const validationError = validatorUtil.validate(req);

  if (validationError) {
    return next(validationError);
  }

  const { email, password } = req.body;

  const user = await dbUtil.User.findOne({ where: { email } });

  if (!user || !(await user.verifyPassword(password, user.password))) {
    return next(new ErrorResponse('Data entered invalid', httpStatus.UNAUTHORIZED, 'INVALID'));
  }

  const token = await dbUtil.Token.findOne({ where: { user_id: user.id } });

  if (token && token.type === 'register-confirm') {
    return next(new ErrorResponse('Account unconfirmed', httpStatus.UNAUTHORIZED, 'UNCONFIRMED'));
  }

  sendTokenResponse(user.id, httpStatus.OK, res);
});

/**
 * @api {GET} /auth/logout Logout
 * @apiGroup Auth
 * @apiName AuthLogout
 *
 * @apiDescription Log out user by clearing token cookie.
 *
 * @apiPermission Private
 */
const logout = asyncHandler(async (req, res, next) => {
  cookieUtil.clearToken(res);
  res.status(httpStatus.OK).end();
});

/**
 * @api {POST} /auth/password/forgot Forgot Password
 * @apiGroup Auth
 * @apiName AuthForgotPassword
 *
 * @apiDescription Generate reset password token and send reset email
 *
 * @apiBody {String} email User's email
 *
 * @apiParamExample Body Example
 * {
 *   "email": "newuser@test.com"
 * }
 *
 * @apiError (Error (400)) NO_EMAIL There is no email
 * @apiError (Error (400)) INVALID_EMAIL The email address is invalid
 * @apiError (Error (401)) UNCONFIRMED The account is unconfirmed
 * @apiError (Error (409)) ALREADY_RECOVERING A recovery procedure is already in progress
 * @apiError (Error (500)) EMAIL_SENDING_FAILED Cannot send recovery email
 *
 * @apiPermission Public
 */
const forgotPassword = asyncHandler(async (req, res, next) => {
  const validationError = validatorUtil.validate(req);

  if (validationError) {
    return next(validationError);
  }

  const { email } = req.body;

  const user = await dbUtil.User.findOne({ where: { email } });

  if (!user) {
    return next(new ErrorResponse('Invalid email address', httpStatus.BAD_REQUEST, 'INVALID_EMAIL'));
  }

  const token = await dbUtil.Token.findOne({ where: { user_id: user.id } });

  if (token) {
    if (token.type === 'register-confirm') {
      return next(new ErrorResponse('Acount unconfirmed', httpStatus.UNAUTHORIZED, 'UNCONFIRMED'));
    } else if (token.type === 'password-reset') {
      return next(
        new ErrorResponse(
          'A password recovery procedure is already in progress',
          httpStatus.CONFLICT,
          'ALREADY_RECOVERING'
        )
      );
    }
  }

  const passwordResetToken = await dbUtil.Token.create({
    type: 'password-reset',
    token: 'empty',
    expire: Date.now(),
    user_id: user.id
  });

  try {
    const mailOptions = {
      mail: 'passwordForgotten',
      userId: user.id,
      templateOptions: {
        resetLink: `${process.env.APP_URL}/password/reset/${passwordResetToken.token}`
      }
    };

    await mailUtil.send(mailOptions);

    res.status(httpStatus.OK).end();
  } catch {
    await passwordResetToken.destroy();
    return next(new ErrorResponse('Cannot send email', httpStatus.INTERNAL_SERVER_ERROR, 'EMAIL_SENDING_FAILED'));
  }
});

/**
 * @api {PUT} /auth/password/reset/:resetPasswordToken Reset Password
 * @apiGroup Auth
 * @apiName AuthResetPassword
 *
 * @apiDescription Reset user password
 *
 * @apiParam {String} resetPasswordToken User's confirmation token
 * @apiBody {String{12..}} newPassword User's new password
 *
 * @apiParamExample Body Example
 * {
 *   "password": "87654321"
 * }
 *
 * @apiSuccess (Success(200)) {String} token JWT token
 * @apiSuccessExample Success Example
 * {
 *   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlNmY0MDQ1MzVlNzU3NWM1NGExNTMyNyIsImlhdCI6MTU4NDM0OTI1MywiZXhwIjoxNTg2OTQxMjUzfQ.2f59_zRuYVXADCQWnQb6mG8NG3zulj12HZCgoIdMEfw"
 * }
 *
 * @apiError (Error (400)) NO_PASSWORD There is no password
 * @apiError (Error (400)) PASSWORD_MIN_LENGTH The password doesn't have at least 12 characters
 * @apiError (Error (400)) INVALID_TOKEN Invalid token
 *
 * @apiPermission Public
 */
const passwordReset = asyncHandler(async (req, res, next) => {
  const validationError = validatorUtil.validate(req);

  if (validationError) {
    return next(validationError);
  }

  const { password } = req.body;
  const resetPasswordToken = htmlUtil.sanitize(req.params.resetPasswordToken);

  const token = await dbUtil.Token.findOne({ where: { token: resetPasswordToken } });

  if (!token) {
    return next(new ErrorResponse('Invalid token', httpStatus.BAD_REQUEST, 'INVALID_TOKEN'));
  }

  const user = await dbUtil.User.findOne({ where: { id: token.user_id } });

  user.password = password;

  await user.save();
  await dbUtil.Token.destroy({ where: { token: resetPasswordToken } });

  sendTokenResponse(user.id, httpStatus.OK, res);
});

/**
 * @api {GET} /auth/authorized Authorized
 * @apiGroup Auth
 * @apiName AuthAuthorized
 *
 * @apiDescription Checks if the user token is valid
 *
 * @apiPermission Private
 */
const authorized = (req, res, next) => {
  res.status(httpStatus.OK).json({});
};

// Get token from model, create cookie, and send response
const sendTokenResponse = async (userId, statusCode, res) => {
  const user = await dbUtil.User.findOne({ where: { id: userId } });
  const token = user.getSignedJWTToken(userId);

  const options = {
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * process.env.JWT_COOKIE_EXPIRE),
    sameSite: 'None',
    secure: true
  };

  res.status(statusCode).cookie('token', token, options).json({ token });
};

export { register, registerConfirm, login, logout, forgotPassword, passwordReset, authorized };

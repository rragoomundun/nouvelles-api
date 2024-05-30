import { body } from 'express-validator';

import dbUtil from '../utils/db.util.js';

const registerValidator = [
  body('name')
    .notEmpty()
    .withMessage('Please add a name;NO_NAME')
    .custom(async (value) => {
      const nameExists = await dbUtil.User.findOne({ where: { name: value } });

      if (nameExists) {
        throw new Error('The username is already in use;NAME_IN_USE');
      }
    }),
  body('email')
    .notEmpty()
    .withMessage('Please add an email address;NO_EMAIL')
    .isEmail()
    .withMessage('Please add a valid email;INVALID_EMAIL')
    .custom(async (value) => {
      const emailExists = await dbUtil.User.findOne({ where: { email: value } });

      if (emailExists) {
        throw new Error('The email address is already in use;EMAIL_IN_USE');
      }
    }),
  body('password')
    .notEmpty()
    .withMessage('Please add a password;NO_PASSWORD')
    .isLength({ min: process.env.PASSWORD_MIN_LENGTH })
    .withMessage(`The password has to have at least ${process.env.PASSWORD_MIN_LENGTH} characters;PASSWORD_MIN_LENGTH`),
  body('repeatedPassword')
    .notEmpty()
    .withMessage('Please add the repeated password;NO_REPEATED_PASSWORD')
    .isLength({ min: process.env.PASSWORD_MIN_LENGTH })
    .withMessage(
      `The repeated password has to have at least ${process.env.PASSWORD_MIN_LENGTH} characters;REPEATED_PASSWORD_MIN_LENGTH`
    )
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error(`The repeated password doesn't match the password;REPEATED_PASSWORD_NO_MATCH`);
      }

      return true;
    })
];

const loginValidator = [
  body('email')
    .notEmpty()
    .withMessage('Please add an email address;NO_EMAIL')
    .isEmail()
    .withMessage('Please add a valid email;INVALID_EMAIL'),
  body('password')
    .notEmpty()
    .withMessage('Please add a password;NO_PASSWORD')
    .isLength({ min: process.env.PASSWORD_MIN_LENGTH })
    .withMessage(`The password has to have at least ${process.env.PASSWORD_MIN_LENGTH} characters;PASSWORD_MIN_LENGTH`)
];

const forgotPasswordValidator = [
  body('email')
    .notEmpty()
    .withMessage('Please add an email address;NO_EMAIL')
    .isEmail()
    .withMessage('Please add a valid email;INVALID_EMAIL')
];

const passwordResetValidator = [
  body('password')
    .notEmpty()
    .withMessage('Please add a password;NO_PASSWORD')
    .isLength({ min: process.env.PASSWORD_MIN_LENGTH })
    .withMessage(`The password has to have at least ${process.env.PASSWORD_MIN_LENGTH} characters;PASSWORD_MIN_LENGTH`)
];

export { registerValidator, loginValidator, forgotPasswordValidator, passwordResetValidator };

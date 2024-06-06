import { param, body } from 'express-validator';

import dbUtil from '../utils/db.util.js';

const userExists = async (id) => {
  const userExists = await dbUtil.User.findOne({ where: { id } });

  if (userExists === null) {
    throw new Error('This user does not exists;USER_INCORRECT');
  }
};

const getUserArticlesValidator = [
  param('userId').custom(async (value) => {
    await userExists(value);
  })
];

const getUserDiscussionsValidator = [
  param('userId').custom(async (value) => {
    await userExists(value);
  })
];

const getUserMessagesValidator = [
  param('userId').custom(async (value) => {
    await userExists(value);
  })
];

const updateUserImageValidator = [
  param('userId').custom(async (value) => {
    await userExists(value);
  }),
  body('image').notEmpty().withMessage('Please add an image;NO_IMAGE')
];

const updateUserPasswordValidator = [
  param('userId').custom(async (value) => {
    await userExists(value);
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

export {
  getUserArticlesValidator,
  getUserDiscussionsValidator,
  getUserMessagesValidator,
  updateUserImageValidator,
  updateUserPasswordValidator
};

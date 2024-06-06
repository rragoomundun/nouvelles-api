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

export { getUserArticlesValidator, getUserDiscussionsValidator, getUserMessagesValidator, updateUserImageValidator };

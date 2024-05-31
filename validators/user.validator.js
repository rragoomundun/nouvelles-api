import { param } from 'express-validator';

import dbUtil from '../utils/db.util.js';

const getUserArticlesValidator = [
  param('userId').custom(async (value) => {
    const userExists = await dbUtil.User.findOne({ where: { id: value } });

    if (userExists === null) {
      throw new Error('This user does not exists;USER_INCORRECT');
    }
  })
];

export { getUserArticlesValidator };

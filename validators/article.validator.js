import { query } from 'express-validator';

import categoryUtil from '../utils/category.util.js';

const articleByCategoryValidator = [
  query('category')
    .notEmpty()
    .withMessage('Please specify a category; NO_CATEGORY')
    .custom(async (value) => {
      const categoryId = await categoryUtil.getCategoryId(value);

      if (categoryId === null) {
        throw new Error('The category cannot be found;NOT_FOUND;NOT_FOUND');
      }
    })
];

export { articleByCategoryValidator };

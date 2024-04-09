import { query } from 'express-validator';

const articleByCategoryValidator = [query('category').notEmpty().withMessage('Please specify a category; NO_CATEGORY')];

export { articleByCategoryValidator };

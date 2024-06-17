import { query } from 'express-validator';

const searchArticlesValidator = [query('query').notEmpty().withMessage('Please add a query;NO_QUERY')];

const searchArticlesMetaValidator = [query('query').notEmpty().withMessage('Please add a query;NO_QUERY')];

const searchDiscussionsValidator = [query('query').notEmpty().withMessage('Please add a query;NO_QUERY')];

const searchDiscussionsMetaValidator = [query('query').notEmpty().withMessage('Please add a query;NO_QUERY')];

export {
  searchArticlesValidator,
  searchArticlesMetaValidator,
  searchDiscussionsValidator,
  searchDiscussionsMetaValidator
};

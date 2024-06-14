import httpStatus from 'http-status-codes';
import { Op } from 'sequelize';

import asyncHandler from '../middlewares/async.middleware.js';

import dbUtil from '../utils/db.util.js';
import validatorUtil from '../utils/validator.util.js';

const PAGE_LIMIT = 20;

/**
 * @api {GET} /search/articles Search Articles
 * @apiGroup Search
 * @apiName SearchArticles
 *
 * @apiDescription Search for articles.
 *
 * @apiQuery {String} query The search query
 * @apiQuery {Number} [page] The page
 *
 * @apiSuccess (Success (200)) {Number} id The article id
 * @apiSuccess (Success (200)) {String} title The article title
 * @apiSuccess (Success (200)) {String} image The article image
 *
 * @apiSuccessExample Success Example
 * [
 *   {
 *     "id": 116,
 *     "title": "Article 113",
 *     "image": "https://w.wallhaven.cc/full/0p/wallhaven-0p9gde.jpg"
 *   },
 *   {
 *     "id": 106,
 *     "title": "Article 103",
 *     "image": "https://w.wallhaven.cc/full/p8/wallhaven-p8ddoj.png"
 *   },
 * ]
 *
 * @apiError (Error (400)) NO_QUERY There is no query parameter
 *
 * @apiPermission Public
 */
const searchArticles = asyncHandler(async (req, res, next) => {
  const validationError = validatorUtil.validate(req);

  if (validationError) {
    return next(validationError);
  }

  const { query } = req.query;
  let page, offset;

  if (req.query.page) {
    page = req.query.page - 1;
  } else {
    page = 0;
  }

  offset = page * PAGE_LIMIT;

  const articles = (
    await dbUtil.Article.findAll({
      attributes: ['id', 'title', 'image'],
      include: {
        model: dbUtil.Category,
        attributes: ['label'],
        required: true
      },
      where: {
        [Op.or]: [{ title: { [Op.iLike]: `%${query}%` } }, { content: { [Op.iLike]: `%${query}%` } }],
        published: true
      },
      offset,
      limit: PAGE_LIMIT
    })
  ).map((article) => ({
    id: article.dataValues.id,
    title: article.dataValues.title,
    image: article.dataValues.image,
    category: article.dataValues.Category.label
  }));

  res.status(httpStatus.OK).json(articles);
});

/**
 * @api {GET} /search/articles/meta Search Articles Meta Informations
 * @apiGroup Search
 * @apiName SearchArticlesMeta
 *
 * @apiDescription Get meta information for search articles query.
 *
 * @apiQuery {String} query The search query
 *
 * @apiSuccess (Success (200)) {Number} totalArticles The number of found articles
 * @apiSuccess (Success (200)) {Number} nbPages The number of pages on the search page
 *
 * @apiSuccessExample Success Example
 * {
 *   "totalArticles": 93,
 *   "nbPages": 5
 * }
 *
 * @apiError (Error (400)) NO_QUERY There is no query parameter
 *
 * @apiPermission Public
 */
const searchArticlesMeta = asyncHandler(async (req, res, next) => {
  const validationError = validatorUtil.validate(req);

  if (validationError) {
    return next(validationError);
  }

  const { query } = req.query;
  const totalArticles = await dbUtil.Article.count({
    where: {
      [Op.or]: [{ title: { [Op.iLike]: `%${query}%` } }, { content: { [Op.iLike]: `%${query}%` } }],
      published: true
    }
  });
  const nbPages = Math.ceil(totalArticles / PAGE_LIMIT);

  res.status(httpStatus.OK).json({ totalArticles, nbPages });
});

/**
 * @api {GET} /search/discussions Search Discussions
 * @apiGroup Search
 * @apiName SearchDiscussions
 *
 * @apiDescription Search for discussions.
 *
 * @apiQuery {String} query The search query
 * TODO: add success and success examples
 *
 * @apiPermission Public
 */
const searchDiscussions = asyncHandler(async (req, res, next) => {
  res.status(httpStatus.OK).end();
});

export { searchArticles, searchArticlesMeta, searchDiscussions };

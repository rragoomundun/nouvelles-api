import httpStatus from 'http-status-codes';

import asyncHandler from '../middlewares/async.middleware.js';

import dbUtil from '../utils/db.util.js';
import validatorUtil from '../utils/validator.util.js';

const PAGE_LIMIT = 20;

/**
 * @api {GET} /article/by-category Get Articles By Category
 * @apiGroup Articles
 * @apiName ArticlesByCategory
 *
 * @apiDescription Get articles by a specific category.
 *
 * @apiSuccess (Success (200)) {Int} id The article id
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
 * @apiQuery {String} category The category label
 * @apiQuery {Int} [page] The page
 *
 * @apiError (Error (400)) NO_CATEGORY There is no category parameter
 *
 * @apiPermission Public
 */
const getArticlesByCategory = asyncHandler(async (req, res, next) => {
  const validationError = validatorUtil.validate(req);

  if (validationError) {
    return next(validationError);
  }

  const { category } = req.query;
  let page, offset;

  if (req.query.page) {
    page = req.query.page - 1;
  } else {
    page = 0;
  }

  offset = page * PAGE_LIMIT;

  const categoryId = (
    await dbUtil.Category.findOne({
      where: {
        label: category
      }
    })
  ).dataValues.id;
  const articles = await dbUtil.Article.findAll({
    attributes: ['id', 'title', 'image'],
    where: {
      category_id: categoryId
    },
    order: [['date', 'DESC']],
    offset,
    limit: PAGE_LIMIT
  });

  res.status(httpStatus.OK).json(articles);
});

/**
 * @api {GET} /article/by-category/meta Get Articles By Category Meta Informations
 * @apiGroup Articles
 * @apiName ArticlesByCategoryMeta
 *
 * @apiDescription Get meta information for a specific category page.
 *
 * @apiQuery {String} category The category label
 *
 * @apiSuccess (Success (200)) {Int} totalArticles The number of articles in a category
 * @apiSuccess (Success (200)) {Int} nbPages The number of pages in a category
 *
 * @apiSuccessExample Success Example
 * {
 *   "totalArticles": 93,
 *   "nbPages": 5
 * }
 *
 * @apiError (Error (400)) NO_CATEGORY There is no category parameter
 *
 * @apiPermission Public
 */
const getArticlesByCategoryMeta = asyncHandler(async (req, res, next) => {
  const validationError = validatorUtil.validate(req);

  if (validationError) {
    return next(validationError);
  }

  const { category } = req.query;
  const categoryId = (
    await dbUtil.Category.findOne({
      where: {
        label: category
      }
    })
  ).dataValues.id;
  const totalArticles = await dbUtil.Article.count({
    where: {
      category_id: categoryId
    }
  });
  const nbPages = Math.ceil(totalArticles / PAGE_LIMIT);

  res.status(httpStatus.OK).json({ totalArticles, nbPages });
});

export { getArticlesByCategory, getArticlesByCategoryMeta };

import httpStatus from 'http-status-codes';

import asyncHandler from '../middlewares/async.middleware.js';

import ErrorResponse from '../classes/errorResponse.class.js';

import dbUtil from '../utils/db.util.js';
import categoryUtil from '../utils/category.util.js';
import validatorUtil from '../utils/validator.util.js';

const PAGE_LIMIT = 20;

/**
 * @api {GET} /article/:articleId Get Article
 * @apiGroup Articles
 * @apiName ArticlesGetArticle
 *
 * @apiDescription Get a specific article.
 *
 * @apiParam {Number} articleId The article id
 *
 * @apiSuccess (Success (200)) {Number} id The article id
 * @apiSuccess (Success (200)) {String} title The article title
 * @apiSuccess (Success (200)) {String} image The article image
 * @apiSuccess (Success (200)) {String} content The article content
 * @apiSuccess (Success (200)) {Date} date The article published date
 * @apiSuccess (Success (200)) {Date} updated_date The article updated date
 * @apiSuccess (Success (200)) {Number} author.id The article's author id
 * @apiSuccess (Success (200)) {String} author.name The article's author name
 * @apiSuccess (Success (200)) {String} author.image The article's author image
 *
 * @apiSuccessExample Success Example
 * {
 *    "id": 10,
 *    "title": "Article 8",
 *    "image": "https://w.wallhaven.cc/full/nr/wallhaven-nrr8yq.jpg",
 *    "content": "Lorem ipsum dolor sit amet...",
 *    "date": "2024-04-06T07:55:55.179Z",
 *    "updated_date": null,
 *    "user": {
 *      "id": 1,
 *      "name": "Raphael",
 *      "image": null
 *    }
 * }
 *
 * @apiError (Error (404)) NOT_FOUND The article cannot be found
 *
 * @apiPermission Public
 */
const getArticle = asyncHandler(async (req, res, next) => {
  const { articleId } = req.params;

  try {
    let article = await dbUtil.Article.findOne({
      attributes: ['id', 'title', 'image', 'content', 'date', 'updated_date'],
      include: [
        {
          model: dbUtil.User,
          required: true
        }
      ],
      where: { id: articleId, published: true }
    });

    if (article === null) {
      throw Error();
    }

    article = article.dataValues;

    article.author = {
      id: article.User.id,
      name: article.User.name,
      image: article.User.image
    };

    delete article.User;

    res.status(httpStatus.OK).json(article);
  } catch {
    return next(new ErrorResponse('Cannot find article', httpStatus.NOT_FOUND, 'NOT_FOUND'));
  }
});

/**
 * @api {GET} /article/by-category Get Articles By Category
 * @apiGroup Articles
 * @apiName ArticlesByCategory
 *
 * @apiDescription Get articles by a specific category.
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
 * @apiQuery {String} category The category label
 * @apiQuery {Number} [page] The page
 *
 * @apiError (Error (400)) NO_CATEGORY There is no category parameter
 * @apiError (Error (404)) NOT_FOUND The category cannot be found
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

  const categoryId = await categoryUtil.getCategoryId(category);
  const articles = await dbUtil.Article.findAll({
    attributes: ['id', 'title', 'image'],
    where: {
      category_id: categoryId,
      published: true
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
 * @apiSuccess (Success (200)) {Number} totalArticles The number of articles in a category
 * @apiSuccess (Success (200)) {Number} nbPages The number of pages in a category
 *
 * @apiSuccessExample Success Example
 * {
 *   "totalArticles": 93,
 *   "nbPages": 5
 * }
 *
 * @apiError (Error (400)) NO_CATEGORY There is no category parameter
 * @apiError (Error (404)) NOT_FOUND The category cannot be found
 *
 * @apiPermission Public
 */
const getArticlesByCategoryMeta = asyncHandler(async (req, res, next) => {
  const validationError = validatorUtil.validate(req);

  if (validationError) {
    return next(validationError);
  }

  const { category } = req.query;
  const categoryData = await categoryUtil.getCategoryFromLabel(category);
  const categoryId = categoryData.dataValues.id;
  const categoryName = categoryData.dataValues.name;

  const totalArticles = await dbUtil.Article.count({
    where: {
      category_id: categoryId
    }
  });
  const nbPages = Math.ceil(totalArticles / PAGE_LIMIT);

  res.status(httpStatus.OK).json({ categoryName, totalArticles, nbPages });
});

/**
 * @api {PUT} /article/:articleId/viewed Article Viewed
 * @apiGroup Articles
 * @apiName ArticlesViewed
 *
 * @apiDescription Increment the number of views of an article.
 *
 * @apiParam {Number} articleId The article id
 *
 * @apiError (Error (400)) NOT_FOUND The article cannot be found
 *
 * @apiPermission Public
 */
const articleViewed = asyncHandler(async (req, res, next) => {
  const { articleId } = req.params;

  let article = await dbUtil.Article.findOne({ where: { id: articleId } });

  if (article === null) {
    return next(new ErrorResponse('Cannot find article', httpStatus.NOT_FOUND, 'NOT_FOUND'));
  }

  await article.increment('views', { by: 1 });

  res.status(httpStatus.OK).json({});
});

/**
 * @api {POST} /article Post Article
 * @apiGroup Articles
 * @apiName ArticlesPost
 *
 * @apiDescription Post an article.
 *
 * @apiBody {Number} [id] Article's id
 * @apiBody {String} title Article's title
 * @apiBody {String} image Article's image
 * @apiBody {String} content Article's content
 * @apiBody {Boolean} published Article's published state
 *
 * @apiPermission Private
 */
const postArticle = asyncHandler(async (req, res, next) => {
  res.status(httpStatus.OK).json({});
});

export { getArticle, getArticlesByCategory, getArticlesByCategoryMeta, articleViewed, postArticle };

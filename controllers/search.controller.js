import httpStatus from 'http-status-codes';
import { Op, Sequelize } from 'sequelize';

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
 *
 * @apiSuccess (Success (200)) {Number} id The message id
 * @apiSuccess (Success (200)) {String} content The message content
 * @apiSuccess (Success (200)) {Date} date The message date
 * @apiSuccess (Success (200)) {Object} discussion The discussion where the message was posted
 * @apiSuccess (Success (200)) {Object} forum The forum where the message was posted
 *
 * @apiSuccessExample Success Example
 * [
 *   {
 *     "id": 39,
 *     "content": "Rhoncus aenean vel elit scelerisque mauris pellentesque pulvinar pellentesque habitant. Morbi quis commodo odio aenean sed adipiscing. Egestas purus viverra accumsan in. Magna fringilla urna porttitor rhoncus dolor purus. Fusce ut placerat orci nulla pellentesque dignissim enim sit. Ut etiam sit amet nisl purus. Iaculis urna id volutpat lacus laoreet. Amet cursus sit amet dictum sit. Placerat duis ultricies lacus sed. Aenean vel elit scelerisque mauris pellentesque. At tellus at urna condimentum mattis pellentesque id nibh tortor. Nunc pulvinar sapien et ligula. Amet risus nullam eget felis eget nunc lobortis mattis aliquam. Amet porttitor eget dolor morbi non arcu risus quis. Malesuada nunc vel risus commodo. In aliquam sem fringilla ut. Cursus sit amet dictum sit.",
 *     "date": "2024-05-18T10:38:32.137Z",
 *     "discussion": {
 *       "id": 6,
 *       "name": "L'impact de la globalisation",
 *       "page": 1
 *     },
 *     "forum": {
 *       "label": "politique",
 *       "name": "Politique"
 *     }
 *   }
 * ]
 *
 * @apiError (Error (400)) NO_QUERY There is no query parameter
 *
 * @apiPermission Public
 */
const searchDiscussions = asyncHandler(async (req, res, next) => {
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

  const messages = (
    await dbUtil.Message.findAll({
      attributes: ['id', 'content', 'date'],
      include: {
        model: dbUtil.Discussion,
        include: {
          model: dbUtil.Forum,
          required: true
        },
        required: true
      },
      where: {
        content: { [Op.iLike]: `%${query}%` }
      },
      raw: true
    })
  ).map((message) => ({
    id: message.id,
    content: message.content,
    date: message.date,
    discussion: {
      id: message['Discussion.id'],
      name: message['Discussion.name']
    },
    forum: {
      label: message['Discussion.Forum.label'],
      name: message['Discussion.Forum.name']
    }
  }));

  for (const message of messages) {
    const nbPreviousMessages = await dbUtil.Message.count({
      where: { discussion_id: message.discussion.id, id: { [Op.lt]: message.id } }
    });
    let page = nbPreviousMessages / PAGE_LIMIT;

    if (Number.isInteger(page)) {
      page++;
    } else {
      page = Math.ceil(page);
    }

    message.discussion.page = page;
  }

  res.status(httpStatus.OK).json(messages);
});

/**
 * @api {GET} /search/discussions/meta Search Discussions Meta Informations
 * @apiGroup Search
 * @apiName SearchDiscussionsMeta
 *
 * @apiDescription Get meta information for search discussions query.
 *
 * @apiQuery {String} query The search query
 *
 * @apiSuccess (Success (200)) {Number} totalMessages The number of found messages
 * @apiSuccess (Success (200)) {Number} nbPages The number of pages on the search page
 *
 * @apiSuccessExample Success Example
 * {
 *   "totalMessages": 93,
 *   "nbPages": 5
 * }
 *
 * @apiError (Error (400)) NO_QUERY There is no query parameter
 *
 * @apiPermission Public
 */
const searchDiscussionsMeta = asyncHandler(async (req, res, next) => {
  const validationError = validatorUtil.validate(req);

  if (validationError) {
    return next(validationError);
  }

  const { query } = req.query;
  const totalMessages = await dbUtil.Message.count({
    where: {
      content: { [Op.iLike]: `%${query}%` }
    }
  });
  const nbPages = Math.ceil(totalMessages / PAGE_LIMIT);

  res.status(httpStatus.OK).json({ totalMessages, nbPages });
});

export { searchArticles, searchArticlesMeta, searchDiscussions, searchDiscussionsMeta };

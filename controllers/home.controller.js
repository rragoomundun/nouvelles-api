import httpStatus from 'http-status-codes';
import { Op } from 'sequelize';

import asyncHandler from '../middlewares/async.middleware.js';

import dbUtil from '../utils/db.util.js';

/**
 * @api {GET} /home/content Get Home Content
 * @apiGroup Home
 * @apiName HomeContent
 *
 * @apiDescription Get homepage content: front articles, most readed articles, recent articles
 *
 * @apiPermission Public
 */
const getContent = asyncHandler(async (req, res, next) => {
  // Front page
  const frontPageArticlesData = (
    await dbUtil.FrontPage.findAll({
      attributes: ['article_id', 'position']
    })
  ).map((frontPageArticle) => frontPageArticle.dataValues);
  const frontPageArticlesIds = frontPageArticlesData.map((frontPageArticle) => frontPageArticle.article_id);
  const frontPageArticles = (
    await dbUtil.Article.findAll({
      attributes: ['id', 'title', 'image', 'category_id'],
      include: [
        {
          model: dbUtil.Category,
          required: true
        }
      ],
      where: {
        id: {
          [Op.in]: frontPageArticlesIds
        }
      }
    })
  )
    .map((article) => ({
      id: article.dataValues.id,
      title: article.dataValues.title,
      image: article.dataValues.image,
      category: article.dataValues.Category.label
    }))
    .sort((article1, article2) => {
      const article1Position = frontPageArticlesData.find((article) => article.article_id === article1.id).position;
      const article2Position = frontPageArticlesData.find((article) => article.article_id === article2.id).position;

      return article1Position - article2Position;
    });

  // Recent articles
  const categories = (await dbUtil.Category.findAll({ order: [['position', 'ASC']] })).map(
    (category) => category.dataValues
  );
  const articlesByCategories = [];

  for (let category of categories) {
    const articleByCategory = {
      category: {
        label: category.label,
        name: category.name
      },
      articles: []
    };

    const articles = await dbUtil.Article.findAll({
      attributes: ['id', 'title', 'image'],
      where: {
        category_id: {
          [Op.eq]: category.id
        }
      },
      order: [
        ['date', 'DESC'],
        ['views', 'DESC']
      ],
      limit: 4
    });

    articleByCategory.articles = articles;

    articlesByCategories.push(articleByCategory);
  }

  // Most viewed recent articles
  const mostViewedArticles = (
    await dbUtil.Article.findAll({
      attributes: ['id', 'title', 'image'],
      include: [
        {
          model: dbUtil.Category,
          required: true
        }
      ],
      order: [
        ['date', 'DESC'],
        ['views', 'DESC']
      ],
      limit: 9
    })
  ).map((article) => ({
    id: article.dataValues.id,
    title: article.dataValues.title,
    image: article.dataValues.image,
    category: article.dataValues.Category.label
  }));

  res.status(httpStatus.OK).json({
    frontArticles: frontPageArticles,
    articlesByCategories,
    mostViewedArticles
  });
});

export { getContent };

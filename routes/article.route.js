import express from 'express';

import { getArticle, getArticlesByCategory, getArticlesByCategoryMeta } from '../controllers/article.controller.js';

import { articleByCategoryValidator } from '../validators/article.validator.js';

const router = express.Router();

router
  .get('/:articleId', getArticle)
  .get('/by-category', articleByCategoryValidator, getArticlesByCategory)
  .get('/by-category/meta', articleByCategoryValidator, getArticlesByCategoryMeta);

export default router;

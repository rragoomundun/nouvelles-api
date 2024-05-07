import express from 'express';

import {
  getArticle,
  articleViewed,
  getArticlesByCategory,
  getArticlesByCategoryMeta,
  postArticle,
  isArticleCurrentUserOwner
} from '../controllers/article.controller.js';

import { articleByCategoryValidator } from '../validators/article.validator.js';

import { protect, protectRole } from '../middlewares/auth.middleware.js';

const router = express.Router();

router
  .get('/by-category', articleByCategoryValidator, getArticlesByCategory)
  .get('/by-category/meta', articleByCategoryValidator, getArticlesByCategoryMeta)
  .get('/:articleId', getArticle)
  .put('/:articleId/viewed', articleViewed)
  .post('/', protect, protectRole(['admin', 'redacteur']), postArticle)
  .get('/:articleId/is-user-owner', protect, isArticleCurrentUserOwner);

export default router;

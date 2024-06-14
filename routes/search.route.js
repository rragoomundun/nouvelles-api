import express from 'express';

import { searchArticles, searchArticlesMeta, searchDiscussions } from '../controllers/search.controller.js';

import { searchArticlesValidator, searchArticlesMetaValidator } from '../validators/search.validator.js';

const router = express.Router();

router
  .get('/articles', searchArticlesValidator, searchArticles)
  .get('/articles/meta', searchArticlesMetaValidator, searchArticlesMeta)
  .get('/discussions', searchDiscussions);

export default router;

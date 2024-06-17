import express from 'express';

import {
  searchArticles,
  searchArticlesMeta,
  searchDiscussions,
  searchDiscussionsMeta
} from '../controllers/search.controller.js';

import {
  searchArticlesValidator,
  searchArticlesMetaValidator,
  searchDiscussionsValidator,
  searchDiscussionsMetaValidator
} from '../validators/search.validator.js';

const router = express.Router();

router
  .get('/articles', searchArticlesValidator, searchArticles)
  .get('/articles/meta', searchArticlesMetaValidator, searchArticlesMeta)
  .get('/discussions', searchDiscussionsValidator, searchDiscussions)
  .get('/discussions/meta', searchDiscussionsMetaValidator, searchDiscussionsMeta);

export default router;

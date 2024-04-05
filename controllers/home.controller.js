import httpStatus from 'http-status-codes';

import asyncHandler from '../middlewares/async.middleware.js';

import dbUtil from '../utils/db.util.js';

/**
 * @api {GET} /home/content Get Home Content
 * @apiGroup Home
 * @apiName HomeContent
 *
 * @apiDescription Get homepage content
 *
 * @apiPermission Public
 */
const getContent = asyncHandler(async (req, res, next) => {
  res.status(httpStatus.OK).json({});
});

export { getContent };

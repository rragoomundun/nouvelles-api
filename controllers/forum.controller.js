import httpStatus from 'http-status-codes';

import asyncHandler from '../middlewares/async.middleware.js';

import ErrorResponse from '../classes/errorResponse.class.js';

import dbUtil from '../utils/db.util.js';

/**
 * @api {GET} /forum/list List All Forums
 * @apiGroup Forum
 * @apiName ForumList
 *
 * @apiDescription Get the list of forums.
 *
 * @apiSuccess (Success (200)) {Number} id The forum id
 * @apiSuccess (Success (200)) {String} label The forum label
 * @apiSuccess (Success (200)) {String} name The forum name
 *
 * @apiSuccessExample Success Example
 * [
 *   {
 *     "id": 1,
 *     "label": "general",
 *     "name": "Général"
 *   },
 *   {
 *     "id": 2,
 *     "label": "politique",
 *     "name": "Politique"
 *   },
 *   {
 *     "id": 3,
 *     "label": "science",
 *     "name": "Science"
 *   }
 * ]
 *
 * @apiPermission Public
 */
const getForums = asyncHandler(async (req, res, next) => {
  const forums = await dbUtil.Forum.findAll({ raw: true });
  res.status(httpStatus.OK).json(forums);
});

export { getForums };

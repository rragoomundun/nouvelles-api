import httpStatus from 'http-status-codes';

import asyncHandler from '../middlewares/async.middleware.js';

import ErrorResponse from '../classes/errorResponse.class.js';

import dbUtil from '../utils/db.util.js';
import validatorUtil from '../utils/validator.util.js';

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

/**
 * @api {POST} /forum/discussion New Discussion
 * @apiGroup Forum
 * @apiName ForumNewDiscussion
 *
 * @apiDescription Create a new discussion
 *
 * @apiBody {String} name The discussion name
 * @apiBody {String} message The discussion first message
 * @apiBody {String} forum The forum of the discussion
 *
 * @apiParamExample {json} Body Example
 * {
 *   "name": "The impact of globalization",
 *   "message": "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
 *   "forum": "politique"
 * }
 *
 * @apiSuccess (Success (200)) {Number} id The discussion id
 * @apiSuccess (Success (200)) {String} name The discussion name
 *
 * @apiSuccessExample Success Example
 * {
 *   "id": 28,
 *   "name": "The impact of globalization"
 * }
 *
 * @apiError (Error (400)) NO_NAME There is no name for the discussion
 * @apiError (Error (400)) NAME_IS_USE A discussion with this name already exists
 * @apiError (Error (400)) NO_MESSAGE There is no message
 * @apiError (Error (400)) NO_FORUM There is no forum
 * @apiError (Error (400)) FORUM_INCORRECT The specified forum is incorrect
 *
 * @apiPermission Private
 */
const newDiscussion = asyncHandler(async (req, res, next) => {
  const validationError = validatorUtil.validate(req);

  if (validationError) {
    return next(validationError);
  }

  const { name, message, forum } = req.body;

  let result;

  try {
    result = await dbUtil.sequelize.transaction(async (transaction) => {
      const forumData = await dbUtil.Forum.findOne({ where: { label: forum }, raw: true }, { transaction });
      const discussion = await dbUtil.Discussion.create(
        { name, forum_id: forumData.id, user_id: req.user.id },
        { transaction }
      );
      await dbUtil.Message.create(
        { content: message, discussion_id: discussion.dataValues.id, user_id: req.user.id },
        { transaction }
      );

      return { id: discussion.dataValues.id, name };
    });
  } catch {
    return next(new ErrorResponse('Cannot create discussion', httpStatus.INTERNAL_SERVER_ERROR));
  }

  res.status(httpStatus.CREATED).json(result);
});

export { getForums, newDiscussion };

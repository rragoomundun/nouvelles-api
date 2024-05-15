import { body, param } from 'express-validator';

import dbUtil from '../utils/db.util.js';

const newDiscussionValidator = [
  body('name')
    .notEmpty()
    .withMessage('Please add a name;NO_NAME')
    .custom(async (value) => {
      const nameExists = await dbUtil.Discussion.findOne({ where: { name: value } });

      if (nameExists) {
        throw new Error('A discussion with this name already exists;NAME_IN_USE');
      }
    }),
  body('message').notEmpty().withMessage('Please add a message;NO_MESSAGE'),
  body('forum')
    .notEmpty()
    .withMessage('Please specify a forum;NO_FORUM')
    .custom(async (value) => {
      const forumExists = await dbUtil.Forum.findOne({ where: { label: value } });

      if (forumExists === null) {
        throw new Error('The forum does not exists;FORUM_INCORRECT');
      }
    })
];

const answerDiscussionValidator = [
  param('id').custom(async (value) => {
    const discussionExists = await dbUtil.Discussion.findOne({ where: { id: value } });

    if (discussionExists === null) {
      throw new Error('This discussion does not exists;DISCUSSION_INCORRECT');
    }
  }),
  body('message').notEmpty().withMessage('Please add a message;NO_MESSAGE')
];

export { newDiscussionValidator, answerDiscussionValidator };

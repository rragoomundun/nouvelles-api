import httpStatus from 'http-status-codes';

import asyncHandler from '../middlewares/async.middleware.js';

import dbUtil from '../utils/db.util.js';

/**
 * @api {GET} /category/all Get All Categories
 * @apiGroup Categories
 * @apiName CategoriesGetAll
 *
 * @apiDescription Get all categories
 *
 * @apiSuccess (Success (200)) {Number} id The category id
 * @apiSuccess (Success (200)) {String} name The category name
 * @apiSuccess (Success (200)) {String} label The category label
 * @apiSuccess (Success (200)) {Number} position The category position
 *
 * @apiSuccessExample Success Example
 * [
 *   {
 *     "id": 1,
 *     "name": "Politique",
 *     "label": "politique",
 *     "position": 0
 *   },
 *   {
 *     "id": 1,
 *     "name": "Economie",
 *     "label": "economie",
 *     "position": 1
 *   }
 * ]
 *
 * @apiPermission Public
 */
const getAllCategories = asyncHandler(async (req, res, next) => {
  const categories = await dbUtil.Category.findAll();
  const categoriesSorted = categories.sort((category1, category2) => category1.position - category2.position);

  res.status(httpStatus.OK).json(categoriesSorted);
});

export { getAllCategories };

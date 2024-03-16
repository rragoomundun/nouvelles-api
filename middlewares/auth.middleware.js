import jwt from 'jsonwebtoken';
import httpStatus from 'http-status-codes';

import asyncHandler from './async.middleware.js';

import ErrorResponse from '../classes/errorResponse.class.js';

import dbUtil from '../utils/db.util.js';

// Prevent unauthorized users from accessing route
const protect = asyncHandler(async (req, res, next) => {
  try {
    const { token } = req.cookies;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await dbUtil.User.findOne({ where: { id: decoded.id } });

    next();
  } catch {
    return next(new ErrorResponse('Unauthorized', httpStatus.UNAUTHORIZED));
  }
});

export { protect };

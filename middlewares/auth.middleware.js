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

    const user = await dbUtil.User.findOne({
      include: [
        {
          model: dbUtil.Role,
          required: true
        }
      ],
      where: { id: decoded.id }
    });
    const { id, email, registration_date, name } = user.dataValues;

    req.user = {
      id,
      email,
      registration_date,
      name,
      roles: user.dataValues.Roles.map((role) => role.label)
    };

    next();
  } catch {
    return next(new ErrorResponse('Unauthorized', httpStatus.UNAUTHORIZED));
  }
});

// Prevent users that don't have at least one role from accessing route
const protectRole = (roles) => {
  return asyncHandler(async (req, res, next) => {
    for (const role of roles) {
      if (req.user.roles.includes(role)) {
        return next();
      }
    }

    next(new ErrorResponse('Unauthorized', httpStatus.UNAUTHORIZED));
  });
};

export { protect, protectRole };

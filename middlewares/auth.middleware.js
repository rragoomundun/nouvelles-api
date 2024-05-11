import jwt from 'jsonwebtoken';
import httpStatus from 'http-status-codes';

import asyncHandler from './async.middleware.js';

import ErrorResponse from '../classes/errorResponse.class.js';

import dbUtil from '../utils/db.util.js';

// Get user from token
const getUser = async (req) => {
  let user;

  try {
    const { token } = req.cookies;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user2 = await dbUtil.User.findOne({
      include: [
        {
          model: dbUtil.Role,
          required: true
        }
      ],
      where: { id: decoded.id }
    });
    const { id, email, registration_date, name } = user2.dataValues;

    user = {
      id,
      email,
      registration_date,
      name,
      roles: user2.dataValues.Roles.map((role) => role.label)
    };
  } catch {
    throw new Error();
  }

  return user;
};

// Set user in the request object
const setUser = asyncHandler(async (req, res, next) => {
  try {
    const user = await getUser(req);

    req.user = user;
  } catch {
    throw null;
  }

  next();
});

// Prevent unauthorized users from accessing route
const protect = asyncHandler(async (req, res, next) => {
  try {
    const user = await getUser(req);

    req.user = user;

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

export { setUser, protect, protectRole };

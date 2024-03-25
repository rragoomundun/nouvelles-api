import { validationResult } from 'express-validator';
import httpStatus from 'http-status-codes';

import ErrorResponse from '../classes/errorResponse.class.js';

const validate = (req) => {
  const result = validationResult(req);

  if (result.isEmpty()) {
    return null;
  }

  const error = result.array()[0].msg.split(';');

  return new ErrorResponse(error[0], httpStatus.BAD_REQUEST, error[1]);
};

export default { validate };

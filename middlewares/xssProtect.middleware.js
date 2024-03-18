import htmlUtil from '../utils/html.util.js';

const xssProtectMiddleware = (req, res, next) => {
  for (const key in req.body) {
    req.body[key] = htmlUtil.sanitize(req.body[key]);
  }

  for (const key in req.query) {
    req.query[key] = htmlUtil.sanitize(req.query[key]);
  }

  for (const key in req.headers) {
    req.headers[key] = htmlUtil.sanitize(req.headers[key]);
  }

  for (const key in req.params) {
    req.params[key] = htmlUtil.sanitize(req.params[key]);
  }

  next();
};

export default xssProtectMiddleware;

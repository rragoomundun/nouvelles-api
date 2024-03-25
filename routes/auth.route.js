import express from 'express';

import {
  register,
  registerConfirm,
  login,
  logout,
  forgotPassword,
  passwordReset,
  authorized
} from '../controllers/auth.controller.js';

import {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  passwordResetValidator
} from '../validators/auth.validator.js';

import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router
  .post('/register', registerValidator, register)
  .put('/register/confirm/:confirmationToken', registerConfirm)
  .post('/login', loginValidator, login)
  .get('/logout', logout)
  .post('/password/forgot', forgotPasswordValidator, forgotPassword)
  .put('/password/reset/:resetPasswordToken', passwordResetValidator, passwordReset)
  .get('/authorized', protect, authorized);

export default router;

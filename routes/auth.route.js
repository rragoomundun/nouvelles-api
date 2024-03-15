import express from 'express';

import { register, registerConfirm, login, logout, authorized } from '../controllers/auth.controller.js';

import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router
  .post('/register', register)
  .put('/register/confirm/:confirmationToken', registerConfirm)
  .post('/login', login)
  .get('/logout', logout)
  .get('/authorized', protect, authorized);

export default router;

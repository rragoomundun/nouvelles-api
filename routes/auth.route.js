import express from 'express';

import { register, registerConfirm, login, logout } from '../controllers/auth.controller.js';

const router = express.Router();

router
  .post('/register', register)
  .put('/register/confirm/:confirmationToken', registerConfirm)
  .post('/login', login)
  .get('/logout', logout);

export default router;

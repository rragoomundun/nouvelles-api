import express from 'express';

import { register, registerConfirm, login } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/register', register).put('/register/confirm/:confirmationToken', registerConfirm).post('/login', login);

export default router;

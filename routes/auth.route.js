import express from 'express';

import { register, registerConfirm } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/register', register).put('/register/confirm/:confirmationToken', registerConfirm);

export default router;

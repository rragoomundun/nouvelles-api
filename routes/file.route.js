import express from 'express';

import { upload } from '../files/upload.js';

import { deleteFile, uploadFile } from '../controllers/file.controller.js';

import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', protect, upload.single('file'), uploadFile).delete('/', protect, deleteFile);

export default router;

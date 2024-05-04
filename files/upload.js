import multer from 'multer';

const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  const allowedMIMETypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  if (allowedMIMETypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({ storage, fileFilter, limits: 1024 * 1024 * 10 });

export { upload };

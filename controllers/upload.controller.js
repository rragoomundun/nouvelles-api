import httpStatus from 'http-status-codes';
import AWS from 'aws-sdk';

import asyncHandler from '../middlewares/async.middleware.js';

import ErrorResponse from '../classes/errorResponse.class.js';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

/**
 * @api {POST} /upload Upload File
 * @apiGroup Upload
 * @apiName UploadUpload
 *
 * @apiDescription Upload a file to S3. File size limited to 10 MB.
 *
 * @apiBody {File{10}} file The file to be uploaded.
 *
 * @apiError (Error (400)) UPLOAD_FAILED Cannot upload file
 *
 * @apiPermission Private
 */
const uploadFile = asyncHandler(async (req, res, next) => {
  const { file } = req;
  const params = {
    Bucket: process.env.AWS_S3_IMAGE_BUCKET_NAME,
    Key: `${process.env.AWS_S3_IMAGE_BUCKET_FOLDER}/${req.user.id}/${req.user.name}/${Date.now()}.${
      file.mimetype.split('/')[1]
    }`,
    Body: file.buffer,
    ContentType: file.mimetype
  };

  try {
    await s3.upload(params).promise();
    res.status(httpStatus.OK).json({ file: `https://${process.env.AWS_S3_IMAGE_BUCKET_NAME}/${params.Key}` });
  } catch {
    return next(new ErrorResponse('Cannot upload file', httpStatus.BAD_REQUEST, 'UPLOAD_FAILED'));
  }
});

export { uploadFile };

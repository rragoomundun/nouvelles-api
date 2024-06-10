import httpStatus from 'http-status-codes';
import AWS from 'aws-sdk';

import asyncHandler from '../middlewares/async.middleware.js';

import ErrorResponse from '../classes/errorResponse.class.js';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

/**
 * @api {POST} /file Upload File
 * @apiGroup File
 * @apiName FileUpload
 *
 * @apiDescription Upload a file to S3. File size limited to 10 MB.
 *
 * @apiBody {File{10}} file The file to be uploaded.
 * @apiBody {String} [fileName] The name of the file.
 *
 * @apiError (Error (400)) UPLOAD_FAILED Cannot upload file
 *
 * @apiPermission Private
 */
const uploadFile = asyncHandler(async (req, res, next) => {
  const { file } = req;
  const { fileName } = req.body;
  let key = `${process.env.AWS_S3_IMAGE_BUCKET_FOLDER}/${req.user.id}/${req.user.name}/`;

  if (fileName) {
    key += fileName;
  } else {
    key += Date.now();
  }

  key += `.${file.mimetype.split('/')[1]}`;

  const params = {
    Bucket: process.env.AWS_S3_IMAGE_BUCKET_NAME,
    Key: key,
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

/**
 * @api {DELETE} /file Delete File
 * @apiGroup File
 * @apiName FileDelete
 *
 * @apiDescription Delete a file from S3.
 *
 * @apiBody {String} fileName The path to the file.
 *
 * @apiError (Error (400)) DELETION_FAILED Cannot delete file
 *
 * @apiPermission Private
 */
const deleteFile = asyncHandler(async (req, res, next) => {
  const { fileName } = req.body;
  const params = {
    Bucket: process.env.AWS_S3_IMAGE_BUCKET_NAME,
    Key: fileName
  };

  try {
    await s3.deleteObject(params).promise();
    res.status(httpStatus.OK).end();
  } catch {
    return next(new ErrorResponse('Cannot delete file', httpStatus.BAD_REQUEST, 'DELETION_FAILED'));
  }
});

export { uploadFile, deleteFile };

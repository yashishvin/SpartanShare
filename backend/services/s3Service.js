// backend/services/s3Service.js
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const s3 = new AWS.S3();

// Configure multer for file uploads to S3
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET_NAME,
    acl: 'private', // Files will be private by default
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      // Create a unique file key with user ID as prefix for organization
      const userId = req.user.id;
      const timestamp = Date.now();
      const uniqueFilename = `${userId}/${timestamp}-${file.originalname}`;
      
      cb(null, uniqueFilename);
    }
  }),
  limits: {
    fileSize: 100 * 1024 * 1024 // 100 MB limit
  }
});

// Generate a signed URL for temporary access to a file
const getSignedUrl = (key, expires = 3600) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
    Expires: expires // URL expiration time in seconds
  };
  
  return s3.getSignedUrl('getObject', params);
};

// Delete a file from S3
const deleteFile = async (key) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key
  };
  
  return s3.deleteObject(params).promise();
};

module.exports = {
  upload,
  getSignedUrl,
  deleteFile,
  s3
};
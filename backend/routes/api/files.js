// backend/routes/api/files.js
const express = require('express');
const router = express.Router();
const fileController = require('../../controllers/fileController');
const auth = require('../../middleware/auth');
const s3Service = require('../../services/s3Service');

// Upload file route with S3 upload middleware
router.post(
  '/upload',
  auth,
  s3Service.upload.single('file'),
  fileController.uploadFile
);

// Create folder route
router.post('/folder', auth, fileController.createFolder);

// Get files route (with optional folder filter)
router.get('/', auth, fileController.getFiles);

// Get shared files route
router.get('/shared', auth, fileController.getSharedFiles);

// Get file download URL
router.get('/download/:id', auth, fileController.getFileUrl);

// Share a file with another user
router.post('/:id/share', auth, fileController.shareFile);

// Delete file or move to trash
router.delete('/:id', auth, fileController.deleteFile);

// Toggle star status
router.patch('/:id/star', auth, fileController.toggleStar);

module.exports = router;
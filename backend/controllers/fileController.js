// backend/controllers/fileController.js
const File = require('../models/File');
const User = require('../models/User');
const s3Service = require('../services/s3Service');
const pdfService = require('../services/pdfService');

// Upload a file
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }
    
    // Create file entry in database
    const file = new File({
      name: req.file.originalname,
      type: req.file.mimetype,
      size: req.file.size,
      path: req.file.key, // S3 file key
      owner: req.user.id,
      parent: req.body.parent || null
    });
    
    await file.save();
    
    res.status(201).json({
      success: true,
      file: {
        id: file._id,
        name: file.name,
        type: file.type,
        size: file.size,
        path: file.path,
        owner: req.user.id,
        parent: file.parent,
        isFolder: file.isFolder,
        starred: file.starred,
        createdAt: file.createdAt,
        updatedAt: file.updatedAt
      }
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during file upload' 
    });
  }
};

// Create a folder
exports.createFolder = async (req, res) => {
  try {
    const { name, parent } = req.body;
    
    if (!name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Folder name is required' 
      });
    }
    
    // Create folder in database
    const folder = new File({
      name,
      type: 'folder',
      size: 0,
      path: `folders/${req.user.id}/${Date.now()}-${name}`,
      owner: req.user.id,
      parent: parent || null,
      isFolder: true
    });
    
    await folder.save();
    
    res.status(201).json({
      success: true,
      folder: {
        id: folder._id,
        name: folder.name,
        type: folder.type,
        size: folder.size,
        path: folder.path,
        owner: req.user.id,
        parent: folder.parent,
        isFolder: folder.isFolder,
        starred: folder.starred,
        createdAt: folder.createdAt,
        updatedAt: folder.updatedAt
      }
    });
  } catch (error) {
    console.error('Folder creation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during folder creation' 
    });
  }
};

// Get files (with folder filtering)
exports.getFiles = async (req, res) => {
  try {
    const { parent } = req.query;
    
    // Build query base
    const query = {};
    
    // Filter by parent folder if specified
    if (parent) {
      query.parent = parent;
    } else {
      query.parent = null; // Root files/folders
    }
    
    // Filter by ownership OR shared with user
    query.$or = [
      { owner: req.user.id },
      { 'sharedWith.user': req.user.id }
    ];

    //Ensure that flags marked for deletion are not listed
    query.deleted = false;
    
    // Execute query and populate owner details
    const files = await File.find(query)
      .populate('owner', 'name email')
      .populate('sharedWith.user', 'name email')
      .sort({ isFolder: -1, name: 1 });
    
    res.json({
      success: true,
      files: files.map(file => ({
        id: file._id,
        name: file.name,
        type: file.type,
        size: file.size,
        path: file.path,
        owner: file.owner,
        parent: file.parent,
        isFolder: file.isFolder,
        starred: file.starred,
        sharedWith: file.sharedWith,
        createdAt: file.createdAt,
        updatedAt: file.updatedAt
      }))
    });
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error when retrieving files' 
    });
  }
};

// Get shared files
exports.getSharedFiles = async (req, res) => {
  try {
    // Find files shared with the user
    const files = await File.find({
      'sharedWith.user': req.user.id
    })
      .populate('owner', 'name email')
      .populate('sharedWith.user', 'name email')
      .sort({ updatedAt: -1 });
    
    res.json({
      success: true,
      files: files.map(file => ({
        id: file._id,
        name: file.name,
        type: file.type,
        size: file.size,
        path: file.path,
        owner: file.owner,
        parent: file.parent,
        isFolder: file.isFolder,
        starred: file.starred,
        sharedWith: file.sharedWith,
        createdAt: file.createdAt,
        updatedAt: file.updatedAt
      }))
    });
  } catch (error) {
    console.error('Get shared files error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error when retrieving shared files' 
    });
  }
};

// Get file download URL
exports.getFileUrl = async (req, res) => {
  try {
    const fileId = req.params.id;
    
    // Find file in database
    const file = await File.findById(fileId);
    
    if (!file) {
      return res.status(404).json({ 
        success: false, 
        message: 'File not found' 
      });
    }
    
    // Check if user has access
    const isOwner = file.owner.toString() === req.user.id;
    const isShared = file.sharedWith.some(share => 
      share.user.toString() === req.user.id
    );
    
    if (!isOwner && !isShared) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }
    
    // Don't generate URLs for folders
    if (file.isFolder) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot generate URL for folders' 
      });
    }
    
    // Generate a signed URL for file download
    const url = s3Service.getSignedUrl(file.path);
    
    res.json({
      success: true,
      url
    });
  } catch (error) {
    console.error('Get file URL error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error when generating file URL' 
    });
  }
};

// Share a file with another user
exports.shareFile = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, permission } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }
    
    // Validate permission
    if (permission && !['viewer', 'editor'].includes(permission)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid permission. Must be viewer or editor.' 
      });
    }
    
    // Find the file to share
    const file = await File.findById(id);
    
    if (!file) {
      return res.status(404).json({ 
        success: false, 
        message: 'File not found' 
      });
    }
    
    // Check if user is the owner
    if (file.owner.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only the owner can share this file' 
      });
    }
    
    // Find user to share with
    const userToShare = await User.findOne({ email });
    
    if (!userToShare) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Don't share with yourself
    if (userToShare._id.toString() === req.user.id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot share with yourself' 
      });
    }
    
    // Check if already shared with this user
    const alreadyShared = file.sharedWith.find(
      share => share.user.toString() === userToShare._id.toString()
    );
    
    if (alreadyShared) {
      // Update permission if different
      if (alreadyShared.permission !== permission) {
        alreadyShared.permission = permission || 'viewer';
        await file.save();
      }
    } else {
      // Add new share
      file.sharedWith.push({
        user: userToShare._id,
        permission: permission || 'viewer'
      });
      await file.save();
    }
    
    res.json({
      success: true,
      message: `File shared with ${userToShare.email}`,
      file: {
        id: file._id,
        name: file.name,
        sharedWith: file.sharedWith
      }
    });
  } catch (error) {
    console.error('Share file error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error when sharing file' 
    });
  }
};

// Delete file or move to trash
// backend/controllers/fileController.js

// Update the deleteFile function to move to trash
exports.deleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the file
    const file = await File.findById(id);
  
    if (!file) {
      return res.status(404).json({ 
        success: false, 
        message: 'File not found' 
      });
    }
    
    // Check if user has permission
    const isOwner = file.owner.toString() === req.user.id;
    const isEditor = file.sharedWith.some(share => 
      share.user.toString() === req.user.id && share.permission === 'editor'
    );
    
    if (!isOwner && !isEditor) {
      return res.status(403).json({ 
        success: false, 
        message: 'You do not have permission to delete this file' 
      });
    }
    
    // If permanent deletion is requested
    if (req.query.permanent === 'true') {
      // If it's a folder, delete all children first
      if (file.isFolder) {
        await deleteAllChildren(file._id, req.user.id, true);
      }
      
      // Delete from S3 if it's a file
      if (!file.isFolder) {
        await s3Service.deleteFile(file.path);
      }
      
      // Delete from database
      await File.findByIdAndDelete(id);
      
      res.json({
        success: true,
        message: 'File permanently deleted'
      });
    } else {
      // Move to trash - set deleted flag and timestamp
      // If it's a folder, move all children to trash as well
      if (file.isFolder) {
        await moveAllChildrenToTrash(file._id, req.user.id);
      }
      
      file.deleted = true;
      file.deletedAt = new Date();
      await file.save();
      
      res.json({
        success: true,
        message: 'File moved to trash'
      });
    }
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error when deleting file' 
    });
  }
};

// Helper function to delete all children of a folder
const deleteAllChildren = async (folderId, userId, permanent = false) => {
  // Find all files with this folder as parent
  const childFiles = await File.find({ parent: folderId });
  
  for (const childFile of childFiles) {
    // Recursively handle subfolders
    if (childFile.isFolder) {
      await deleteAllChildren(childFile._id, userId, permanent);
    }
    
    // Delete file from S3 if it's not a folder and permanent deletion is requested
    if (!childFile.isFolder && permanent) {
      await s3Service.deleteFile(childFile.path);
    }
    
    if (permanent) {
      // Permanently delete from database
      await File.findByIdAndDelete(childFile._id);
    } else {
      // Move to trash
      childFile.deleted = true;
      childFile.deletedAt = new Date();
      await childFile.save();
    }
  }
};

// Helper function to move all children to trash
const moveAllChildrenToTrash = async (folderId, userId) => {
  const childFiles = await File.find({ parent: folderId });
  
  for (const childFile of childFiles) {
    // Recursively handle subfolders
    if (childFile.isFolder) {
      await moveAllChildrenToTrash(childFile._id, userId);
    }
    
    // Move to trash
    childFile.deleted = true;
    childFile.deletedAt = new Date();
    await childFile.save();
  }
};

// Add a new function to get files in trash
exports.getTrash = async (req, res) => {
  try {
    // Find all files marked as deleted for this user
    const files = await File.find({
      owner: req.user.id,
      deleted: true
    })
      .populate('owner', 'name email')
      .sort({ deletedAt: -1 });

     // Filter to show only top-level deleted items
    // (items whose parent is not deleted or doesn't exist)
    const topLevelDeletedFiles = files.filter(file => {
      // Keep if it has no parent (null/undefined)
      if (!file.parent) {
        console.log('The file id is' + file._id);
        console.log('The parent', file.parent);
        return true;
      }
      
      // Keep if parent exists but is not deleted
      if (file.parent && !file.parent.deleted) {
        console.log('The file id is' + file._id);
        console.log('The parent deleted', file.parent.deleted);
        return true;
      }
      
      // Otherwise, it's a child of a deleted folder, so hide it
      return false;
    });

    res.json({
      success: true,
      files: topLevelDeletedFiles.map(file => ({
        id: file._id,
        name: file.name,
        type: file.type,
        size: file.size,
        path: file.path,
        owner: file.owner,
        isFolder: file.isFolder,
        deletedAt: file.deletedAt
      }))
    });
  } catch (error) {
    console.error('Get trash error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error when retrieving trash' 
    });
  }
};

// Add a function to restore files from trash
exports.restoreFile = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the file
    const file = await File.findById(id);
    
    if (!file) {
      return res.status(404).json({ 
        success: false, 
        message: 'File not found' 
      });
    }
    
    // Check if user is the owner
    if (file.owner.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only the owner can restore this file' 
      });
    }
    
    // Check if file is in trash
    if (!file.deleted) {
      return res.status(400).json({ 
        success: false, 
        message: 'File is not in trash' 
      });
    }
    
    // Restore the file
    file.deleted = false;
    file.deletedAt = null;
    await file.save();
    
    // If it's a folder, restore all children as well
    if (file.isFolder) {
      await restoreAllChildren(file._id, req.user.id);
    }
    
    res.json({
      success: true,
      message: 'File restored from trash'
    });
  } catch (error) {
    console.error('Restore file error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error when restoring file' 
    });
  }
};

// Helper function to restore all children from trash
const restoreAllChildren = async (folderId, userId) => {
  const childFiles = await File.find({ 
    parent: folderId,
    owner: userId,
    deleted: true
  });
  
  for (const childFile of childFiles) {
    // Restore the file
    childFile.deleted = false;
    childFile.deletedAt = null;
    await childFile.save();
    
    // Recursively handle subfolders
    if (childFile.isFolder) {
      await restoreAllChildren(childFile._id, userId);
    }
  }
};

// Add a function to empty trash
exports.emptyTrash = async (req, res) => {
  try {
    // Find all files in trash for this user
    const files = await File.find({
      owner: req.user.id,
      deleted: true
    });
    
    // Delete files from S3 and database
    for (const file of files) {
      if (!file.isFolder) {
        await s3Service.deleteFile(file.path);
      }
      await File.findByIdAndDelete(file._id);
    }
    
    res.json({
      success: true,
      message: 'Trash emptied successfully'
    });
  } catch (error) {
    console.error('Empty trash error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error when emptying trash' 
    });
  }
};

// Toggle star status
exports.toggleStar = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the file
    const file = await File.findById(id);
    
    if (!file) {
      return res.status(404).json({ 
        success: false, 
        message: 'File not found' 
      });
    }
    
    // Check if user has access
    const isOwner = file.owner.toString() === req.user.id;
    const isShared = file.sharedWith.some(share => 
      share.user.toString() === req.user.id
    );
    
    if (!isOwner && !isShared) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }
    
    // Toggle star status
    file.starred = !file.starred;
    await file.save();
    
    res.json({
      success: true,
      starred: file.starred
    });
  } catch (error) {
    console.error('Toggle star error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error when toggling star status' 
    });
  }
};

// backend/controllers/fileController.js


// Create PDF summary endpoint
exports.summarizePDF = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the file
    const file = await File.findById(id);
    
    if (!file) {
      return res.status(404).json({ 
        success: false, 
        message: 'File not found' 
      });
    }
    
    // Check if user has access
    const isOwner = file.owner.toString() === req.user.id;
    const isShared = file.sharedWith.some(share => 
      share.user.toString() === req.user.id
    );
    
    if (!isOwner && !isShared) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }
    
    // Check if it's a PDF
    if (!file.type.includes('pdf')) {
      return res.status(400).json({ 
        success: false, 
        message: 'Only PDF files can be summarized' 
      });
    }
    
    // Check if summary already exists and is not too old (1 week)
    const ONE_WEEK = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    if (
      file.summary && 
      file.summary.generated && 
      file.summary.generatedAt && 
      (new Date() - new Date(file.summary.generatedAt)) < ONE_WEEK
    ) {
      return res.json({
        success: true,
        summary: {
          mainPoints: file.summary.mainPoints,
          summary: file.summary.summaryText,
          topics: file.summary.topics
        }
      });
    }
    
    // Generate summary
    const summary = await pdfService.generatePDFSummary(file.path);
    
    // Update file with summary
    file.summary = {
      mainPoints: summary.mainPoints,
      summaryText: summary.summary,
      topics: summary.topics,
      generated: true,
      generatedAt: new Date()
    };
    
    await file.save();
    
    res.json({
      success: true,
      summary: {
        mainPoints: summary.mainPoints,
        summary: summary.summary,
        topics: summary.topics
      }
    });
  } catch (error) {
    console.error('PDF summarization error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during PDF summarization' 
    });
  }
};

// Trigger summary generation on PDF upload
exports.handlePDFUpload = (fileId, filePath) => {
  // Trigger in background (don't await)
  if (filePath && filePath.endsWith('.pdf')) {
    pdfService.generatePDFSummary(filePath)
      .then(summary => {
        // Update the file with the summary
        File.findByIdAndUpdate(fileId, {
          summary: {
            mainPoints: summary.mainPoints,
            summaryText: summary.summary,
            topics: summary.topics,
            generated: true,
            generatedAt: new Date()
          }
        }).catch(err => {
          console.error('Error updating file with summary:', err);
        });
      })
      .catch(err => {
        console.error('Background PDF summarization error:', err);
      });
  }
};

// Modify your uploadFile function to trigger PDF summary generation
const originalUploadFile = exports.uploadFile;
exports.uploadFile = async (req, res) => {
  try {
    // Call the original upload function
    await originalUploadFile(req, res);
    
    // If it's a PDF, trigger summary generation
    if (req.file && req.file.mimetype.includes('pdf') && res.locals.fileId) {
      exports.handlePDFUpload(res.locals.fileId, req.file.key);
    }
  } catch (error) {
    console.error('Upload file error:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        success: false, 
        message: 'Server error during file upload' 
      });
    }
  }
};
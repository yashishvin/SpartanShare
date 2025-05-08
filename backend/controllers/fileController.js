// backend/controllers/fileController.js
const File = require('../models/File');
const User = require('../models/User');
const s3Service = require('../services/s3Service');

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
    
    // If it's a folder, we need to delete all children too
    if (file.isFolder) {
      // Find all files with this folder as parent
      const childFiles = await File.find({ parent: file._id });
      
      // Recursively delete all children
      for (const childFile of childFiles) {
        if (childFile.isFolder) {
          // Call this function recursively
          await this.deleteFile({
            params: { id: childFile._id },
            user: req.user,
            query: { permanent: req.query.permanent }
          }, { status: () => ({ json: () => {} }) });
        } else if (req.query.permanent === 'true') {
          // Delete from S3 if permanent deletion
          await s3Service.deleteFile(childFile.path);
          await File.findByIdAndDelete(childFile._id);
        } else {
          // Otherwise just update the "deleted" status
          childFile.deleted = true;
          childFile.deletedAt = new Date();
          await childFile.save();
        }
      }
    }
    
    // If permanent deletion is requested
    if (req.query.permanent === 'true') {
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
      // Otherwise, just mark as deleted (move to trash)
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
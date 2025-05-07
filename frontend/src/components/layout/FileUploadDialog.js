// src/components/dialogs/FileUploadDialog.js
import React, { useState, useRef } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Box, LinearProgress, IconButton,
  List, ListItem, ListItemText, ListItemIcon, ListItemSecondaryAction
} from '@mui/material';
import { 
  CloudUpload as CloudUploadIcon,
  Close as CloseIcon,
  InsertDriveFile as FileIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { uploadFile } from '../../services/fileService';

const FileUploadDialog = ({ open, onClose, currentFolder, onUploadComplete }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({});
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  // Handle drag events
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('drag-active');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('drag-active');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('drag-active');
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  };

  // Add files to state
  const addFiles = (newFiles) => {
    const filesArray = Array.from(newFiles).map(file => ({
      file,
      id: Date.now() + Math.random().toString(36).substring(2, 9)
    }));
    setFiles(prev => [...prev, ...filesArray]);
  };

  // Handle file input change
  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
    }
  };

  // Remove a file from the list
  const removeFile = (id) => {
    setFiles(files.filter(file => file.id !== id));
  };

  // Format file size
  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Handle upload
  const handleUpload = async () => {
    if (files.length === 0) return;
    
    setUploading(true);
    const newProgress = {};
    const newErrors = {};
    
    for (const { file, id } of files) {
      try {
        newProgress[id] = 0;
        setProgress({ ...newProgress });
        
        await uploadFile(file, currentFolder, (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          newProgress[id] = percentCompleted;
          setProgress({ ...newProgress });
        });
        
        newProgress[id] = 100;
        setProgress({ ...newProgress });
      } catch (error) {
        console.error(`Error uploading file ${file.name}:`, error);
        newErrors[id] = error.message || 'Upload failed';
        setErrors({ ...newErrors });
      }
    }
    
    setUploading(false);
    
    // If no errors, close dialog and notify parent
    if (Object.keys(newErrors).length === 0) {
      onUploadComplete();
      onClose();
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setFiles([]);
      setProgress({});
      setErrors({});
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Upload Files</Typography>
          <IconButton onClick={handleClose} disabled={uploading}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {/* Drag & Drop Area */}
        <Box
          sx={{
            border: '2px dashed',
            borderColor: 'primary.main',
            borderRadius: 2,
            p: 3,
            mb: 3,
            textAlign: 'center',
            backgroundColor: 'action.hover',
            '&.drag-active': {
              backgroundColor: 'action.selected',
            }
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
        >
          <input
            type="file"
            multiple
            ref={fileInputRef}
            onChange={handleFileInput}
            style={{ display: 'none' }}
          />
          <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>Drag & Drop Files Here</Typography>
          <Typography variant="body2" color="textSecondary">
            or click to browse files
          </Typography>
        </Box>

        {/* File List */}
        {files.length > 0 && (
          <List>
            {files.map(({ file, id }) => (
              <ListItem key={id}>
                <ListItemIcon>
                  <FileIcon />
                </ListItemIcon>
                <ListItemText 
                  primary={file.name} 
                  secondary={formatSize(file.size)} 
                />
                {uploading ? (
                  <Box sx={{ width: '40%', mr: 2 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={progress[id] || 0} 
                    />
                    <Typography variant="caption">
                      {progress[id] || 0}%
                    </Typography>
                    {errors[id] && (
                      <Typography variant="caption" color="error">
                        {errors[id]}
                      </Typography>
                    )}
                  </Box>
                ) : (
                  <ListItemSecondaryAction>
                    <IconButton edge="end" onClick={() => removeFile(id)}>
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                )}
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={handleClose} 
          disabled={uploading}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleUpload} 
          color="primary" 
          disabled={files.length === 0 || uploading}
          variant="contained"
        >
          {uploading ? 'Uploading...' : `Upload ${files.length} Files`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FileUploadDialog;
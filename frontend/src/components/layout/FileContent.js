// src/components/dashboard/FilesContent.js
import React, { useState } from 'react';
import { 
  Box, Grid, Paper, Typography, List, ListItem, ListItemIcon, 
  ListItemText, ListItemSecondaryAction, IconButton, Menu, MenuItem,
  CircularProgress, Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  FolderOutlined, InsertDriveFileOutlined, MoreVertOutlined,
  StarOutline, ShareOutlined
} from '@mui/icons-material';
import FileCard from './FileCard';
import FileListItem from './FileListItem';

const FilesContent = ({ files, loading, viewMode, selectedFile, onFileSelect, onGetSummary }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuFile, setMenuFile] = useState(null);

  const handleMenuClick = (event, file) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setMenuFile(file);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuFile(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (files.length === 0) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        flexGrow: 1,
        p: 3
      }}>
        <FolderOutlined sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h6" color="text.primary">No files here yet</Typography>
        <Typography variant="body2" color="text.secondary">
          Upload files using the upload button or create a new folder
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, flexGrow: 1, overflow: 'auto' }}>
      {viewMode === 'grid' ? (
        <Grid container spacing={2}>
          {files.map(file => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={file.id}>
              <FileCard 
                file={file}
                selected={selectedFile === file.id}
                onClick={() => onFileSelect(file.id)}
                onMenuClick={(e) => handleMenuClick(e, file)}
                onGetSummary={onGetSummary}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper elevation={1}>
          <List>
            {files.map(file => (
              <FileListItem
                key={file.id}
                file={file}
                selected={selectedFile === file.id}
                onClick={() => onFileSelect(file.id)}
                onMenuClick={(e) => handleMenuClick(e, file)}
                onGetSummary={onGetSummary}
              />
            ))}
          </List>
        </Paper>
      )}

      {/* File action menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>Download</MenuItem>
        <MenuItem onClick={handleMenuClose}>Share</MenuItem>
        <MenuItem onClick={handleMenuClose}>Rename</MenuItem>
        <MenuItem onClick={handleMenuClose}>Move to trash</MenuItem>
      </Menu>
    </Box>
  );
};

export default FilesContent;
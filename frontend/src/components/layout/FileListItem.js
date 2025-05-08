// src/components/dashboard/FileListItem.js
import React from 'react';
import { 
  ListItem, ListItemIcon, ListItemText, ListItemSecondaryAction,
  Typography, IconButton, Tooltip, Box
} from '@mui/material';
import { 
  FolderOutlined, InsertDriveFileOutlined, MoreVertOutlined,
  StarOutline, ShareOutlined
} from '@mui/icons-material';

const FileListItem = ({ file, selected, onClick, onMenuClick, onGetSummary }) => {
  const getFileIcon = () => {
    switch(file.type) {
      case 'folder':
        return <FolderOutlined sx={{ color: '#E5A823' }} />;
      case 'pdf':
        return <InsertDriveFileOutlined sx={{ color: '#f44336' }} />;
      case 'docx':
        return <InsertDriveFileOutlined sx={{ color: '#2196f3' }} />;
      case 'pptx':
        return <InsertDriveFileOutlined sx={{ color: '#ff9800' }} />;
      default:
        return <InsertDriveFileOutlined sx={{ color: '#757575' }} />;
    }
  };

  const isPdf = () => file.type === 'pdf';

  return (
    <ListItem 
      button
      selected={selected}
      onClick={onClick}
    >
      <ListItemIcon>
        {getFileIcon()}
      </ListItemIcon>
      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {file.name}
            {file.starred && (
              <StarOutline 
                fontSize="small" 
                sx={{ ml: 0.5, color: '#E5A823' }} 
              />
            )}
          </Box>
        }
        secondary={`${file.owner} • ${file.lastModified}`}
      />
      <Typography variant="body2" color="text.secondary" sx={{ mx: 2 }}>
        {file.size}
      </Typography>
      <ListItemSecondaryAction>
        {isPdf() && (
          <Tooltip title="Get Summary">
            <IconButton 
              edge="end" 
              onClick={(e) => {
                e.stopPropagation();
                onGetSummary(file.id);
              }}
              sx={{ mr: 1 }}
            >
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
                <line x1="4" y1="10" x2="20" y2="10"></line>
                <line x1="10" y1="4" x2="10" y2="20"></line>
              </svg>
            </IconButton>
          </Tooltip>
        )}
        <IconButton edge="end" onClick={onMenuClick}>
          <MoreVertOutlined />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

export default FileListItem;
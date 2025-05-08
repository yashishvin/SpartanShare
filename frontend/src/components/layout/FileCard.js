// src/components/dashboard/FileCard.js
import React from 'react';
import { Box, Paper, Typography, IconButton, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  FolderOutlined, InsertDriveFileOutlined, MoreVertOutlined,
  StarOutline, ShareOutlined
} from '@mui/icons-material';

const StyledFileCard = styled(Paper)(({ theme, selected }) => ({
  padding: theme.spacing(2),
  cursor: 'pointer',
  transition: 'all 0.2s',
  border: selected ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
  height: '100%',
  display: 'flex',
  flexDirection: 'column'
}));

const FileCard = ({ file, selected, onClick, onMenuClick, onGetSummary }) => {
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
    <StyledFileCard 
      selected={selected}
      onClick={onClick}
      elevation={1}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {getFileIcon()}
          {file.starred && (
            <StarOutline 
              fontSize="small" 
              sx={{ ml: 0.5, color: '#E5A823' }} 
            />
          )}
        </Box>
        <Box>
          {isPdf() && (
            <Tooltip title="Get Summary">
              <IconButton 
                size="small" 
                onClick={(e) => {
                  e.stopPropagation();
                  onGetSummary(file.id);
                }}
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
          <IconButton 
            size="small"
            onClick={onMenuClick}
          >
            <MoreVertOutlined fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      <Typography variant="body2" noWrap>{file.name}</Typography>
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          mt: 'auto', 
          pt: 1,
          fontSize: '0.75rem',
          color: 'text.secondary'
        }}
      >
        <Typography variant="caption">{file.lastModified}</Typography>
        <Typography variant="caption">{file.size}</Typography>
      </Box>
      {file.shared && (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mt: 1,
          fontSize: '0.75rem',
          color: 'text.secondary'
        }}>
          <ShareOutlined fontSize="small" sx={{ mr: 0.5, fontSize: '0.875rem' }} />
          <Typography variant="caption">Shared</Typography>
        </Box>
      )}
    </StyledFileCard>
  );
};

export default FileCard;
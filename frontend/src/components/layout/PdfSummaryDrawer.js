// src/components/dashboard/PdfSummaryDrawer.js
import React from 'react';
import { 
  Drawer, Box, Typography, IconButton, Paper, Chip,
  CircularProgress
} from '@mui/material';
import { CloseOutlined, InsertDriveFileOutlined } from '@mui/icons-material';

const PdfSummaryDrawer = ({ open, onClose, loading, data }) => {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        width: 320,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 320,
          boxSizing: 'border-box',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">PDF Summary</Typography>
          <IconButton onClick={onClose}>
            <CloseOutlined />
          </IconButton>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
            <CircularProgress size={40} sx={{ mb: 2 }} />
            <Typography>Generating summary...</Typography>
          </Box>
        ) : data && (
          <>
            <Box sx={{ display: 'flex', mb: 2 }}>
              <InsertDriveFileOutlined sx={{ color: '#f44336', mr: 1 }} />
              <Box>
                <Typography variant="subtitle2">{data.fileName}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {data.fileSize} • Last modified {data.lastModified}
                </Typography>
              </Box>
            </Box>
            
            <Paper sx={{ bgcolor: '#e3f2fd', p: 2, mb: 2 }}>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                Key Points
              </Typography>
              <ul style={{ paddingLeft: '1.5rem', margin: 0 }}>
                {data.keyPoints.map((point, index) => (
                  <li key={index}>
                    <Typography variant="body2">{point}</Typography>
                  </li>
                ))}
              </ul>
            </Paper>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Summary
              </Typography>
              <Typography variant="body2">
                {data.summary}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Main Topics
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {data.topics.map((topic, index) => (
                  <Chip
                    key={index}
                    label={topic}
                    size="small"
                    sx={{ 
                      bgcolor: '#e3f2fd', 
                      color: 'primary.main',
                      fontSize: '0.75rem'
                    }}
                  />
                ))}
              </Box>
            </Box>
          </>
        )}
      </Box>
    </Drawer>
  );
};

export default PdfSummaryDrawer;
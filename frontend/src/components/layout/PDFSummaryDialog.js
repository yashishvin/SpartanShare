
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Divider,
  IconButton
} from '@mui/material';
import { 
  Close as CloseIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { getPDFSummary } from '../../services/fileService';

const PDFSummaryDialog = ({ open, onClose, file }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (open && file) {
      fetchSummary();
    }
  }, [open, file]);
  
  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError('');
      
      const summaryData = await getPDFSummary(file.id);
      setSummary(summaryData);
    } catch (err) {
      console.error('Error fetching PDF summary:', err);
      setError('Failed to generate summary. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            PDF Summary: {file?.name}
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4 }}>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography>Generating summary... This may take a moment.</Typography>
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : summary ? (
          <Box>
            <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="h6" gutterBottom color="primary">
                Main Points
              </Typography>
              <ul>
                {summary.mainPoints.map((point, index) => (
                  <li key={index}>
                    <Typography variant="body1">{point}</Typography>
                  </li>
                ))}
              </ul>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom color="primary">
                Summary
              </Typography>
              <Typography variant="body1">
                {summary.summary}
              </Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box>
              <Typography variant="h6" gutterBottom color="primary">
                Key Topics
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {summary.topics.map((topic, index) => (
                  <Chip 
                    key={index} 
                    label={topic} 
                    color="primary" 
                    variant="outlined" 
                  />
                ))}
              </Box>
            </Box>
          </Box>
        ) : (
          <Typography>No summary available</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {!loading && error && (
          <Button color="primary" onClick={fetchSummary}>
            Try Again
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default PDFSummaryDialog;
// src/components/layout/DocumentPreview.js
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  IconButton, 
  Typography, 
  CircularProgress,
  Tooltip,
  Tabs,
  Tab
} from '@mui/material';
import {
  Close as CloseIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Info as InfoIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { getFileUrl } from '../../services/fileService';

// PDF Viewer component
const PDFViewer = ({ fileUrl }) => {
  const [useGoogleViewer, setUseGoogleViewer] = useState(true);
  const [loading, setLoading] = useState(true);
  
  const handleIframeLoad = () => {
    setLoading(false);
  };
  
  const toggleViewer = () => {
    setUseGoogleViewer(!useGoogleViewer);
    setLoading(true);
  };
  
  return (
    <Box sx={{ height: '100%', width: '100%', position: 'relative' }}>
      {loading && (
        <Box sx={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: 'background.paper',
          zIndex: 1
        }}>
          <CircularProgress />
        </Box>
      )}
      
      <iframe 
        src={useGoogleViewer 
          ? `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`
          : `${fileUrl}#toolbar=0&navpanes=0&view=FitH`
        }
        style={{ width: '100%', height: '100%', border: 'none' }}
        title="PDF Preview"
        onLoad={handleIframeLoad}
      />
      
      <Box sx={{ position: 'absolute', bottom: 16, right: 16, zIndex: 2 }}>
        <Button 
          variant="outlined" 
          size="small" 
          onClick={toggleViewer}
          sx={{ bgcolor: 'background.paper' }}
        >
          Switch to {useGoogleViewer ? 'Direct' : 'Google'} Viewer
        </Button>
      </Box>
    </Box>
  );
};

// Image Viewer component
const ImageViewer = ({ fileUrl }) => {
  return (
    <Box 
      sx={{ 
        height: '100%', 
        width: '100%', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        p: 2
      }}
    >
      <img 
        src={fileUrl} 
        alt="Preview" 
        style={{ 
          maxWidth: '100%', 
          maxHeight: '100%', 
          objectFit: 'contain' 
        }} 
      />
    </Box>
  );
};

// Word/Text Document Viewer (fallback to a placeholder)
const DocViewer = ({ fileUrl, fileName }) => {
  return (
    <Box 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center',
        p: 4,
        backgroundColor: '#f8f9fa',
        borderRadius: 1
      }}
    >
      <DescriptionIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
      <Typography variant="h6" gutterBottom>
        {fileName}
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom align="center">
        This file type cannot be previewed directly.
      </Typography>
      <Button 
        variant="contained" 
        startIcon={<DownloadIcon />}
        sx={{ mt: 2 }}
        href={fileUrl}
        target="_blank"
      >
        Download to View
      </Button>
    </Box>
  );
};

// File Information Tab
const FileInfoTab = ({ file }) => {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
        File Information
      </Typography>
      
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Name:
        </Typography>
        <Typography variant="body2">
          {file.name}
        </Typography>
        
        <Typography variant="body2" color="text.secondary">
          Type:
        </Typography>
        <Typography variant="body2">
          {file.type || 'Unknown'}
        </Typography>
        
        <Typography variant="body2" color="text.secondary">
          Size:
        </Typography>
        <Typography variant="body2">
          {file.size ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : 'Unknown'}
        </Typography>
        
        <Typography variant="body2" color="text.secondary">
          Created:
        </Typography>
        <Typography variant="body2">
          {file.createdAt ? new Date(file.createdAt).toLocaleString() : 'Unknown'}
        </Typography>
        
        <Typography variant="body2" color="text.secondary">
          Modified:
        </Typography>
        <Typography variant="body2">
          {file.updatedAt ? new Date(file.updatedAt).toLocaleString() : 'Unknown'}
        </Typography>
        
        {file.owner && (
          <>
            <Typography variant="body2" color="text.secondary">
              Owner:
            </Typography>
            <Typography variant="body2">
              {file.owner.name || 'You'}
            </Typography>
          </>
        )}
      </Box>
    </Box>
  );
};

// Summary Tab (for PDF files)
const SummaryTab = ({ file }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        // This would be your API call to get the summary
        // For example:
        // const response = await fetch(`/api/files/${file.id}/summary`);
        // const data = await response.json();
        
        // For now we'll simulate a summary
        await new Promise(resolve => setTimeout(resolve, 1500));
        setSummary({
          summary: "This is a sample summary of the document content. In a real implementation, this would be generated by the backend using AI or other summarization techniques.",
          mainPoints: [
            "First key point from the document.",
            "Second important concept covered in the text.",
            "Third significant idea discussed in the paper.",
            "Fourth notable section of the document.",
            "Fifth relevant insight from the content."
          ],
          topics: ["sample", "document", "summary", "preview", "feature"]
        });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching summary:', err);
        setError('Failed to load document summary');
        setLoading(false);
      }
    };
    
    if (file && file.type && file.type.includes('pdf')) {
      fetchSummary();
    } else {
      setError('Summary is only available for PDF documents');
      setLoading(false);
    }
  }, [file]);
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
        Document Summary
      </Typography>
      
      <Typography variant="body2" paragraph>
        {summary.summary}
      </Typography>
      
      <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
        Key Points:
      </Typography>
      <ul>
        {summary.mainPoints.map((point, index) => (
          <li key={index}>
            <Typography variant="body2">{point}</Typography>
          </li>
        ))}
      </ul>
      
      <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
        Main Topics:
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
        {summary.topics.map((topic, index) => (
          <Box 
            key={index}
            sx={{
              backgroundColor: 'primary.light',
              color: 'primary.contrastText',
              px: 1.5,
              py: 0.5,
              borderRadius: 4,
              fontSize: '0.75rem'
            }}
          >
            {topic}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

// Main Document Preview Component
const DocumentPreview = ({ open, onClose, file }) => {
  const [fileUrl, setFileUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);
  
  useEffect(() => {
    const fetchFileUrl = async () => {
      if (!file) return;
      
      try {
        setLoading(true);
        // Get file URL from your service
        const url = await getFileUrl(file.id);
        setFileUrl(url);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching file URL:', err);
        setError('Failed to load file preview');
        setLoading(false);
      }
    };
    
    if (open && file) {
      fetchFileUrl();
    }
  }, [open, file]);
  
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };
  
  const getFileViewer = () => {
    if (!file || loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress />
        </Box>
      );
    }
    
    if (error) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error">{error}</Typography>
        </Box>
      );
    }
    
    const type = file.type?.toLowerCase() || '';
    
    if (type.includes('pdf')) {
      return <PDFViewer fileUrl={fileUrl} />;
    } else if (type.includes('image') || type.includes('jpeg') || type.includes('jpg') || type.includes('png') || type.includes('gif')) {
      return <ImageViewer fileUrl={fileUrl} />;
    } else {
      return <DocViewer fileUrl={fileUrl} fileName={file.name} />;
    }
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="md"
      sx={{ 
        '& .MuiDialog-paper': { 
          height: '80vh', 
          display: 'flex', 
          flexDirection: 'column' 
        } 
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
        <Typography variant="h6" noWrap sx={{ maxWidth: '70%' }}>
          {file?.name || 'File Preview'}
        </Typography>
        <Box>
          <Tooltip title="Download">
            <IconButton 
              size="small" 
              onClick={() => window.open(fileUrl, '_blank')}
              disabled={!fileUrl}
            >
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Share">
            <IconButton size="small">
              <ShareIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Close">
            <IconButton size="small" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </DialogTitle>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={currentTab} onChange={handleTabChange} aria-label="Document tabs">
          <Tab label="Preview" />
          <Tab label="Information" />
          {file?.type?.includes('pdf') && <Tab label="Summary" />}
        </Tabs>
      </Box>
      
      <DialogContent sx={{ p: 0, flex: 1, overflow: 'auto' }}>
        {currentTab === 0 && getFileViewer()}
        {currentTab === 1 && <FileInfoTab file={file} />}
        {currentTab === 2 && file?.type?.includes('pdf') && <SummaryTab file={file} />}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DocumentPreview;
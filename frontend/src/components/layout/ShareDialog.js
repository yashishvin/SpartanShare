// frontend/src/components/dialogs/ShareDialog.js
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  IconButton,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  Close as CloseIcon,
  ContentCopy as CopyIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { shareFile } from '../../services/fileService';

const ShareDialog = ({ open, onClose, file }) => {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState('viewer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  
  // Generate a shareable link (This would typically be a short URL or direct link)
  const shareableLink = `${window.location.origin}/share/${file?.id}`;
  // frontend/src/components/dialogs/ShareDialog.js (continued)
  // Handle share with email
  const handleShare = async () => {
    if (!email) {
      setError('Email is required');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const result = await shareFile(file.id, email, permission);
      
      setSuccess(`File shared with ${email}`);
      setEmail('');
      
    } catch (err) {
      setError(err.response?.data?.message || 'Error sharing file');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle copy link to clipboard
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableLink);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Share "{file?.name}"</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {/* Share with specific user */}
        <Typography variant="subtitle1" gutterBottom>
          Share with a user
        </Typography>
        
        <Box display="flex" mb={3}>
          <TextField
            label="Email address"
            variant="outlined"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            size="small"
            sx={{ mr: 1 }}
          />
          <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Permission</InputLabel>
            <Select
              value={permission}
              onChange={(e) => setPermission(e.target.value)}
              label="Permission"
            >
              <MenuItem value="viewer">Viewer</MenuItem>
              <MenuItem value="editor">Editor</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            color="primary"
            onClick={handleShare}
            disabled={loading}
            sx={{ ml: 1 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Share'}
          </Button>
        </Box>
        
        {/* Error and success messages */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}
        
        {/* Shareable link */}
        <Typography variant="subtitle1" gutterBottom>
          Get a shareable link
        </Typography>
        <Box 
          display="flex" 
          alignItems="center"
          border={1}
          borderColor="divider"
          borderRadius={1}
          p={1}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              flexGrow: 1, 
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              mr: 1
            }}
          >
            {shareableLink}
          </Typography>
          <IconButton onClick={handleCopyLink} color={copySuccess ? "success" : "default"}>
            {copySuccess ? <CheckIcon /> : <CopyIcon />}
          </IconButton>
        </Box>
        <Typography variant="caption" color="text.secondary">
          Only users with SJSU email addresses can access this link
        </Typography>
        
        {/* Currently shared with */}
        {file?.sharedWith && file.sharedWith.length > 0 && (
          <Box mt={3}>
            <Typography variant="subtitle1" gutterBottom>
              Shared with
            </Typography>
            {file.sharedWith.map((share) => (
              <Box 
                key={share.user.id} 
                display="flex" 
                justifyContent="space-between"
                alignItems="center"
                py={1}
                borderBottom={1}
                borderColor="divider"
              >
                <Typography variant="body2">
                  {share.user.email}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {share.permission === 'editor' ? 'Editor' : 'Viewer'}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShareDialog;
// frontend/src/components/dialogs/CreateFolderDialog.js
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress
} from '@mui/material';
import { createFolder } from '../../services/fileService';

const CreateFolderDialog = ({ open, onClose, parentFolder, onFolderCreated }) => {
  const [folderName, setFolderName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleCreate = async () => {
    if (!folderName.trim()) {
      setError('Folder name is required');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      await createFolder(folderName, parentFolder);
      setFolderName('');
      onFolderCreated();
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating folder');
    } finally {
      setLoading(false);
    }
  };
  
  const handleClose = () => {
    setFolderName('');
    setError('');
    onClose();
  };
  
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Folder</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Folder Name"
          fullWidth
          value={folderName}
          onChange={(e) => {
            setFolderName(e.target.value);
            setError('');
          }}
          error={!!error}
          helperText={error}
          disabled={loading}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleCreate} 
          color="primary"
          disabled={loading || !folderName.trim()}
        >
          {loading ? <CircularProgress size={24} /> : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateFolderDialog;
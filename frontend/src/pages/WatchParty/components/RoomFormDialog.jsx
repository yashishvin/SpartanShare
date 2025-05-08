import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
} from '@mui/material';

const RoomFormDialog = ({ open, onCreate, onClose }) => {
  const [userName, setUserName] = useState('');
  const [roomName, setRoomName] = useState('');

  const handleSubmit = () => {
    if (userName.trim() && roomName.trim()) {
      onCreate({ userName, roomName });
      onClose();
      // reset if you like:
      setUserName('');
      setRoomName('');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          bgcolor: '#1E1E1E',
          color: '#fff',
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: '1.25rem',
        }}
      >
        👋 Create or Join Room
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        <TextField
          label="Your Name"
          variant="filled"
          fullWidth
          margin="dense"
          placeholder="Enter your display name..."
          value={userName}
          InputLabelProps={{ sx: { color: '#8E8E93' } }}
          InputProps={{
            sx: {
              bgcolor: '#3A3A3C',
              borderRadius: 1,
              color: '#fff',
            },
          }}
          onChange={(e) => setUserName(e.target.value)}
        />

        <TextField
          label="Room Name"
          variant="filled"
          fullWidth
          margin="dense"
          placeholder="Enter room name..."
          value={roomName}
          InputLabelProps={{ sx: { color: '#8E8E93' } }}
          InputProps={{
            sx: {
              bgcolor: '#3A3A3C',
              borderRadius: 1,
              color: '#fff',
            },
          }}
          onChange={(e) => setRoomName(e.target.value)}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          variant="contained"
          fullWidth
          onClick={handleSubmit}
          sx={{
            backgroundColor: '#FF4081',
            textTransform: 'none',
            '&:hover': { backgroundColor: '#F50057' },
          }}
        >
          Go to Room&nbsp;→
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RoomFormDialog;

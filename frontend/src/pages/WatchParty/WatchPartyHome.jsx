import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Card,
  CardContent,
  TextField
} from '@mui/material';

const WatchPartyHome = () => {
  const [userName, setUserName] = useState('');
  const [roomName, setRoomName] = useState('');
  const navigate = useNavigate();

  const handleGoToRoom = () => {
    if (!userName.trim() || !roomName.trim()) return;
    localStorage.setItem('watchparty-user', userName.trim());
    navigate(`/watchparty/${roomName.trim()}`);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)',
        color: '#fff'
      }}
    >
      {/* Top bar */}
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            🎬 Watch Party
          </Typography>
          <Box>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => navigate('/dashboard')}
              sx={{ textTransform: 'none', mr: 2 }}
            >
              Dashboard
            </Button>
            <Button
              variant="contained"
              onClick={handleGoToRoom}
              sx={{
                backgroundColor: '#FF4081',
                textTransform: 'none',
                '&:hover': { backgroundColor: '#F50057' }
              }}
            >
              Go to Room →
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Centered form card */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 'calc(100vh - 64px)',
          px: 2
        }}
      >
        <Card
          sx={{
            width: '100%',
            maxWidth: 500,
            bgcolor: '#2C2C2E',
            borderRadius: 2,
            boxShadow: 3
          }}
        >
          <CardContent>
            <Typography
              variant="h5"
              align="center"
              gutterBottom
              sx={{ color: '#fff', fontWeight: 'bold' }}
            >
              Create or Join Room
            </Typography>

            <TextField
              label="Your Name"
              variant="filled"
              fullWidth
              margin="normal"
              value={userName}
              onChange={e => setUserName(e.target.value)}
              placeholder="Enter your name..."
              InputLabelProps={{ sx: { color: '#8E8E93' } }}
              InputProps={{
                sx: {
                  bgcolor: '#3A3A3C',
                  borderRadius: 1,
                  color: '#fff'
                }
              }}
            />

            <TextField
              label="Room Name"
              variant="filled"
              fullWidth
              margin="normal"
              value={roomName}
              onChange={e => setRoomName(e.target.value)}
              placeholder="Enter room name..."
              InputLabelProps={{ sx: { color: '#8E8E93' } }}
              InputProps={{
                sx: {
                  bgcolor: '#3A3A3C',
                  borderRadius: 1,
                  color: '#fff'
                }
              }}
            />

            <Button
              variant="contained"
              fullWidth
              onClick={handleGoToRoom}
              sx={{
                mt: 2,
                backgroundColor: '#FF4081',
                textTransform: 'none',
                '&:hover': { backgroundColor: '#F50057' }
              }}
            >
              Go to Room →
            </Button>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default WatchPartyHome;
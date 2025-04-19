import React from 'react';
import { Box, Typography, Button, Avatar } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <Box sx={{ 
      p: 3, 
      maxWidth: 1200, 
      margin: '0 auto' 
    }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 4 
      }}>
        <Typography variant="h4">Spartan Share Dashboard</Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            src={user?.profilePicture} 
            alt={user?.name}
            sx={{ mr: 2 }}
          />
          <Box>
            <Typography variant="body1">{user?.name}</Typography>
            <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
          </Box>
          <Button 
            variant="outlined" 
            color="error" 
            sx={{ ml: 2 }}
            onClick={logout}
          >
            Logout
          </Button>
        </Box>
      </Box>
      
      <Box sx={{ bgcolor: '#f5f5f5', p: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Welcome to Spartan Share!
        </Typography>
        <Typography variant="body1">
          This is a protected dashboard page that only authenticated SJSU users can access.
        </Typography>
      </Box>
    </Box>
  );
};

export default Dashboard;
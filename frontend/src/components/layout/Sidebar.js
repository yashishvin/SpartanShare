// src/components/dashboard/SideNavigation.js
import React from 'react';
import { 
  Drawer, Box, Button, List, ListItem, ListItemIcon,
  ListItemText, Divider, Typography, LinearProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  HomeOutlined, ShareOutlined, VideoLibraryOutlined, 
  DeleteOutlined
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const SidebarItem = styled(ListItem)(({ theme, active }) => ({
  borderRadius: 20,
  marginBottom: theme.spacing(0.5),
  backgroundColor: active ? theme.palette.action.selected : 'transparent',
  '&:hover': {
    backgroundColor: active ? theme.palette.action.selected : theme.palette.action.hover,
  }
}));

const SideNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Button 
          variant="outlined" 
          fullWidth 
          sx={{ mb: 2 }}
        >
          + New
        </Button>
        
        <List component="nav">
          <SidebarItem 
            button 
            active={isActive('/') ? 1 : 0}
            onClick={() => navigate('/')}
          >
            <ListItemIcon>
              <HomeOutlined />
            </ListItemIcon>
            <ListItemText primary="Home" />
          </SidebarItem>
          
          <SidebarItem 
            button 
            active={isActive('/shared') ? 1 : 0}
            onClick={() => navigate('/shared')}
          >
            <ListItemIcon>
              <ShareOutlined />
            </ListItemIcon>
            <ListItemText primary="Shared with me" />
          </SidebarItem>
          
          <SidebarItem 
            button 
            active={isActive('/watchparty') ? 1 : 0}
            onClick={() => navigate('/watchparty')}
          >
            <ListItemIcon>
              <VideoLibraryOutlined />
            </ListItemIcon>
            <ListItemText primary="Watch Party" />
          </SidebarItem>
          
          <SidebarItem 
            button 
            active={isActive('/trash') ? 1 : 0}
            onClick={() => navigate('/trash')}
          >
            <ListItemIcon>
              <DeleteOutlined />
            </ListItemIcon>
            <ListItemText primary="Trash" />
          </SidebarItem>
        </List>
        
        <Divider sx={{ my: 2 }} />
        
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Storage
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box sx={{ flex: 1, mr: 1 }}>
              <LinearProgress 
                variant="determinate" 
                value={88} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#E5A823'
                  }
                }} 
              />
            </Box>
            <Typography variant="caption">88%</Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            13.32 GB of 15 GB used
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
};

export default SideNavigation;
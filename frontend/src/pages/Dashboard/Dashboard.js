// src/pages/Dashboard.js - Main container component
import React, { useState,useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, IconButton, 
  Menu, MenuItem, CircularProgress,
  Grid, Paper, Divider, Tooltip,List, ListItem, 
  ListItemText, ListItemIcon
} from '@mui/material';
import {
  GridView as GridViewIcon,
  ViewList as ViewListIcon,
  Folder as FolderIcon,
  InsertDriveFile as FileIcon,
  MoreVert as MoreVertIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Share as ShareIcon,
  Delete as DeleteIcon,
  CloudDownload as DownloadIcon,
  Create as CreateIcon,
  CreateNewFolder as CreateNewFolderIcon
} from '@mui/icons-material';
import DashboardHeader from '../../components/layout/Header';
import FilesContent from '../../components/layout/FileContent';
import SideNavigation from '../../components/layout/Sidebar';
import PdfSummaryDrawer from '../../components/layout/PdfSummaryDrawer';
import FileUploadDialog from '../../components/layout/FileUploadDialog';
import ShareDialog from '../../components/layout/ShareDialog';
import CreateFolderDialog from '../../components/layout/CreateFolderDialog';


import { useFileManager } from '../../hooks/useFileManager';
import {
  getFiles,
  getSharedFiles,
  getFileUrl,
  toggleStar,
  deleteFile
} from '../../services/fileService';


const Dashboard = ({ mode = 'home' }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedFile, setSelectedFile] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [contextFile, setContextFile] = useState(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  
  const { folderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Fetch files based on current location
  useEffect(() => {
    fetchFiles();
  }, [folderId, mode, location.pathname]);
  
  const fetchFiles = async () => {
    setLoading(true);
    try {
      let fetchedFiles = [];
      
      if (mode === 'shared') {
        fetchedFiles = await getSharedFiles();
      } else {
        fetchedFiles = await getFiles(folderId);
      }
      
      setFiles(fetchedFiles);
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Get section title based on current location
  const getSectionTitle = () => {
    if (folderId) {
      const folder = files.find(f => f.id === folderId && f.isFolder);
      return folder ? folder.name : 'Folder Contents';
    }
    
    switch (mode) {
      case 'shared': return 'Shared with me';
      case 'trash': return 'Trash';
      default: return 'My Files';
    }
  };
  
  // File operations
  const handleFileClick = (file) => {
    if (file.isFolder) {
      navigate(`/folder/${file.id}`);
    } else {
      setSelectedFile(file.id === selectedFile ? null : file.id);
    }
  };
  
  const handleMenuOpen = (event, file) => {
    event.stopPropagation();
    setContextFile(file);
    setMenuAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setContextFile(null);
  };
  
  const handleDownload = async () => {
    try {
      const url = await getFileUrl(contextFile.id);
      window.open(url, '_blank');
      handleMenuClose();
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };
  
  const handleToggleStar = async (event, file) => {
    event.stopPropagation();
    try {
      await toggleStar(file.id);
      fetchFiles(); // Refresh files
    } catch (error) {
      console.error('Error toggling star:', error);
    }
  };
  
  const handleShare = () => {
    setShareDialogOpen(true);
    handleMenuClose();
  };
  
  const handleDelete = async () => {
    try {
      await deleteFile(contextFile.id);
      fetchFiles(); // Refresh files
      handleMenuClose();
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };
  
  // Dialogs
  const handleOpenUploadDialog = () => setUploadDialogOpen(true);
  const handleCloseUploadDialog = () => setUploadDialogOpen(false);
  const handleUploadComplete = () => {
    setUploadDialogOpen(false);
    fetchFiles(); // Refresh files
  };
  
  const handleOpenFolderDialog = () => setFolderDialogOpen(true);
  const handleCloseFolderDialog = () => setFolderDialogOpen(false);
  const handleFolderCreated = () => {
    setFolderDialogOpen(false);
    fetchFiles(); // Refresh files
  };
  
  // Render file icon based on type
  const getFileIcon = (file) => {
    if (file.isFolder) {
      return <FolderIcon sx={{ color: (theme) => theme.palette.secondary.main }} fontSize="large" />;
    }
    
    // Determine file type based on MIME type or extension
    const type = file.type || '';
    
    if (type.includes('pdf')) {
      return <FileIcon sx={{ color: '#f44336' }} fontSize="large" />;
    } else if (type.includes('word') || type.includes('document')) {
      return <FileIcon sx={{ color: '#2196f3' }} fontSize="large" />;
    } else if (type.includes('sheet') || type.includes('excel')) {
      return <FileIcon sx={{ color: '#4caf50' }} fontSize="large" />;
    } else if (type.includes('presentation') || type.includes('powerpoint')) {
      return <FileIcon sx={{ color: '#ff9800' }} fontSize="large" />;
    } else {
      return <FileIcon sx={{ color: '#757575' }} fontSize="large" />;
    }
  };
  
  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <SideNavigation />
      
      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflow: 'hidden'
        }}
      >
        <DashboardHeader 
          title={getSectionTitle()}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onFileUpdate={fetchFiles}
          onUploadClick={handleOpenUploadDialog}
          onCreateFolder={handleOpenFolderDialog}
        />
        
        <Box sx={{ p: 3, flexGrow: 1, overflow: 'auto' }}>
          {/* Action buttons */}
          <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<CreateNewFolderIcon />}
              onClick={handleOpenFolderDialog}
            >
              New Folder
            </Button>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<CreateIcon />}
              onClick={handleOpenUploadDialog}
            >
              Upload Files
            </Button>
          </Box>
          
          {/* Content area */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : files.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <FolderIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6">No files here yet</Typography>
              <Typography variant="body2" color="text.secondary">
                Upload files or create a new folder to get started
              </Typography>
            </Box>
          ) : viewMode === 'grid' ? (
            <Grid container spacing={2}>
              {files.map((file) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={file.id}>
                  <Paper
                    elevation={1}
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      border: (theme) => 
                        selectedFile === file.id ? 
                        `2px solid ${theme.palette.primary.main}` : 
                        '2px solid transparent',
                      '&:hover': {
                        boxShadow: 3
                      },
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                    onClick={() => handleFileClick(file)}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      {getFileIcon(file)}
                      <Box>
                        <IconButton
                          size="small"
                          onClick={(e) => handleToggleStar(e, file)}
                        >
                          {file.starred ? 
                            <StarIcon color="secondary" /> : 
                            <StarBorderIcon />
                          }
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, file)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Box>
                    </Box>
                    <Typography variant="body1" noWrap sx={{ fontWeight: 500 }}>
                      {file.name}
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mt: 'auto',
                        pt: 1,
                        color: 'text.secondary',
                        fontSize: '0.875rem'
                      }}
                    >
                      <Typography variant="caption">
                        {new Date(file.updatedAt).toLocaleDateString()}
                      </Typography>
                      {!file.isFolder && (
                        <Typography variant="caption">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </Typography>
                      )}
                    </Box>
                    {file.sharedWith && file.sharedWith.length > 0 && (
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          mt: 1,
                          color: 'text.secondary'
                        }}
                      >
                        <ShareIcon fontSize="small" sx={{ mr: 0.5 }} />
                        <Typography variant="caption">
                          Shared with {file.sharedWith.length} people
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Paper elevation={1}>
              {files.map((file, index) => (
                <React.Fragment key={file.id}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      p: 2,
                      cursor: 'pointer',
                      bgcolor: selectedFile === file.id ? 'action.selected' : '',
                      '&:hover': {
                        bgcolor: 'action.hover'
                      }
                    }}
                    onClick={() => handleFileClick(file)}
                  >
                    <Box sx={{ mr: 2 }}>
                      {getFileIcon(file)}
                    </Box>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body1" noWrap sx={{ fontWeight: 500, flexGrow: 1 }}>
                          {file.name}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={(e) => handleToggleStar(e, file)}
                        >
                          {file.starred ? 
                            <StarIcon color="secondary" /> : 
                            <StarBorderIcon />
                          }
                        </IconButton>
                      </Box>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {file.owner?.name || 'You'} • {new Date(file.updatedAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                    {!file.isFolder && (
                      <Typography variant="body2" color="text.secondary" sx={{ mx: 2 }}>
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </Typography>
                    )}
                    <Box>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, file)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  {index < files.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </Paper>
          )}
        </Box>
      </Box>
      
      {/* File menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        {!contextFile?.isFolder && (
          <MenuItem onClick={handleDownload}>
            <ListItemIcon>
              <DownloadIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Download</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={handleShare}>
          <ListItemIcon>
            <ShareIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Share</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
      
      {/* Dialogs */}
      <FileUploadDialog
        open={uploadDialogOpen}
        onClose={handleCloseUploadDialog}
        currentFolder={folderId}
        onUploadComplete={handleUploadComplete}
      />
      
      {shareDialogOpen && contextFile && (
        <ShareDialog
          open={shareDialogOpen}
          onClose={() => setShareDialogOpen(false)}
          file={contextFile}
        />
      )}
      
      <CreateFolderDialog
        open={folderDialogOpen}
        onClose={handleCloseFolderDialog}
        parentFolder={folderId}
        onFolderCreated={handleFolderCreated}
      />
    </Box>
  );
};

export default Dashboard;
// src/pages/Dashboard.js - Main container component
import React, { useState } from 'react';
import { Box } from '@mui/material';
import DashboardHeader from '../../components/layout/Header';
import FilesContent from '../../components/layout/FileContent';
import SideNavigation from '../../components/layout/Sidebar';
import PdfSummaryDrawer from '../../components/layout//PdfSummaryDrawer';
import { useFileManager } from '../../hooks/useFileManager';
import { useLocation, useParams } from 'react-router-dom';

const Dashboard = ({ mode = 'home' }) => {
  const [viewMode, setViewMode] = useState('grid');
  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  
  const location = useLocation();
  const { folderId } = useParams();
  
  // Custom hook for file management
  const {
    files,
    loading,
    selectedFile,
    setSelectedFile,
    fetchFiles,
    // Other file operations
  } = useFileManager(folderId, mode);

  // Get section title based on route
  const getSectionTitle = () => {
    switch (mode) {
      case 'shared': return 'Shared with me';
      case 'watchparty': return 'Watch Party';
      case 'trash': return 'Trash';
      default: return folderId ? 'Folder Contents' : 'My Files';
    }
  };

  // Handle PDF summary request
  const handleGetSummary = async (fileId) => {
    try {
      setSummaryLoading(true);
      setShowSummary(true);
      
      // Actual API call (commented out)
      // const response = await api.post('/files/pdf/summarize', { fileId });
      // setSummaryData(response.data);
      
      // Placeholder data for development
      const file = files.find(f => f.id === fileId);
      setSummaryData({
        fileName: file.name,
        fileSize: file.size,
        lastModified: file.lastModified,
        keyPoints: ['Key point 1', 'Key point 2', 'Key point 3'],
        summary: 'Summary text would come from actual API',
        topics: ['Topic 1', 'Topic 2', 'Topic 3']
      });
      
      setSummaryLoading(false);
    } catch (error) {
      console.error('Error getting file summary:', error);
      setSummaryLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <SideNavigation />
      
      {/* Main content */}
      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <DashboardHeader 
          title={getSectionTitle()}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
        
        <FilesContent 
          files={files}
          loading={loading}
          viewMode={viewMode}
          selectedFile={selectedFile}
          onFileSelect={setSelectedFile}
          onGetSummary={handleGetSummary}
        />
      </Box>
      
      {/* PDF Summary Drawer */}
      <PdfSummaryDrawer 
        open={showSummary}
        onClose={() => setShowSummary(false)}
        loading={summaryLoading}
        data={summaryData}
      />
    </Box>
  );
};

export default Dashboard;
import React, { useState } from 'react';
import { Search, Upload, Grid, List } from 'lucide-react'; // Added Grid and List icons
import { useAuth } from '../../context/AuthContext';

// Import FileUploadDialog
import FileUploadDialog from './FileUploadDialog';

const Header = ({ title, viewMode, onViewModeChange, onFileUpdate }) => {
  const { user, logout } = useAuth();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [currentFolder, setCurrentFolder] = useState(null);
  
  const handleOpenUploadDialog = () => setUploadDialogOpen(true);
  const handleCloseUploadDialog = () => setUploadDialogOpen(false);
  
  const handleUploadComplete = () => {
    if (onFileUpdate) {
      onFileUpdate();
    }
    handleCloseUploadDialog();
  };
  
  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };
  
  return (
    <header className="bg-sjsu-blue text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="bg-sjsu-gold text-sjsu-blue font-bold text-xl p-2 rounded">SS</div>
          <h1 className="text-xl font-bold">{title || "Spartan Share"}</h1> {/* Use the title prop */}
        </div>
        <div className="flex-1 mx-4 relative">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search files and folders..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-sjsu-gold"
            />
            <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {/* View mode toggle */}
          <div className="flex bg-blue-800 rounded-lg mr-2">
            <button 
              className={`p-2 rounded-l-lg ${viewMode === 'grid' ? 'bg-blue-700' : ''}`}
              onClick={() => onViewModeChange && onViewModeChange('grid')}
            >
              <Grid size={18} className="text-white" />
            </button>
            <button 
              className={`p-2 rounded-r-lg ${viewMode === 'list' ? 'bg-blue-700' : ''}`}
              onClick={() => onViewModeChange && onViewModeChange('list')}
            >
              <List size={18} className="text-white" />
            </button>
          </div>
          
          <button 
            className="bg-sjsu-gold hover:bg-yellow-600 text-sjsu-blue font-bold py-2 px-4 rounded-lg flex items-center space-x-1"
            onClick={handleOpenUploadDialog}
          >
            <Upload size={18} />
            <span>Upload</span>
          </button>
          <div className="relative group">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-sjsu-blue font-bold cursor-pointer">
              {getInitials(user?.name)}
            </div>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
              <div className="px-4 py-2 text-sm text-gray-700 border-b">
                <p className="font-medium">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <button 
                onClick={logout}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* File Upload Dialog */}
      {uploadDialogOpen && (
        <FileUploadDialog
          open={uploadDialogOpen}
          onClose={handleCloseUploadDialog}
          currentFolder={currentFolder}
          onUploadComplete={handleUploadComplete}
        />
      )}
    </header>
  );
};

export default Header;
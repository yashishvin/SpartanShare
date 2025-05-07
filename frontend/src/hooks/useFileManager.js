// src/hooks/useFileManager.js
import { useState, useEffect } from 'react';
import api from '../services/api';

export const useFileManager = (folderId, mode = 'home') => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let endpoint = '/files';
      
      if (mode === 'shared') {
        endpoint = '/files/shared';
      } else if (mode === 'trash') {
        endpoint = '/files/trash';
      } else if (folderId) {
        endpoint = `/files?parent=${folderId}`;
      }
      
      // Actual API call (commented out)
      // const response = await api.get(endpoint);
      // setFiles(response.data.files || []);
      
      // For development, using placeholder data
      setFiles([
        { id: 1, name: 'CS 151 Project.pdf', type: 'pdf', size: '2.4 MB', owner: 'Me', shared: true, starred: false, lastModified: '2 days ago' },
        { id: 2, name: 'SJSU Course Schedule', type: 'folder', size: '', owner: 'Me', shared: true, starred: true, lastModified: '1 week ago' },
        { id: 3, name: 'Resume Draft.docx', type: 'docx', size: '480 KB', owner: 'Me', shared: false, starred: true, lastModified: 'Yesterday' },
        { id: 4, name: 'Team Presentation.pptx', type: 'pptx', size: '5.8 MB', owner: 'Sarah Chen', shared: true, starred: false, lastModified: '4 days ago' },
        { id: 5, name: 'Research Notes', type: 'folder', size: '', owner: 'Me', shared: false, starred: false, lastModified: '3 days ago' },
        { id: 6, name: 'Midterm Study Guide.pdf', type: 'pdf', size: '1.2 MB', owner: 'Alex Johnson', shared: true, starred: true, lastModified: 'Today' }
      ]);
      
    } catch (err) {
      console.error('Error fetching files:', err);
      setError('Failed to load files');
    } finally {
      setLoading(false);
    }
  };
  
  // Upload a file
  const uploadFile = async (file, parentId = null) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      if (parentId) {
        formData.append('parent', parentId);
      }
      
      // Actual API call (commented out)
      // const response = await api.post('/files/upload', formData);
      // return response.data;
      
      // After successful upload, refresh file list
      fetchFiles();
    } catch (err) {
      console.error('Error uploading file:', err);
      throw err;
    }
  };
  
  // Create a folder
  const createFolder = async (name, parentId = null) => {
    try {
      // Actual API call (commented out)
      // const response = await api.post('/files/folder', { name, parent: parentId });
      // return response.data;
      
      // After successful creation, refresh file list
      fetchFiles();
    } catch (err) {
      console.error('Error creating folder:', err);
      throw err;
    }
  };
  
  // Delete a file or folder
  const deleteFile = async (fileId, permanently = false) => {
    try {
      // Actual API call (commented out)
      // if (permanently) {
      //   await api.delete(`/files/${fileId}/permanent`);
      // } else {
      //   await api.delete(`/files/${fileId}`); // Moves to trash
      // }
      
      // After successful deletion, refresh file list
      fetchFiles();
    } catch (err) {
      console.error('Error deleting file:', err);
      throw err;
    }
  };
  
  // Share a file
  const shareFile = async (fileId, email, permission = 'viewer') => {
    try {
      // Actual API call (commented out)
      // const response = await api.post(`/files/${fileId}/share`, { email, permission });
      // return response.data;
      
      // After successful sharing, refresh file list
      fetchFiles();
    } catch (err) {
      console.error('Error sharing file:', err);
      throw err;
    }
  };
  
  // Toggle star status
  const toggleStar = async (fileId) => {
    try {
      // Actual API call (commented out)
      // const response = await api.patch(`/files/${fileId}/star`);
      // return response.data;
      
      // After successful toggle, refresh file list
      fetchFiles();
    } catch (err) {
      console.error('Error toggling star:', err);
      throw err;
    }
  };

  // Load files when component mounts or parameters change
  useEffect(() => {
    fetchFiles();
  }, [folderId, mode]);

  return {
    files,
    loading,
    error,
    selectedFile,
    setSelectedFile,
    fetchFiles,
    uploadFile,
    createFolder,
    deleteFile,
    shareFile,
    toggleStar
  };
};
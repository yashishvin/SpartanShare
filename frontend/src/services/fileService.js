// src/services/fileService.js
import api from './api';

// Upload a file to the server
export const uploadFile = async (file, folderId = null, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  
  if (folderId) {
    formData.append('parent', folderId);
  }
  
  return api.post('/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: onProgress
  });
};

// Get a download URL for a file
export const getFileDownloadUrl = async (fileId) => {
  const response = await api.get(`/files/download/${fileId}`);
  return response.data.url;
};

// List files in a folder
export const listFiles = async (folderId = null) => {
  const url = folderId 
    ? `/files?parent=${folderId}` 
    : '/files';
    
  const response = await api.get(url);
  return response.data.files;
};

// Delete a file
export const deleteFile = async (fileId) => {
  return api.delete(`/files/${fileId}`);
};

// Share a file with another user
export const shareFile = async (fileId, email, permission) => {
  return api.post(`/files/${fileId}/share`, {
    email,
    permission
  });
};
// frontend/src/services/fileService.js
import api from './api';

// Upload a file
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
    onUploadProgress: onProgress ? 
      (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      } : undefined
  });
};

// Create a folder
export const createFolder = async (name, parentId = null) => {
  return api.post('/files/folder', {
    name,
    parent: parentId
  });
};

// Get files in a folder
export const getFiles = async (folderId = null) => {
  const url = folderId ? 
    `/files?parent=${folderId}` : 
    '/files';
  
  const response = await api.get(url);
  return response.data.files;
};

// Get shared files
export const getSharedFiles = async () => {
  const response = await api.get('/files/shared');
  return response.data.files;
};

// Get file download URL
export const getFileUrl = async (fileId) => {
  const response = await api.get(`/files/download/${fileId}`);
  return response.data.url;
};

// Share a file with another user
export const shareFile = async (fileId, email, permission = 'viewer') => {
  const response = await api.post(`/files/${fileId}/share`, {
    email,
    permission
  });
  return response.data;
};

// Delete a file
export const deleteFile = async (fileId, permanent = false) => {
  
  if (!fileId || typeof fileId !== 'string') {
    console.error('Invalid fileId:', fileId);
    throw new Error('Invalid file ID');
  }
  console.log('File ID:', fileId);
  const url = permanent ? 
    `/files/${fileId}?permanent=true` : 
    `/files/${fileId}`;
  
  const response = await api.delete(url);
  return response.data;
};

// Toggle star status
export const toggleStar = async (fileId) => {
  const response = await api.patch(`/files/${fileId}/star`);
  return response.data;
};

// Get PDF summary
export const getPDFSummary = async (fileId) => {
  const response = await api.get(`/files/${fileId}/summary`);
  return response.data.summary;
};

// Get files in trash
export const getTrash = async () => {
  const response = await api.get('/files/trash');
  return response.data.files;
};

// Restore file from trash
export const restoreFile = async (fileId) => {
  const response = await api.post(`/files/${fileId}/restore`);
  return response.data;
};

// Empty trash
export const emptyTrash = async () => {
  const response = await api.delete('/files/trash/empty');
  return response.data;
};
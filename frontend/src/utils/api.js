import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  signup: (userData) => api.post('/auth/signup', userData),
  login: (credentials) => api.post('/auth/login', credentials),
};

export const filesAPI = {
  uploadFile: (file, folderId, headers) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folderId', folderId);
    return api.post('/files/upload', formData, { headers });
  },
  createFolder: (folderName, headers) => 
    api.post('/files/folder', { folderName }, { headers }),
  getFiles: () => api.get('/files/files'),
  getFolders: () => api.get('/files/folders'),
};

export default api;
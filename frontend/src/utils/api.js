import axios from 'axios';

// Use environment variable or fallback to default
const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api`
  : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

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
  getIPFSHealth: () => api.get('/files/ipfs-health'),
};

export default api;
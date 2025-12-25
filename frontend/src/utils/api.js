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
    
    // Create a new axios instance for file uploads without default Content-Type
    const uploadApi = axios.create({
      baseURL: API_BASE_URL,
      timeout: 60000, // Longer timeout for file uploads
    });
    
    // Add auth token
    const token = localStorage.getItem('token');
    if (token) {
      uploadApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    
    // For FormData, don't set Content-Type - browser will set it with boundary
    return uploadApi.post('/files/upload', formData, {
      headers: {
        ...headers,
        // Explicitly don't set Content-Type for multipart/form-data
      }
    });
  },
  createFolder: (folderName, headers) => 
    api.post('/files/folder', { folderName }, { headers }),
  getFiles: () => api.get('/files/files'),
  getFolders: () => api.get('/files/folders'),
  getIPFSHealth: () => api.get('/files/ipfs-health'),
  /**
   * Download a file from IPFS
   * @param {string} ipfsHash - The IPFS hash (CID) of the file
   * @param {string} fileName - The original file name for the download
   * @returns {Promise} - Triggers browser download
   */
  downloadFile: async (ipfsHash, fileName) => {
    const token = localStorage.getItem('token');
    
    // Create download link
    const url = `${API_BASE_URL}/files/download/${ipfsHash}`;
    
    // Fetch file with authentication
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Download failed');
    }

    // Get file blob
    const blob = await response.blob();
    
    // Create download link and trigger download
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName || 'download';
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  },
  /**
   * Get IPFS gateway URLs for a file
   * @param {string} ipfsHash - The IPFS hash (CID) of the file
   * @param {boolean} usePublic - Whether to use public gateway
   * @returns {Promise} - Gateway URL information
   */
  getGatewayUrl: async (ipfsHash, usePublic = false) => {
    const token = localStorage.getItem('token');
    const response = await api.get(`/files/gateway/${ipfsHash}?usePublic=${usePublic}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data.data;
  },
  /**
   * View a file in browser using IPFS gateway or API
   * @param {string} ipfsHash - The IPFS hash (CID) of the file
   * @param {boolean} preferGateway - Whether to prefer gateway over API
   * @returns {Promise} - Opens file in browser
   */
  viewFile: async (ipfsHash, preferGateway = true) => {
    if (preferGateway) {
      // Try local gateway first, then public gateway
      const localGateway = `http://127.0.0.1:8080/ipfs/${ipfsHash}`;
      const publicGateway = `https://ipfs.io/ipfs/${ipfsHash}`;
      
      // Try to open local gateway first
      try {
        // Test if local gateway is accessible
        const testResponse = await fetch(localGateway, { method: 'HEAD' });
        if (testResponse.ok) {
          window.open(localGateway, '_blank');
          return;
        }
      } catch (error) {
        console.log('Local gateway not available, using public gateway');
      }
      
      // Fallback to public gateway
      window.open(publicGateway, '_blank');
    } else {
      // Use API endpoint with authentication
      const token = localStorage.getItem('token');
      const url = `${API_BASE_URL}/files/view/${ipfsHash}`;
      
      // For authenticated viewing, we need to fetch and create blob URL
      try {
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);
          window.open(blobUrl, '_blank');
        } else {
          throw new Error('Failed to load file');
        }
      } catch (error) {
        console.error('API view failed, falling back to public gateway');
        window.open(`https://ipfs.io/ipfs/${ipfsHash}`, '_blank');
      }
    }
  },
};

export default api;
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { filesAPI } from '../utils/api';
import { signMessage, formatFileSize } from '../utils/web3';
import { 
  Folder, 
  File, 
  Upload, 
  Plus, 
  Search, 
  Grid, 
  List,
  Download,
  Trash2
} from 'lucide-react';

const Dashboard = () => {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('grid');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const { user } = useAuth();

  useEffect(() => {
    loadFilesAndFolders();
  }, []);

  const loadFilesAndFolders = async () => {
    try {
      setLoading(true);
      const [filesResponse, foldersResponse] = await Promise.all([
        filesAPI.getFiles(),
        filesAPI.getFolders()
      ]);
      
      setFiles(filesResponse.data.data.files || []);
      setFolders(foldersResponse.data.data.folders || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const message = `Upload file: ${file.name} at ${Date.now()}`;
      const signature = await signMessage(message, user.walletAddress);

      const headers = {
        signature,
        message
      };

      await filesAPI.uploadFile(file, 'root', headers);
      await loadFilesAndFolders();
      setShowUploadModal(false);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      const message = `Create folder: ${newFolderName} at ${Date.now()}`;
      const signature = await signMessage(message, user.walletAddress);

      const headers = {
        signature,
        message
      };

      await filesAPI.createFolder(newFolderName, headers);
      await loadFilesAndFolders();
      setShowFolderModal(false);
      setNewFolderName('');
    } catch (error) {
      console.error('Folder creation error:', error);
      alert('Folder creation failed: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>My Drive</h1>
          <p style={styles.subtitle}>
            Welcome back, {user.email}
          </p>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.searchBox}>
            <Search size={20} />
            <input 
              type="text" 
              placeholder="Search files and folders..." 
              style={styles.searchInput}
            />
          </div>
          <div style={styles.viewControls}>
            <button 
              style={{
                ...styles.viewButton,
                ...(view === 'grid' ? styles.viewButtonActive : {})
              }}
              onClick={() => setView('grid')}
            >
              <Grid size={20} />
            </button>
            <button 
              style={{
                ...styles.viewButton,
                ...(view === 'list' ? styles.viewButtonActive : {})
              }}
              onClick={() => setView('list')}
            >
              <List size={20} />
            </button>
          </div>
          <button 
            style={styles.primaryButton}
            onClick={() => setShowFolderModal(true)}
          >
            <Plus size={20} />
            New Folder
          </button>
          <button 
            style={styles.primaryButton}
            onClick={() => setShowUploadModal(true)}
          >
            <Upload size={20} />
            Upload
          </button>
        </div>
      </div>

      <div style={styles.content}>
        {/* Folders Section */}
        {folders.length > 0 && (
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Folders</h2>
            <div style={view === 'grid' ? styles.gridView : styles.listView}>
              {folders.map((folder, index) => (
                <div key={index} style={view === 'grid' ? styles.gridItem : styles.listItem}>
                  <div style={styles.itemIcon}>
                    <Folder size={view === 'grid' ? 48 : 24} color="#667eea" />
                  </div>
                  <div style={styles.itemInfo}>
                    <h3 style={styles.itemName}>{folder.folderName}</h3>
                    <p style={styles.itemMeta}>
                      Created {new Date(parseInt(folder.createdTime) * 1000).toLocaleDateString()}
                    </p>
                  </div>
                  <div style={styles.itemActions}>
                    <button style={styles.actionButton}>
                      <Download size={16} />
                    </button>
                    <button style={styles.actionButton}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Files Section */}
        {files.length > 0 && (
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Files</h2>
            <div style={view === 'grid' ? styles.gridView : styles.listView}>
              {files.map((file, index) => (
                <div key={index} style={view === 'grid' ? styles.gridItem : styles.listItem}>
                  <div style={styles.itemIcon}>
                    <File size={view === 'grid' ? 48 : 24} color="#764ba2" />
                  </div>
                  <div style={styles.itemInfo}>
                    <h3 style={styles.itemName}>{file.fileName}</h3>
                    <p style={styles.itemMeta}>
                      {formatFileSize(parseInt(file.fileSize))} • 
                      {file.fileType} • 
                      Uploaded {new Date(parseInt(file.uploadTime) * 1000).toLocaleDateString()}
                    </p>
                    <p style={styles.ipfsHash}>
                      IPFS: {file.ipfsHash}
                    </p>
                  </div>
                  <div style={styles.itemActions}>
                    <button style={styles.actionButton}>
                      <Download size={16} />
                    </button>
                    <button style={styles.actionButton}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {files.length === 0 && folders.length === 0 && (
          <div style={styles.emptyState}>
            <File size={64} color="#ccc" />
            <h3>No files or folders yet</h3>
            <p>Upload your first file or create a folder to get started</p>
            <div style={styles.emptyStateActions}>
              <button 
                style={styles.primaryButton}
                onClick={() => setShowUploadModal(true)}
              >
                <Upload size={20} />
                Upload Files
              </button>
              <button 
                style={styles.primaryButton}
                onClick={() => setShowFolderModal(true)}
              >
                <Plus size={20} />
                Create Folder
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3>Upload File</h3>
            <p>Select a file to upload to Secure Drive 3.0</p>
            <input 
              type="file" 
              onChange={handleFileUpload}
              disabled={uploading}
              style={styles.fileInput}
            />
            {uploading && (
              <div style={styles.uploading}>
                <div className="spinner" style={styles.smallSpinner}></div>
                <span>Uploading and signing transaction...</span>
              </div>
            )}
            <div style={styles.modalActions}>
              <button 
                onClick={() => setShowUploadModal(false)}
                style={styles.secondaryButton}
                disabled={uploading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Folder Modal */}
      {showFolderModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3>Create New Folder</h3>
            <input 
              type="text" 
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Enter folder name"
              style={styles.textInput}
            />
            <div style={styles.modalActions}>
              <button 
                onClick={() => setShowFolderModal(false)}
                style={styles.secondaryButton}
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateFolder}
                style={styles.primaryButton}
                disabled={!newFolderName.trim()}
              >
                Create Folder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  headerLeft: {
    flex: 1
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap'
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '0.5rem'
  },
  subtitle: {
    color: '#666',
    fontSize: '1.1rem'
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    background: 'white',
    border: '2px solid #e1e5e9',
    borderRadius: '8px',
    padding: '8px 12px',
    minWidth: '300px'
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    marginLeft: '8px',
    fontSize: '16px',
    width: '100%'
  },
  viewControls: {
    display: 'flex',
    gap: '4px',
    background: 'white',
    border: '2px solid #e1e5e9',
    borderRadius: '8px',
    padding: '4px'
  },
  viewButton: {
    background: 'none',
    border: 'none',
    padding: '8px',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center'
  },
  viewButtonActive: {
    background: '#667eea',
    color: 'white'
  },
  primaryButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '600'
  },
  secondaryButton: {
    background: '#6c757d',
    color: 'white',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  content: {
    minHeight: '400px'
  },
  section: {
    marginBottom: '3rem'
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    marginBottom: '1rem',
    color: '#333'
  },
  gridView: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '1.5rem'
  },
  listView: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  gridItem: {
    background: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    border: '1px solid #e1e5e9'
  },
  listItem: {
    background: 'white',
    borderRadius: '8px',
    padding: '1rem 1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    cursor: 'pointer',
    transition: 'background 0.3s ease',
    border: '1px solid #e1e5e9'
  },
  itemIcon: {
    display: 'flex',
    justifyContent: 'center'
  },
  itemInfo: {
    flex: 1,
    textAlign: 'left'
  },
  itemName: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '4px',
    color: '#333'
  },
  itemMeta: {
    fontSize: '12px',
    color: '#666',
    marginBottom: '4px'
  },
  ipfsHash: {
    fontSize: '10px',
    color: '#999',
    fontFamily: 'monospace',
    wordBreak: 'break-all'
  },
  itemActions: {
    display: 'flex',
    gap: '4px'
  },
  actionButton: {
    background: 'none',
    border: 'none',
    padding: '8px',
    borderRadius: '4px',
    cursor: 'pointer',
    color: '#666'
  },
  emptyState: {
    textAlign: 'center',
    padding: '4rem 2rem',
    color: '#666'
  },
  emptyStateActions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    marginTop: '2rem'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modal: {
    background: 'white',
    padding: '2rem',
    borderRadius: '12px',
    minWidth: '400px',
    maxWidth: '500px'
  },
  fileInput: {
    width: '100%',
    margin: '1rem 0'
  },
  textInput: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e1e5e9',
    borderRadius: '8px',
    fontSize: '16px',
    margin: '1rem 0'
  },
  modalActions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end',
    marginTop: '1.5rem'
  },
  uploading: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    margin: '1rem 0'
  },
  smallSpinner: {
    width: '20px',
    height: '20px',
    borderWidth: '2px'
  }
};

export default Dashboard;
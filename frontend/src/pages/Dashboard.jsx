import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { filesAPI } from '../utils/api';
import { signMessage, formatFileSize, initWeb3 } from '../utils/web3';
import { 
  Search, 
  Grid, 
  List,
  Upload,
  Bell,
  User,
  FolderPlus,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import FileCard from '../components/FileCard';
import FolderCard from '../components/FolderCard';
import UploadModal from '../components/UploadModal';
import DragDropArea from '../components/DragDropArea';
import Loader from '../components/Loader';
import MetamaskButton from '../components/MetamaskButton';
import AnimatedButton from '../components/AnimatedButton';
import FileViewer from '../components/FileViewer';

const Dashboard = () => {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('grid');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFolder, setCurrentFolder] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [viewingFile, setViewingFile] = useState(null);
  const [showFileViewer, setShowFileViewer] = useState(false);

  const { user, logout } = useAuth();

  useEffect(() => {
    if (user?.walletAddress) {
      setWalletAddress(user.walletAddress);
    }
    loadFilesAndFolders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setShowUploadModal(true);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;
    
    if (!user?.walletAddress) {
      alert('Please connect your wallet first');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Ensure Web3 is initialized before signing
      try {
        await initWeb3();
      } catch (error) {
        // Web3 might already be initialized, continue
        console.warn('Web3 initialization:', error.message);
      }

      const message = `Upload file: ${selectedFile.name} at ${Date.now()}`;
      const signature = await signMessage(message, user.walletAddress);

      const headers = {
        signature,
        message
      };

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const folderId = currentFolder?._id || currentFolder?.id || 'root';
      await filesAPI.uploadFile(selectedFile, folderId, headers);
      
      setUploadProgress(100);
      setTimeout(() => {
        setShowUploadModal(false);
        setSelectedFile(null);
        setUploadProgress(0);
        loadFilesAndFolders();
      }, 500);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    
    if (!user?.walletAddress) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      // Ensure Web3 is initialized before signing
      try {
        await initWeb3();
      } catch (error) {
        // Web3 might already be initialized, continue
        console.warn('Web3 initialization:', error.message);
      }

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

  const handleWalletConnect = (address) => {
    setWalletAddress(address);
  };

  const handleFileDownload = async (file) => {
    try {
      if (!file.ipfsHash) {
        alert('File IPFS hash not found. Cannot download.');
        return;
      }
      
      console.log('📥 Downloading file:', file.fileName);
      await filesAPI.downloadFile(file.ipfsHash, file.fileName);
      console.log('✅ File download initiated');
    } catch (error) {
      console.error('Download error:', error);
      alert('Download failed: ' + error.message);
    }
  };

  const handleFileView = (file) => {
    if (!file?.ipfsHash) {
      alert('File IPFS hash not found. Cannot view.');
      return;
    }
    setViewingFile(file);
    setShowFileViewer(true);
  };

  const filteredFiles = files.filter(file => 
    file?.fileName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFolders = folders.filter(folder => 
    folder?.folderName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-blue flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-dark-blue overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        folders={folders}
        onCreateFolder={() => setShowFolderModal(true)}
        onFolderClick={(folder) => setCurrentFolder(folder)}
        currentFolder={currentFolder}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-dark-blue-alt border-b border-gray-800 px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search files and folders..."
                  className="w-full pl-12 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* View Toggle */}
              <div className="flex items-center gap-1 bg-gray-800/50 rounded-lg p-1 border border-gray-700">
                <button
                  onClick={() => setView('grid')}
                  className={`p-2 rounded transition-colors ${
                    view === 'grid' 
                      ? 'bg-cyan-500/20 text-cyan-400' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`p-2 rounded transition-colors ${
                    view === 'list' 
                      ? 'bg-cyan-500/20 text-cyan-400' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <List size={20} />
                </button>
              </div>

              {/* MetaMask Button */}
              {!walletAddress && (
                <MetamaskButton onConnect={handleWalletConnect} />
              )}

              {/* Notifications */}
              <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors relative">
                <Bell size={20} className="text-gray-400" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-cyan-400 rounded-full"></span>
              </button>

              {/* User Profile */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                    <User size={18} className="text-white" />
                  </div>
                  <span className="text-white text-sm hidden md:block">{user?.email}</span>
                </button>

                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 glass rounded-lg border border-gray-700 overflow-hidden z-50"
                    >
                      <div className="p-4 border-b border-gray-700">
                        <p className="text-white font-semibold text-sm">{user?.email}</p>
                        {walletAddress && (
                          <p className="text-gray-400 text-xs font-mono mt-1">
                            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          logout();
                          setShowProfileMenu(false);
                        }}
                        className="w-full text-left px-4 py-3 text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Action Bar */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">
                {currentFolder ? currentFolder.folderName : 'My Drive'}
              </h1>
              <p className="text-gray-400 text-sm">
                {files.length} files, {folders.length} folders
              </p>
            </div>
            <div className="flex items-center gap-3">
              <AnimatedButton
                onClick={() => setShowFolderModal(true)}
                variant="outline"
              >
                <FolderPlus size={18} />
                New Folder
              </AnimatedButton>
              <AnimatedButton
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.onchange = (e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileSelect(e.target.files[0]);
                    }
                  };
                  input.click();
                }}
                variant="primary"
              >
                <Upload size={18} />
                Upload
              </AnimatedButton>
            </div>
          </div>

          {/* Drag & Drop Area */}
          <div className="mb-6">
            <DragDropArea
              onFileSelect={handleFileSelect}
              disabled={uploading}
            />
          </div>

          {/* Folders Section */}
          {filteredFolders.length > 0 && (
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-white mb-4">Folders</h2>
              <div className={view === 'grid' 
                ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'
                : 'space-y-2'
              }>
                {filteredFolders.map((folder, index) => (
                  <FolderCard
                    key={index}
                    folder={folder}
                    view={view}
                    onOpen={() => setCurrentFolder(folder)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Files Section */}
          {filteredFiles.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-white mb-4">Files</h2>
              <div className={view === 'grid' 
                ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'
                : 'space-y-2'
              }>
                {filteredFiles.map((file, index) => (
                  <FileCard
                    key={index}
                    file={file}
                    view={view}
                    onDownload={handleFileDownload}
                    onView={handleFileView}
                    onDelete={(file) => {
                      // TODO: Implement delete functionality
                      console.log('Delete file:', file);
                    }}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Empty State */}
          {filteredFiles.length === 0 && filteredFolders.length === 0 && (
            <div className="text-center py-20">
              <div className="inline-block p-6 bg-gray-800/50 rounded-full mb-4">
                <Upload size={48} className="text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No files or folders yet</h3>
              <p className="text-gray-400 mb-6">Upload your first file or create a folder to get started</p>
              <div className="flex gap-3 justify-center">
                <AnimatedButton
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.onchange = (e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileSelect(e.target.files[0]);
                      }
                    };
                    input.click();
                  }}
                  variant="primary"
                >
                  <Upload size={18} />
                  Upload Files
                </AnimatedButton>
                <AnimatedButton
                  onClick={() => setShowFolderModal(true)}
                  variant="outline"
                >
                  <FolderPlus size={18} />
                  Create Folder
                </AnimatedButton>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={showUploadModal}
        onClose={() => {
          if (!uploading) {
            setShowUploadModal(false);
            setSelectedFile(null);
            setUploadProgress(0);
          }
        }}
        onUpload={handleFileUpload}
        fileName={selectedFile?.name}
        progress={uploadProgress}
        uploading={uploading}
      />

      {/* File Viewer Modal */}
      <FileViewer
        isOpen={showFileViewer}
        onClose={() => {
          setShowFileViewer(false);
          setViewingFile(null);
        }}
        file={viewingFile}
      />

      {/* Create Folder Modal */}
      <AnimatePresence>
        {showFolderModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowFolderModal(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-2xl p-8 max-w-md w-full border border-cyan-500/30"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <FolderPlus className="text-cyan-400" size={24} />
                  Create New Folder
                </h2>
                <button
                  onClick={() => setShowFolderModal(false)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Enter folder name"
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all mb-6"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateFolder();
                  }
                }}
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setShowFolderModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-semibold transition-colors"
                >
                  Cancel
                </button>
                <AnimatedButton
                  onClick={handleCreateFolder}
                  disabled={!newFolderName.trim()}
                  variant="primary"
                  className="flex-1"
                >
                  Create Folder
                </AnimatedButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;

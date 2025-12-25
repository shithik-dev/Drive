import React, { useState, useEffect } from 'react';
import { X, Download, ExternalLink } from 'lucide-react';
import Loader from './Loader';
import { motion, AnimatePresence } from 'framer-motion';
import { filesAPI } from '../utils/api';

const FileViewer = ({ isOpen, onClose, file }) => {
  const [fileUrl, setFileUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && file?.ipfsHash) {
      loadFile();
    } else {
      // Cleanup when modal closes
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
        setFileUrl(null);
      }
    }

    return () => {
      // Cleanup on unmount
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [isOpen, file]);

  const loadFile = async () => {
    if (!file?.ipfsHash) return;

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_URL 
        ? `${import.meta.env.VITE_API_URL}/api`
        : 'http://localhost:5000/api';
      
      // Try API endpoint first (for authenticated access)
      try {
        const apiUrl = `${API_BASE_URL}/files/view/${file.ipfsHash}`;
        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);
          setFileUrl(blobUrl);
          setLoading(false);
          return;
        }
      } catch (apiError) {
        console.log('API fetch failed, trying IPFS gateways:', apiError);
      }

      // Fallback to IPFS gateways
      // Try local gateway first (don't test with HEAD due to CORS, just try to use it)
      const localGateway = `http://127.0.0.1:8080/ipfs/${file.ipfsHash}`;
      const publicGateway = `https://ipfs.io/ipfs/${file.ipfsHash}`;
      
      // For images, PDFs, and text files, try local gateway first
      if (file?.fileType?.startsWith('image/') || file?.fileType === 'application/pdf' || file?.fileType?.startsWith('text/')) {
        // Try local gateway first
        setFileUrl(localGateway);
        setLoading(false);
        
        // Test if it actually works, if not, fallback to public
        const testImg = new Image();
        testImg.onerror = () => {
          console.log('Local gateway failed, using public gateway');
          setFileUrl(publicGateway);
        };
        testImg.onload = () => {
          console.log('Local gateway working');
        };
        if (file?.fileType?.startsWith('image/')) {
          testImg.src = localGateway;
        }
        return;
      }
      
      // For other file types, try public gateway
      setFileUrl(publicGateway);
      setLoading(false);
    } catch (err) {
      console.error('File load error:', err);
      setError(err.message || 'Failed to load file');
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (file?.ipfsHash) {
      try {
        await filesAPI.downloadFile(file.ipfsHash, file.fileName);
      } catch (error) {
        alert('Download failed: ' + error.message);
      }
    }
  };

  if (!isOpen) return null;

  const isImage = file?.fileType?.startsWith('image/');
  const isPdf = file?.fileType === 'application/pdf';
  const isText = file?.fileType?.startsWith('text/');

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="glass rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-cyan-500/30 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-white truncate">{file?.fileName}</h2>
              <p className="text-sm text-gray-400">{file?.fileType}</p>
            </div>
            <div className="flex items-center gap-2">
              {file?.ipfsHash && (
                <div className="flex items-center gap-1 mr-2">
                  <a
                    href={`http://127.0.0.1:8080/ipfs/${file.ipfsHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors"
                    title="Open in Local IPFS Gateway"
                  >
                    <ExternalLink size={18} className="text-blue-400" />
                  </a>
                  <a
                    href={`https://ipfs.io/ipfs/${file.ipfsHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-purple-500/20 rounded-lg transition-colors"
                    title="Open in Public IPFS Gateway"
                  >
                    <ExternalLink size={18} className="text-purple-400" />
                  </a>
                </div>
              )}
              <button
                onClick={handleDownload}
                className="p-2 hover:bg-cyan-500/20 rounded-lg transition-colors"
                title="Download"
              >
                <Download size={20} className="text-cyan-400" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-gray-900/50">
            {loading && (
              <div className="flex flex-col items-center gap-4">
                <Loader size="lg" />
                <p className="text-gray-400">Loading file...</p>
              </div>
            )}

            {error && (
              <div className="text-center">
                <p className="text-red-400 mb-4">{error}</p>
                <div className="flex flex-col gap-3 items-center">
                  <button
                    onClick={loadFile}
                    className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 rounded-lg text-cyan-400 transition-colors"
                  >
                    Retry
                  </button>
                  {file?.ipfsHash && (
                    <div className="flex gap-3">
                      <a
                        href={`http://127.0.0.1:8080/ipfs/${file.ipfsHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm transition-all"
                      >
                        Try Local Gateway
                      </a>
                      <a
                        href={`https://ipfs.io/ipfs/${file.ipfsHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm transition-all"
                      >
                        Try Public Gateway
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {fileUrl && !loading && !error && (
              <div className="w-full h-full flex items-center justify-center">
                {isImage && (
                  <img
                    src={fileUrl}
                    alt={file.fileName}
                    className="max-w-full max-h-[70vh] object-contain rounded-lg"
                    onError={(e) => {
                      console.error('Image load error, trying fallback');
                      // Try public gateway if local fails
                      if (fileUrl.includes('127.0.0.1')) {
                        const publicGateway = `https://ipfs.io/ipfs/${file.ipfsHash}`;
                        e.target.src = publicGateway;
                        setFileUrl(publicGateway);
                      } else if (fileUrl.startsWith('blob:')) {
                        // If blob fails, try public gateway
                        const publicGateway = `https://ipfs.io/ipfs/${file.ipfsHash}`;
                        e.target.src = publicGateway;
                        setFileUrl(publicGateway);
                      } else {
                        // If public gateway also fails, show error
                        setError('Failed to load image from IPFS gateways. The file may not be pinned on IPFS network.');
                        setFileUrl(null);
                      }
                    }}
                  />
                )}
                {isPdf && (
                  <iframe
                    src={fileUrl}
                    className="w-full h-[70vh] rounded-lg border border-gray-700"
                    title={file.fileName}
                    onError={() => {
                      console.error('PDF load error, trying public gateway');
                      // Try public gateway if local fails
                      if (fileUrl.includes('127.0.0.1')) {
                        const publicGateway = `https://ipfs.io/ipfs/${file.ipfsHash}`;
                        setFileUrl(publicGateway);
                      } else {
                        setError('Failed to load PDF from IPFS gateways. The file may not be pinned on IPFS network.');
                        setFileUrl(null);
                      }
                    }}
                  />
                )}
                {isText && (
                  <iframe
                    src={fileUrl}
                    className="w-full h-[70vh] rounded-lg bg-white border border-gray-700"
                    title={file.fileName}
                    onError={() => {
                      console.error('Text file load error, trying public gateway');
                      // Try public gateway if local fails
                      if (fileUrl.includes('127.0.0.1')) {
                        const publicGateway = `https://ipfs.io/ipfs/${file.ipfsHash}`;
                        setFileUrl(publicGateway);
                      } else {
                        setError('Failed to load text file from IPFS gateways. The file may not be pinned on IPFS network.');
                        setFileUrl(null);
                      }
                    }}
                  />
                )}
                {!isImage && !isPdf && !isText && (
                  <div className="text-center">
                    <p className="text-gray-400 mb-4">Preview not available for this file type</p>
                    <p className="text-xs text-gray-500 mb-2 font-mono break-all">
                      IPFS Hash: {file.ipfsHash}
                    </p>
                    <div className="flex flex-col gap-3 items-center">
                      <button
                        onClick={handleDownload}
                        className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-lg text-white font-semibold transition-all"
                      >
                        <Download size={20} className="inline mr-2" />
                        Download to View
                      </button>
                      <div className="flex gap-3">
                        <a
                          href={`http://127.0.0.1:8080/ipfs/${file.ipfsHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm transition-all"
                        >
                          Open in Local Gateway
                        </a>
                        <a
                          href={`https://ipfs.io/ipfs/${file.ipfsHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm transition-all"
                        >
                          Open in Public Gateway
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FileViewer;


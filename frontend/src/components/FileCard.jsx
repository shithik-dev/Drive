import React from 'react';
import { File, Download, Trash2, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatFileSize } from '../utils/web3';

const FileCard = ({ file, view = 'grid', onDownload, onView, onDelete }) => {
  if (!file) return null;
  
  const fileDate = file.uploadTime 
    ? new Date(parseInt(file.uploadTime) * 1000).toLocaleDateString()
    : 'Unknown date';

  if (view === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ backgroundColor: 'rgba(0, 240, 255, 0.05)' }}
        onDoubleClick={() => onView && onView(file)}
        className="flex items-center gap-4 p-4 rounded-lg glass hover:bg-cyan-500/10 transition-all cursor-pointer group"
      >
        <div className="p-3 bg-purple-500/20 rounded-lg">
          <File size={24} className="text-purple-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate">{file.fileName}</h3>
          <p className="text-sm text-gray-400">
            {formatFileSize(parseInt(file.fileSize))} • {file.fileType} • {fileDate}
          </p>
          {file.ipfsHash && (
            <p className="text-xs text-gray-500 font-mono truncate mt-1">
              IPFS: {file.ipfsHash}
            </p>
          )}
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {onView && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onView) onView(file);
              }}
              className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors"
              title="View file"
            >
              <Eye size={18} className="text-blue-400" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onDownload) onDownload(file);
            }}
            className="p-2 hover:bg-cyan-500/20 rounded-lg transition-colors"
            title="Download file"
          >
            <Download size={18} className="text-cyan-400" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onDelete) onDelete(file);
            }}
            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
            title="Delete file"
          >
            <Trash2 size={18} className="text-red-400" />
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05, y: -5 }}
      onDoubleClick={() => onView && onView(file)}
      className="glass p-6 rounded-xl cursor-pointer group hover:bg-cyan-500/10 transition-all"
    >
      <div className="flex flex-col items-center text-center gap-4">
        <div className="p-4 bg-purple-500/20 rounded-xl">
          <File size={48} className="text-purple-400" />
        </div>
        <div className="w-full">
          <h3 className="font-semibold text-white truncate mb-2">{file.fileName}</h3>
          <p className="text-xs text-gray-400 mb-1">
            {formatFileSize(parseInt(file.fileSize))}
          </p>
          <p className="text-xs text-gray-500 mb-2">{fileDate}</p>
          {file.ipfsHash && (
            <p className="text-xs text-gray-600 font-mono truncate">
              {file.ipfsHash.slice(0, 12)}...
            </p>
          )}
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity w-full justify-center">
          {onView && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onView) onView(file);
              }}
              className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors"
              title="View file"
            >
              <Eye size={18} className="text-blue-400" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onDownload) onDownload(file);
            }}
            className="p-2 hover:bg-cyan-500/20 rounded-lg transition-colors"
            title="Download file"
          >
            <Download size={18} className="text-cyan-400" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onDelete) onDelete(file);
            }}
            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
            title="Delete file"
          >
            <Trash2 size={18} className="text-red-400" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default FileCard;


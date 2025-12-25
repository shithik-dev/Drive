import React, { useState } from 'react';
import { X, Upload, File } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Loader from './Loader';

const UploadModal = ({ isOpen, onClose, onUpload, fileName, progress, uploading }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
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
              <Upload className="text-cyan-400" size={24} />
              Upload File
            </h2>
            <button
              onClick={onClose}
              disabled={uploading}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          {fileName && (
            <div className="mb-6 p-4 bg-gray-800/50 rounded-lg flex items-center gap-3">
              <File size={24} className="text-cyan-400" />
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{fileName}</p>
              </div>
            </div>
          )}

          {uploading && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Uploading...</span>
                <span className="text-sm text-cyan-400">{progress || 0}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress || 0}%` }}
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-600"
                />
              </div>
              <div className="flex items-center justify-center mt-4">
                <Loader />
                <span className="ml-3 text-gray-400">Signing transaction...</span>
              </div>
            </div>
          )}

          {!uploading && (
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-semibold transition-colors"
              >
                Cancel
              </button>
              {onUpload && (
                <button
                  onClick={onUpload}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-lg text-white font-semibold transition-all shadow-lg shadow-cyan-500/50"
                >
                  Upload
                </button>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UploadModal;


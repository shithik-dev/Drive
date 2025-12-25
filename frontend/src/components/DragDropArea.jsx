import React, { useState } from 'react';
import { Upload, File } from 'lucide-react';
import { motion } from 'framer-motion';

const DragDropArea = ({ onFileSelect, disabled = false }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0 && onFileSelect) {
      onFileSelect(files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    if (files.length > 0 && onFileSelect) {
      onFileSelect(files[0]);
    }
  };

  return (
    <motion.div
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`
        relative border-2 border-dashed rounded-xl p-12 text-center transition-all
        ${isDragging 
          ? 'border-cyan-400 bg-cyan-500/10 scale-105' 
          : 'border-gray-600 hover:border-cyan-500/50 hover:bg-cyan-500/5'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <input
        type="file"
        onChange={handleFileInput}
        disabled={disabled}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <motion.div
        animate={isDragging ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        <Upload size={48} className="mx-auto mb-4 text-cyan-400" />
      </motion.div>
      <h3 className="text-lg font-semibold text-white mb-2">
        {isDragging ? 'Drop files here' : 'Drag & drop files here'}
      </h3>
      <p className="text-gray-400 text-sm">or click to browse</p>
      <p className="text-gray-500 text-xs mt-2">Supports all file types</p>
    </motion.div>
  );
};

export default DragDropArea;


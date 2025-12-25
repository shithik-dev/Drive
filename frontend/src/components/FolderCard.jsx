import React from 'react';
import { Folder, Download, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

const FolderCard = ({ folder, view = 'grid', onOpen, onDelete }) => {
  if (!folder) return null;
  
  const folderDate = folder.createdTime 
    ? new Date(parseInt(folder.createdTime) * 1000).toLocaleDateString()
    : 'Unknown date';

  if (view === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ backgroundColor: 'rgba(0, 240, 255, 0.05)' }}
        onClick={onOpen}
        className="flex items-center gap-4 p-4 rounded-lg glass hover:bg-cyan-500/10 transition-all cursor-pointer group"
      >
        <div className="p-3 bg-cyan-500/20 rounded-lg">
          <Folder size={24} className="text-cyan-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate">{folder.folderName}</h3>
          <p className="text-sm text-gray-400">Created {folderDate}</p>
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onDelete) onDelete(folder);
            }}
            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
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
      onClick={onOpen}
      className="glass p-6 rounded-xl cursor-pointer group hover:bg-cyan-500/10 transition-all"
    >
      <div className="flex flex-col items-center text-center gap-4">
        <div className="p-4 bg-cyan-500/20 rounded-xl">
          <Folder size={48} className="text-cyan-400" />
        </div>
        <div className="w-full">
          <h3 className="font-semibold text-white truncate mb-2">{folder.folderName}</h3>
          <p className="text-xs text-gray-400">Created {folderDate}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default FolderCard;


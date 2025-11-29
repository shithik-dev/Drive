import React, { useState } from 'react';
import { Folder, Plus, ChevronRight, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedButton from './AnimatedButton';

const Sidebar = ({ folders = [], onCreateFolder, onFolderClick, currentFolder = null }) => {
  const [expandedFolders, setExpandedFolders] = useState({});
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleFolder = (folderId) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  return (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className={`bg-dark-blue-alt border-r border-gray-800 h-screen flex flex-col transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          {!isCollapsed && (
            <h2 className="text-lg font-bold text-white">Folders</h2>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            {isCollapsed ? <ChevronRight size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400 rotate-[-90deg]" />}
          </button>
        </div>
        {!isCollapsed && onCreateFolder && (
          <AnimatedButton
            onClick={onCreateFolder}
            variant="outline"
            className="w-full"
          >
            <Plus size={18} />
            New Folder
          </AnimatedButton>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {!isCollapsed && (
          <>
            <div
              onClick={() => onFolderClick && onFolderClick(null)}
              className={`p-3 rounded-lg cursor-pointer mb-2 transition-all ${
                currentFolder === null
                  ? 'bg-cyan-500/20 border border-cyan-500/50'
                  : 'hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <Folder size={20} className="text-cyan-400" />
                <span className="text-white font-medium">All Files</span>
              </div>
            </div>

            {folders.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">
                No folders yet
              </p>
            ) : (
              <div className="space-y-1">
                {folders.map((folder) => (
                  <div key={folder._id || folder.folderName}>
                    <div
                      onClick={() => onFolderClick && onFolderClick(folder)}
                      className={`p-3 rounded-lg cursor-pointer transition-all ${
                        (currentFolder && (currentFolder._id === folder._id || currentFolder.folderName === folder.folderName)) || 
                        (!currentFolder && folder.folderName === 'root')
                          ? 'bg-cyan-500/20 border border-cyan-500/50'
                          : 'hover:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Folder size={20} className="text-cyan-400" />
                        <span className="text-white font-medium flex-1 truncate">
                          {folder.folderName}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </motion.aside>
  );
};

export default Sidebar;


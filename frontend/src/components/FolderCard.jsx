import React from 'react';
import { FiFolder, FiTrash2 } from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function FolderCard({ folder, onOpen, onDelete }) {
  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm(`Delete folder "${folder.name}" and all its contents?`)) {
      try {
        await api.delete(`/folders/${folder.id}`);
        toast.success('Folder deleted');
        onDelete(folder.id);
      } catch (error) {
        toast.error('Failed to delete folder');
      }
    }
  };

  return (
    <div
      onClick={() => onOpen(folder)}
      className="bg-white rounded-lg md:rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200 p-3 md:p-4 cursor-pointer group active:bg-gray-50"
    >
      <div className="flex items-center gap-2 md:gap-3">
        <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-50 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0">
          <FiFolder className="w-5 h-5 md:w-6 md:h-6 text-yellow-500" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xs md:text-sm font-medium text-gray-900 truncate">
            {folder.name}
          </h3>
          <p className="text-[10px] md:text-xs text-gray-500">
            {new Date(folder.created_at).toLocaleDateString()}
          </p>
        </div>
        <button
          onClick={handleDelete}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 md:block hidden"
        >
          <FiTrash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

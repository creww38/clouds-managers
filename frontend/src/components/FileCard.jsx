import React, { useState } from 'react';
import { FiDownload, FiTrash2, FiShare2, FiEye, FiFile, FiFileText, FiImage, FiVideo, FiMusic, FiArchive, FiMoreVertical } from 'react-icons/fi';
import { FaLock, FaCompress, FaFilePdf, FaFileWord, FaFileExcel } from 'react-icons/fa';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function FileCard({ file, onDelete, onPreview }) {
  const [isLoading, setIsLoading] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    // Jika kurang dari 1 jam
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes} min ago`;
    }
    // Jika kurang dari 24 jam
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
    // Jika kurang dari 7 hari
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getFileIcon = (mimeType) => {
    if (mimeType?.startsWith('image/')) return <FiImage className="w-8 h-8 md:w-10 md:h-10 text-green-500" />;
    if (mimeType?.startsWith('video/')) return <FiVideo className="w-8 h-8 md:w-10 md:h-10 text-purple-500" />;
    if (mimeType?.startsWith('audio/')) return <FiMusic className="w-8 h-8 md:w-10 md:h-10 text-pink-500" />;
    if (mimeType === 'application/pdf') return <FaFilePdf className="w-8 h-8 md:w-10 md:h-10 text-red-500" />;
    if (mimeType?.includes('word')) return <FaFileWord className="w-8 h-8 md:w-10 md:h-10 text-blue-500" />;
    if (mimeType?.includes('excel')) return <FaFileExcel className="w-8 h-8 md:w-10 md:h-10 text-green-600" />;
    if (mimeType?.includes('zip') || mimeType?.includes('rar')) return <FiArchive className="w-8 h-8 md:w-10 md:h-10 text-yellow-500" />;
    if (mimeType?.includes('text') || mimeType?.includes('json')) return <FiFileText className="w-8 h-8 md:w-10 md:h-10 text-gray-600" />;
    return <FiFile className="w-8 h-8 md:w-10 md:h-10 text-blue-500" />;
  };

  const handleDownload = async (e) => {
    e.stopPropagation();
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/files/download/${file.id}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.original_name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('File downloaded');
    } catch (error) {
      toast.error('Failed to download file');
    } finally {
      setIsLoading(false);
      setShowActions(false);
    }
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    try {
      const response = await api.post(`/files/${file.id}/share`);
      const shareUrl = `${window.location.origin}${response.data.share_url}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied!');
    } catch (error) {
      toast.error('Failed to share file');
    }
    setShowActions(false);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm(`Delete "${file.original_name}"?`)) {
      try {
        await api.delete(`/files/${file.id}`);
        toast.success('File deleted');
        onDelete(file.id);
      } catch (error) {
        toast.error('Failed to delete file');
      }
    }
    setShowActions(false);
  };

  return (
    <div
      className="bg-white rounded-lg md:rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200 cursor-pointer group relative"
      onClick={() => onPreview(file)}
    >
      <div className="p-3 md:p-4">
        <div className="flex items-start gap-2 md:gap-3">
          <div className="flex-shrink-0">
            {getFileIcon(file.mime_type)}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-xs md:text-sm font-medium text-gray-900 truncate" title={file.original_name}>
              {file.original_name}
            </h3>

            <div className="mt-0.5 md:mt-1 flex items-center gap-1 md:gap-2 text-[10px] md:text-xs text-gray-500 flex-wrap">
              <span>{formatBytes(file.size)}</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">{formatDate(file.created_at)}</span>
            </div>

            {/* Badges */}
            <div className="mt-1.5 md:mt-2 flex flex-wrap gap-1 md:gap-2">
              <span className="inline-flex items-center gap-0.5 md:gap-1 px-1.5 md:px-2 py-0.5 rounded-full text-[10px] md:text-xs font-medium bg-green-50 text-green-700">
                <FaLock className="w-2.5 h-2.5 md:w-3 md:h-3" />
                <span className="hidden sm:inline">Encrypted</span>
              </span>
              {file.compression_ratio > 0 && (
                <span className="inline-flex items-center gap-0.5 md:gap-1 px-1.5 md:px-2 py-0.5 rounded-full text-[10px] md:text-xs font-medium bg-blue-50 text-blue-700">
                  <FaCompress className="w-2.5 h-2.5 md:w-3 md:h-3" />
                  -{file.compression_ratio}%
                </span>
              )}
            </div>
          </div>

          {/* Mobile More Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowActions(!showActions);
            }}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiMoreVertical className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Mobile Quick Actions */}
        <div className="mt-2 grid grid-cols-3 gap-1 sm:hidden">
          <button
            onClick={(e) => { e.stopPropagation(); onPreview(file); }}
            className="flex items-center justify-center gap-1 px-2 py-2 text-[11px] font-medium text-blue-600 bg-blue-50 rounded-lg"
          >
            <FiEye className="w-3.5 h-3.5" />
            View
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-1 px-2 py-2 text-[11px] font-medium text-green-600 bg-green-50 rounded-lg"
          >
            <FiDownload className="w-3.5 h-3.5" />
            Save
          </button>
          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-1 px-2 py-2 text-[11px] font-medium text-purple-600 bg-purple-50 rounded-lg"
          >
            <FiShare2 className="w-3.5 h-3.5" />
            Share
          </button>
        </div>

        {/* Mobile Action Menu */}
        {showActions && (
          <div className="absolute right-2 top-12 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 animate-scale-in md:hidden">
            <button
              onClick={(e) => { e.stopPropagation(); onPreview(file); }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              <FiEye className="w-4 h-4 text-blue-600" />
              Preview
            </button>
            <button
              onClick={handleDownload}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              <FiDownload className="w-4 h-4 text-green-600" />
              Download
            </button>
            <button
              onClick={handleShare}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              <FiShare2 className="w-4 h-4 text-purple-600" />
              Share
            </button>
            <button
              onClick={handleDelete}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
            >
              <FiTrash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

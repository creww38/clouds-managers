import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FiDownload, FiFile } from 'react-icons/fi';
import { FaCloud, FaLock, FaCompress } from 'react-icons/fa';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function SharedFiles() {
  const { token } = useParams();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSharedFile();
  }, [token]);

  const fetchSharedFile = async () => {
    try {
      const response = await api.get(`/files/shared/${token}`);
      setFile(response.data.file);
    } catch (error) {
      toast.error('Shared file not found or link expired');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await api.get(`/files/shared/${token}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('File downloaded');
    } catch (error) {
      toast.error('Failed to download file');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!file) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <FaCloud className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">File Not Found</h2>
          <p className="text-gray-600">This shared link is invalid or has expired.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-2xl mb-4">
            <FiFile className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Shared File</h1>
          <p className="text-gray-600">Someone shared a file with you</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <p className="text-sm font-medium text-gray-900 truncate">
            {file.name}
          </p>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
            <span className="flex items-center gap-1">
              <FaLock className="w-3 h-3 text-green-500" />
              Encrypted
            </span>
            {file.compression_ratio > 0 && (
              <span className="flex items-center gap-1">
                <FaCompress className="w-3 h-3 text-blue-500" />
                -{file.compression_ratio}%
              </span>
            )}
          </div>
        </div>

        <button
          onClick={handleDownload}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiDownload className="w-4 h-4" />
          Download File
        </button>

        <p className="text-xs text-gray-500 text-center mt-4">
          This file is encrypted and secure. Only you can access it with this link.
        </p>
      </div>
    </div>
  );
}

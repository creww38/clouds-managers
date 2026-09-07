import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiX, FiFile } from 'react-icons/fi';
import { FaLock, FaCompress } from 'react-icons/fa';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function UploadModal({ onClose, onUpload, currentFolder }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  const onDrop = useCallback((acceptedFiles) => {
    setFiles(prev => [...prev, ...acceptedFiles.map(file => ({
      file,
      status: 'pending',
      progress: 0
    }))]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true
  });

  const handleUpload = async () => {
    setUploading(true);

    for (const fileData of files) {
      const formData = new FormData();
      formData.append('file', fileData.file);
      if (currentFolder) {
        formData.append('folder_id', currentFolder.id);
      }

      try {
        const response = await api.post('/files/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(prev => ({
              ...prev,
              [fileData.file.name]: percent
            }));
          }
        });

        toast.success(`${fileData.file.name} uploaded!`);
        onUpload(response.data.file);
      } catch (error) {
        toast.error(`Failed to upload ${fileData.file.name}`);
      }
    }

    setUploading(false);
    onClose();
  };

  const removeFile = (fileName) => {
    setFiles(prev => prev.filter(f => f.file.name !== fileName));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-center z-50">
      <div className="bg-white rounded-t-2xl md:rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-slide-up md:animate-fade-in">
        {/* Header */}
        <div className="sticky top-0 bg-white flex items-center justify-between p-4 md:p-6 border-b border-gray-200 z-10">
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">Upload Files</h2>
            <p className="text-xs md:text-sm text-gray-500 mt-1 flex items-center gap-2 flex-wrap">
              <FaLock className="w-3 h-3 text-green-500" />
              Compressed & encrypted
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5 md:w-6 md:h-6 text-gray-500" />
          </button>
        </div>

        {/* Dropzone */}
        <div className="p-4 md:p-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-6 md:p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-2 md:gap-3">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-blue-50 rounded-full flex items-center justify-center">
                <FiUpload className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Tap to select files
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  or drag & drop here
                </p>
              </div>
              <div className="flex items-center gap-2 text-[10px] md:text-xs text-gray-500 flex-wrap justify-center">
                <FaCompress className="w-3 h-3 text-blue-500" />
                <span>Auto-compression</span>
                <span>•</span>
                <FaLock className="w-3 h-3 text-green-500" />
                <span>AES-256</span>
              </div>
            </div>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              {files.map((fileData, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 md:gap-3 p-2.5 md:p-3 bg-gray-50 rounded-lg"
                >
                  <FiFile className="w-4 h-4 md:w-5 md:h-5 text-gray-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm font-medium text-gray-900 truncate">
                      {fileData.file.name}
                    </p>
                    <p className="text-[10px] md:text-xs text-gray-500">
                      {(fileData.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  {uploadProgress[fileData.file.name] ? (
                    <div className="w-16 md:w-20 bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-blue-600 rounded-full h-1.5"
                        style={{ width: `${uploadProgress[fileData.file.name]}%` }}
                      ></div>
                    </div>
                  ) : (
                    <button
                      onClick={() => removeFile(fileData.file.name)}
                      className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <FiX className="w-4 h-4 text-gray-500" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white flex items-center justify-end gap-2 md:gap-3 p-4 md:p-6 border-t border-gray-200 safe-area-bottom">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={files.length === 0 || uploading}
            className="px-4 md:px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-1 md:flex-none"
          >
            {uploading ? 'Uploading...' : `Upload ${files.length} File${files.length > 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { FiX, FiDownload, FiShare2, FiFile, FiFileText, FiImage, FiVideo, FiMusic, FiArchive, FiCode } from 'react-icons/fi';
import { FaLock, FaCompress, FaFilePdf, FaFileWord, FaFileExcel, FaFilePowerpoint } from 'react-icons/fa';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function FilePreview({ file, onClose }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewType, setPreviewType] = useState('none');
  const [textContent, setTextContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (file) {
      console.log('File to preview:', file);
      determinePreviewType(file);
    }

    // Cleanup
    return () => {
      if (previewUrl) {
        window.URL.revokeObjectURL(previewUrl);
      }
    };
  }, [file]);

  const determinePreviewType = (file) => {
    const mimeType = file.mime_type || '';
    const fileName = file.original_name || '';

    console.log('MIME Type:', mimeType);
    console.log('File Name:', fileName);

    if (mimeType.startsWith('image/')) {
      setPreviewType('image');
      fetchPreviewAsBlob(file.id, mimeType);
    } else if (mimeType.startsWith('video/')) {
      setPreviewType('video');
      fetchPreviewAsBlob(file.id, mimeType);
    } else if (mimeType.startsWith('audio/')) {
      setPreviewType('audio');
      fetchPreviewAsBlob(file.id, mimeType);
    } else if (mimeType === 'application/pdf') {
      setPreviewType('pdf');
      fetchPreviewAsBlob(file.id, mimeType);
    } else if (
      mimeType.startsWith('text/') ||
      mimeType === 'application/json' ||
      mimeType === 'application/xml' ||
      mimeType === 'application/javascript'
    ) {
      setPreviewType('text');
      fetchTextContent(file.id);
    } else if (mimeType.includes('word') || mimeType.includes('document')) {
      setPreviewType('word');
      setLoading(false);
    } else if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) {
      setPreviewType('excel');
      setLoading(false);
    } else if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) {
      setPreviewType('powerpoint');
      setLoading(false);
    } else if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('compressed')) {
      setPreviewType('archive');
      setLoading(false);
    } else {
      setPreviewType('none');
      setLoading(false);
    }
  };

  const fetchPreviewAsBlob = async (fileId, mimeType) => {
    setLoading(true);
    setError(null);

    try {
      console.log('Fetching preview for file ID:', fileId);

      const token = localStorage.getItem('token');

      // Gunakan fetch untuk kontrol penuh atas headers
      const response = await fetch(`/api/preview/${fileId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      const blob = await response.blob();
      console.log('Blob size:', blob.size);
      console.log('Blob type:', blob.type);

      // Buat URL dari blob
      const url = window.URL.createObjectURL(blob);
      console.log('Preview URL:', url);

      setPreviewUrl(url);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch preview:', error);
      setError('Failed to load preview: ' + error.message);
      setLoading(false);
    }
  };

  const fetchTextContent = async (fileId) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`/api/preview/${fileId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      setTextContent(text);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch text:', error);
      setError('Failed to load text content');
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`/api/files/download/${file.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

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
      console.error('Download error:', error);
      toast.error('Failed to download file');
    }
  };

  const handleShare = async () => {
    try {
      const response = await api.post(`/files/${file.id}/share`);
      const shareUrl = `${window.location.origin}${response.data.share_url}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied!');
    } catch (error) {
      toast.error('Failed to share file');
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-fade-in flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {file?.original_name}
              </h3>
              <div className="flex items-center gap-3 text-xs text-gray-500 mt-1 flex-wrap">
                <span>{formatBytes(file?.size || 0)}</span>
                <span className="flex items-center gap-1">
                  <FaLock className="w-3 h-3 text-green-500" />
                  Encrypted
                </span>
                {file?.compression_ratio > 0 && (
                  <span className="flex items-center gap-1">
                    <FaCompress className="w-3 h-3 text-blue-500" />
                    -{file.compression_ratio}%
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Share"
            >
              <FiShare2 className="w-5 h-5 text-gray-500" />
            </button>
            <button
              onClick={handleDownload}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Download"
            >
              <FiDownload className="w-5 h-5 text-gray-500" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Close"
            >
              <FiX className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-500">{error}</p>
              <button
                onClick={handleDownload}
                className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <FiDownload className="w-5 h-5" />
                Download Instead
              </button>
            </div>
          ) : (
            <>
              {previewType === 'image' && previewUrl && (
                <div className="flex items-center justify-center">
                  <img
                    src={previewUrl}
                    alt={file.original_name}
                    className="max-w-full max-h-[60vh] object-contain rounded-lg"
                    onError={(e) => {
                      console.error('Image load error:', e);
                      setError('Failed to load image');
                    }}
                    onLoad={() => console.log('Image loaded successfully')}
                  />
                </div>
              )}

              {previewType === 'video' && previewUrl && (
                <video
                  src={previewUrl}
                  controls
                  className="max-w-full max-h-[60vh] mx-auto rounded-lg"
                  onError={(e) => {
                    console.error('Video load error:', e);
                    setError('Failed to load video');
                  }}
                />
              )}

              {previewType === 'audio' && previewUrl && (
                <div className="text-center py-8">
                  <FiMusic className="w-24 h-24 text-purple-500 mx-auto mb-6" />
                  <audio
                    src={previewUrl}
                    controls
                    className="w-full max-w-md mx-auto"
                  />
                </div>
              )}

              {previewType === 'pdf' && previewUrl && (
                <iframe
                  src={previewUrl}
                  className="w-full h-[60vh] rounded-lg"
                  title={file.original_name}
                />
              )}

              {previewType === 'text' && (
                <pre className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-[60vh] text-sm text-gray-800 whitespace-pre-wrap">
                  {textContent}
                </pre>
              )}

              {previewType === 'word' && (
                <div className="text-center py-16">
                  <FaFileWord className="w-24 h-24 text-blue-500 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Word Document</h4>
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <FiDownload className="w-5 h-5" />
                    Download to View
                  </button>
                </div>
              )}

              {previewType === 'excel' && (
                <div className="text-center py-16">
                  <FaFileExcel className="w-24 h-24 text-green-600 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Excel Spreadsheet</h4>
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <FiDownload className="w-5 h-5" />
                    Download to View
                  </button>
                </div>
              )}

              {previewType === 'none' && (
                <div className="text-center py-16">
                  <FiFile className="w-24 h-24 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Preview Not Available</h4>
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <FiDownload className="w-5 h-5" />
                    Download File
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

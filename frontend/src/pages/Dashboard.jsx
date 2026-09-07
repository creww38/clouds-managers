import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import FileCard from '../components/FileCard';
import FolderCard from '../components/FolderCard';
import UploadModal from '../components/UploadModal';
import NewFolderModal from '../components/NewFolderModal';
import FilePreview from '../components/FilePreview';
import { FiFolder, FiArrowLeft, FiSearch, FiGrid, FiList, FiUpload, FiPlus } from 'react-icons/fi';
import { FaCloud, FaLock, FaCompress } from 'react-icons/fa';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [folderStack, setFolderStack] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [showSearch, setShowSearch] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [filesRes, foldersRes] = await Promise.all([
        api.get('/files', {
          params: {
            folder_id: currentFolder?.id || null,
            search: search || undefined
          }
        }),
        api.get('/folders', {
          params: {
            parent_id: currentFolder?.id || null
          }
        })
      ]);

      setFiles(filesRes.data.files || []);
      setFolders(foldersRes.data.folders || []);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  }, [currentFolder, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenFolder = (folder) => {
    setFolderStack(prev => [...prev, currentFolder]);
    setCurrentFolder(folder);
  };

  const handleGoBack = () => {
    const previousFolder = folderStack[folderStack.length - 1];
    setFolderStack(prev => prev.slice(0, -1));
    setCurrentFolder(previousFolder || null);
  };

  const handleGoHome = () => {
    setFolderStack([]);
    setCurrentFolder(null);
  };

  const handleFileDelete = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleFolderDelete = (folderId) => {
    setFolders(prev => prev.filter(f => f.id !== folderId));
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Navbar
        onUploadClick={() => setShowUpload(true)}
        onNewFolderClick={() => setShowNewFolder(true)}
        onHomeClick={handleGoHome}
      />

      {/* Mobile Floating Action Buttons */}
      <div className="md:hidden fixed bottom-4 right-4 z-40 flex flex-col gap-3">
        <button
          onClick={() => setShowNewFolder(true)}
          className="w-12 h-12 bg-yellow-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-yellow-600 transition-colors"
          title="New Folder"
        >
          <FiPlus className="w-6 h-6" />
        </button>
        <button
          onClick={() => setShowUpload(true)}
          className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
          title="Upload"
        >
          <FiUpload className="w-6 h-6" />
        </button>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Mobile Search Toggle */}
        <div className="md:hidden mb-4">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="w-full flex items-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-600"
          >
            <FiSearch className="w-5 h-5" />
            <span>Search files...</span>
          </button>

          {showSearch && (
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Type to search..."
              className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          )}
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
            {currentFolder ? (
              <>
                <button
                  onClick={handleGoBack}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Back"
                >
                  <FiArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <h2 className="text-lg md:text-xl font-semibold text-gray-900 truncate flex items-center gap-2">
                  <FiFolder className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                  {currentFolder.name}
                </h2>
              </>
            ) : (
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">My Files</h2>
                <p className="text-xs md:text-sm text-gray-500 mt-0.5 md:mt-1 flex items-center gap-2 flex-wrap">
                  <span className="flex items-center gap-1">
                    <FaLock className="w-3 h-3 text-green-500" />
                    Encrypted
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span className="hidden sm:flex items-center gap-1">
                    <FaCompress className="w-3 h-3 text-blue-500" />
                    Compressed
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Desktop Search */}
          <div className="hidden md:block relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search files..."
              className="w-64 pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* View Toggle - Desktop Only */}
          <div className="hidden md:flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden ml-3">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <FiGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <FiList className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Folders Section */}
            {folders.length > 0 && (
              <div className="mb-6 md:mb-8">
                <h3 className="text-sm font-semibold text-gray-700 mb-2 md:mb-3">Folders</h3>
                <div className="grid gap-2 md:gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {folders.map(folder => (
                    <FolderCard
                      key={folder.id}
                      folder={folder}
                      onOpen={handleOpenFolder}
                      onDelete={handleFolderDelete}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Files Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2 md:mb-3">Files</h3>
              {files.length > 0 ? (
                <div className="grid gap-2 md:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {files.map(file => (
                    <FileCard
                      key={file.id}
                      file={file}
                      onDelete={handleFileDelete}
                      onPreview={setPreviewFile}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 md:py-20">
                  <FaCloud className="w-16 h-16 md:w-24 md:h-24 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm md:text-base">No files in this folder</p>
                  <p className="text-xs md:text-sm text-gray-400 mt-1">
                    Upload files to get started
                  </p>
                  <button
                    onClick={() => setShowUpload(true)}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors md:hidden"
                  >
                    <FiUpload className="w-4 h-4" />
                    Upload Files
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Modals */}
      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onUpload={fetchData}
          currentFolder={currentFolder}
        />
      )}
      {showNewFolder && (
        <NewFolderModal
          onClose={() => setShowNewFolder(false)}
          onCreate={fetchData}
          currentFolder={currentFolder}
        />
      )}
      {previewFile && (
        <FilePreview
          file={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </div>
  );
}

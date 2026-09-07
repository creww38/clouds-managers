import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiUpload, FiFolder, FiHome, FiFile, FiMoreHorizontal } from 'react-icons/fi';
import { FaCloud, FaLock } from 'react-icons/fa';

export default function Navbar({ onUploadClick, onNewFolderClick, onHomeClick }) {
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const storagePercent = user ? (user.storage_used / user.storage_quota) * 100 : 0;

  return (
    <>
      {/* Desktop/Tablet Navbar */}
      <nav className="hidden md:block bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <FaCloud className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">SecureCloud</h1>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <FaLock className="w-3 h-3 text-green-500" />
                  Encrypted Storage
                </p>
              </div>
            </div>

            {/* Storage Info */}
            {user && (
              <div className="flex-1 max-w-xs mx-4">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>Storage</span>
                  <span>{formatBytes(user.storage_used)} / {formatBytes(user.storage_quota)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-full h-2 transition-all"
                    style={{ width: `${Math.min(storagePercent, 100)}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={onNewFolderClick}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FiFolder className="w-4 h-4" />
                New Folder
              </button>
              <button
                onClick={onUploadClick}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiUpload className="w-4 h-4" />
                Upload
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-blue-600">
                      {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                </button>

                {showMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 animate-fade-in">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <FiLogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Top Bar */}
      <nav className="md:hidden bg-white border-b border-gray-200 sticky top-0 z-50 safe-area-top">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <FaCloud className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">SecureCloud</h1>
                <p className="text-[10px] text-gray-500 flex items-center gap-1">
                  <FaLock className="w-2.5 h-2.5 text-green-500" />
                  Encrypted
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiMoreHorizontal className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Mobile Storage Bar */}
          {user && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1">
                <span>Storage</span>
                <span>{formatBytes(user.storage_used)} / {formatBytes(user.storage_quota)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-full h-1.5 transition-all"
                  style={{ width: `${Math.min(storagePercent, 100)}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Mobile Menu Dropdown */}
          {showMenu && (
            <div className="mt-3 bg-white rounded-xl border border-gray-200 shadow-lg animate-scale-in">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <button
                onClick={() => {
                  onUploadClick();
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <FiUpload className="w-5 h-5 text-blue-600" />
                Upload Files
              </button>
              <button
                onClick={() => {
                  onNewFolderClick();
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <FiFolder className="w-5 h-5 text-yellow-500" />
                New Folder
              </button>
              <button
                onClick={() => {
                  onHomeClick();
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <FiHome className="w-5 h-5 text-green-600" />
                Home
              </button>
              <button
                onClick={() => {
                  logout();
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
              >
                <FiLogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}

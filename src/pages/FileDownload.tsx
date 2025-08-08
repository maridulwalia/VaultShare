import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { Download, Lock, AlertCircle, CheckCircle, Clock, Shield, User } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface FileInfo {
  id: string;
  originalName: string;
  size: number;
  mimetype: string;
  hasPassword: boolean;
  isLoginRequired: boolean;
  maxDownloads?: number;
  downloadCount: number;
  expiryDate?: string;
  createdAt: string;
}

export const FileDownload: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (id) {
      loadFileInfo();
    }
  }, [id]);

  const loadFileInfo = async () => {
    try {
      const info = await api.getFileInfo(id!);
      setFileInfo(info);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'File not found');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!fileInfo) return;

    setDownloading(true);
    setError('');

    try {
      const response = await api.downloadFile(id!, fileInfo.hasPassword ? password : undefined);
      
      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileInfo.originalName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccess(true);
      
      // Refresh file info to show updated download count
      setTimeout(loadFileInfo, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed');
    } finally {
      setDownloading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const isExpired = fileInfo?.expiryDate && new Date() > new Date(fileInfo.expiryDate);
  const isLimitReached = fileInfo?.maxDownloads && fileInfo.downloadCount >= fileInfo.maxDownloads;

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !fileInfo) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-800 mb-2">File Not Found</h2>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center mb-8">
          <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Secure File Download</h1>
          <p className="text-gray-600">Encrypted file ready for download</p>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6 flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-sm text-green-700">File downloaded successfully!</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6 flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {fileInfo && (
          <div className="space-y-6">
            {/* File Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">File Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Name:</span>
                  <span className="text-sm font-medium text-gray-900">{fileInfo.originalName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Size:</span>
                  <span className="text-sm font-medium text-gray-900">{formatFileSize(fileInfo.size)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Type:</span>
                  <span className="text-sm font-medium text-gray-900">{fileInfo.mimetype}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Downloads:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {fileInfo.downloadCount}{fileInfo.maxDownloads && ` / ${fileInfo.maxDownloads}`}
                  </span>
                </div>
                {fileInfo.expiryDate && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Expires:</span>
                    <span className="text-sm font-medium text-gray-900">{formatDate(fileInfo.expiryDate)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Security Indicators */}
            <div className="flex flex-wrap gap-2">
              {fileInfo.hasPassword && (
                <div className="flex items-center space-x-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                  <Lock className="h-4 w-4" />
                  <span>Password Protected</span>
                </div>
              )}
              {fileInfo.isLoginRequired && (
                <div className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  <User className="h-4 w-4" />
                  <span>Login Required</span>
                </div>
              )}
              {fileInfo.expiryDate && (
                <div className="flex items-center space-x-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                  <Clock className="h-4 w-4" />
                  <span>Auto-Expire</span>
                </div>
              )}
            </div>

            {/* Password Input */}
            {fileInfo.hasPassword && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter password to download
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="File password"
                />
              </div>
            )}

            {/* Download Button */}
            <div className="flex justify-center">
              {isExpired ? (
                <div className="text-center">
                  <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <p className="text-red-600 font-medium">This file has expired</p>
                </div>
              ) : isLimitReached ? (
                <div className="text-center">
                  <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <p className="text-red-600 font-medium">Download limit reached</p>
                </div>
              ) : fileInfo.isLoginRequired && !user ? (
                <div className="text-center">
                  <AlertCircle className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-blue-600 font-medium mb-4">
                    {fileInfo.hasEmailRestriction 
                      ? 'Login required and email authorization needed to download this file'
                      : 'Login required to download this file'
                    }
                  </p>
                  <Link
                    to="/login"
                    state={{ from: location }}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Login to Download
                  </Link>
                </div>
              ) : (
                <button
                  onClick={handleDownload}
                  disabled={downloading || (fileInfo.hasPassword && !password)}
                  className="px-8 py-3 bg-blue-600 text-white text-lg font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  <Download className="h-5 w-5" />
                  <span>{downloading ? 'Downloading...' : 'Download File'}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
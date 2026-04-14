import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { Download, Lock, AlertCircle, CheckCircle, Clock, Shield, User, ArrowRight } from 'lucide-react';
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-2 border-accent-500/30 border-t-accent-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error && !fileInfo) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20">
        <div className="glass-card p-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/15 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">File Not Found</h2>
          <p className="text-dark-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="glass-card p-8 md:p-10 animate-fade-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent-500/10 border border-accent-500/15 mb-6">
            <Shield className="h-8 w-8 text-accent-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Secure File Download</h1>
          <p className="text-dark-400">Encrypted file ready for download</p>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/15 flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0" />
            <span className="text-sm text-emerald-400">File downloaded successfully!</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/8 border border-red-500/15 flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
            <span className="text-sm text-red-400">{error}</span>
          </div>
        )}

        {fileInfo && (
          <div className="space-y-6">
            {/* File Info Card */}
            <div className="bg-dark-950 rounded-xl p-6 border border-dark-700">
              <h3 className="text-sm font-medium text-dark-400 uppercase tracking-widest mb-4">File Information</h3>
              <div className="space-y-3">
                {[
                  { label: 'Name', value: fileInfo.originalName },
                  { label: 'Size', value: formatFileSize(fileInfo.size) },
                  { label: 'Type', value: fileInfo.mimetype },
                  { label: 'Downloads', value: `${fileInfo.downloadCount}${fileInfo.maxDownloads ? ` / ${fileInfo.maxDownloads}` : ''}` },
                  ...(fileInfo.expiryDate ? [{ label: 'Expires', value: formatDate(fileInfo.expiryDate) }] : []),
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-dark-700/50 last:border-0">
                    <span className="text-sm text-dark-500">{item.label}</span>
                    <span className="text-sm font-medium text-dark-200 text-right max-w-[60%] truncate">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Security Tags */}
            <div className="flex flex-wrap gap-2">
              {fileInfo.hasPassword && (
                <span className="tag tag-warning">
                  <Lock className="h-3 w-3" />
                  Password Protected
                </span>
              )}
              {fileInfo.isLoginRequired && (
                <span className="tag tag-info">
                  <User className="h-3 w-3" />
                  Login Required
                </span>
              )}
              {fileInfo.expiryDate && (
                <span className="tag tag-purple">
                  <Clock className="h-3 w-3" />
                  Auto-Expire
                </span>
              )}
            </div>

            {/* Password Input */}
            {fileInfo.hasPassword && (
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  Enter password to download
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-dark"
                  placeholder="File password"
                />
              </div>
            )}

            {/* Action Button */}
            <div className="flex justify-center pt-2">
              {isExpired ? (
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/15 flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="h-6 w-6 text-red-400" />
                  </div>
                  <p className="text-red-400 font-medium">This file has expired</p>
                </div>
              ) : isLimitReached ? (
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/15 flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="h-6 w-6 text-red-400" />
                  </div>
                  <p className="text-red-400 font-medium">Download limit reached</p>
                </div>
              ) : fileInfo.isLoginRequired && !user ? (
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/15 flex items-center justify-center mx-auto mb-4">
                    <User className="h-6 w-6 text-cyan-400" />
                  </div>
                  <p className="text-cyan-400 font-medium mb-4">Login required to download this file</p>
                  <Link
                    to="/login"
                    state={{ from: location }}
                    className="btn-accent text-sm gap-2"
                  >
                    Login to Download
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : (
                <button
                  onClick={handleDownload}
                  disabled={downloading || (fileInfo.hasPassword && !password)}
                  className="btn-accent text-base gap-2 group"
                >
                  {downloading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="h-5 w-5" />
                      Download File
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
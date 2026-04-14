import React, { useState, useEffect } from 'react';
import { Files, Download, Trash2, Clock, Lock, User, AlertCircle, Copy, Check, Upload, ExternalLink } from 'lucide-react';
import { api } from '../services/api';

interface FileItem {
  _id: string;
  originalName: string;
  size: number;
  mimetype: string;
  downloadCount: number;
  maxDownloads?: number;
  expiryDate?: string;
  isLoginRequired: boolean;
  hasPassword: boolean;
  createdAt: string;
  isActive: boolean;
}

export const MyUploads: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const result = await api.getUserFiles();
      setFiles(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file? This action cannot be undone.')) {
      return;
    }

    setDeleteLoading(fileId);
    try {
      await api.deleteFile(fileId);
      setFiles(files.filter(f => f._id !== fileId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete file');
    } finally {
      setDeleteLoading(null);
    }
  };

  const copyDownloadLink = (fileId: string) => {
    const link = `${window.location.origin}/file/${fileId}`;
    navigator.clipboard.writeText(link);
    setCopiedId(fileId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isExpired = (expiryDate?: string) => {
    return expiryDate && new Date() > new Date(expiryDate);
  };

  const isLimitReached = (file: FileItem) => {
    return file.maxDownloads && file.downloadCount >= file.maxDownloads;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-2 border-accent-500/30 border-t-accent-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page Header */}
      <div className="mb-10 animate-fade-up">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-500/10 border border-accent-500/20 mb-4">
          <Files className="h-3.5 w-3.5 text-accent-400" />
          <span className="text-sm font-medium text-accent-400">My Files</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-3">
          My Uploads
        </h1>
        <p className="text-dark-400 text-lg">
          Manage your uploaded files and monitor download statistics
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
          <span className="text-sm text-red-400">{error}</span>
        </div>
      )}

      {files.length === 0 ? (
        /* Empty State */
        <div className="glass-card p-16 text-center animate-fade-up">
          <div className="w-20 h-20 rounded-2xl bg-dark-800 border border-dark-700 flex items-center justify-center mx-auto mb-6">
            <Files className="h-10 w-10 text-dark-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">No files uploaded yet</h3>
          <p className="text-dark-400 mb-8 max-w-sm mx-auto">Start sharing files securely with VaultShare's military-grade encryption</p>
          <a href="/upload" className="btn-accent text-sm gap-2">
            <Upload className="h-4 w-4" />
            Upload Your First File
          </a>
        </div>
      ) : (
        /* File Cards (mobile) / Table (desktop) */
        <div>
          {/* Mobile: Card View */}
          <div className="md:hidden space-y-4">
            {files.map((file) => (
              <div key={file._id} className="glass-card-hover p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0 mr-3">
                    <h3 className="text-sm font-semibold text-white truncate">{file.originalName}</h3>
                    <p className="text-xs text-dark-500 mt-1">{formatFileSize(file.size)} • {formatDate(file.createdAt)}</p>
                  </div>
                  {!file.isActive || isExpired(file.expiryDate) || isLimitReached(file) ? (
                    <span className="tag tag-danger flex-shrink-0">Inactive</span>
                  ) : (
                    <span className="tag tag-success flex-shrink-0">Active</span>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {file.hasPassword && <span className="tag tag-warning"><Lock className="h-3 w-3" /> Password</span>}
                  {file.isLoginRequired && <span className="tag tag-info"><User className="h-3 w-3" /> Login</span>}
                  {file.expiryDate && <span className="tag tag-purple"><Clock className="h-3 w-3" /> Expires</span>}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                  <div className="text-xs text-dark-400">
                    <Download className="h-3 w-3 inline mr-1" />
                    {file.downloadCount}{file.maxDownloads && ` / ${file.maxDownloads}`} downloads
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyDownloadLink(file._id)}
                      className={`p-2 rounded-lg transition-all ${
                        copiedId === file._id
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'text-dark-400 hover:text-accent-400 hover:bg-accent-500/10'
                      }`}
                      title="Copy download link"
                    >
                      {copiedId === file._id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => handleDelete(file._id)}
                      disabled={deleteLoading === file._id}
                      className="p-2 rounded-lg text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
                      title="Delete file"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: Table View */}
          <div className="hidden md:block glass-card overflow-hidden animate-fade-up">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="px-6 py-4 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">File</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Security</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Downloads</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {files.map((file) => (
                    <tr key={file._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-dark-100 truncate max-w-xs">{file.originalName}</div>
                          <div className="text-xs text-dark-500 mt-0.5">{formatFileSize(file.size)} • {formatDate(file.createdAt)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {file.hasPassword && <span className="tag tag-warning"><Lock className="h-3 w-3" /> Password</span>}
                          {file.isLoginRequired && <span className="tag tag-info"><User className="h-3 w-3" /> Login</span>}
                          {file.expiryDate && <span className="tag tag-purple"><Clock className="h-3 w-3" /> Expires</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-dark-200">
                          {file.downloadCount}{file.maxDownloads && ` / ${file.maxDownloads}`}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {!file.isActive || isExpired(file.expiryDate) || isLimitReached(file) ? (
                          <span className="tag tag-danger">Inactive</span>
                        ) : (
                          <span className="tag tag-success">Active</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => copyDownloadLink(file._id)}
                            className={`p-2 rounded-lg transition-all ${
                              copiedId === file._id
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'text-dark-400 hover:text-accent-400 hover:bg-accent-500/10'
                            }`}
                            title="Copy download link"
                          >
                            {copiedId === file._id ? <Check className="h-4 w-4" /> : <ExternalLink className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => handleDelete(file._id)}
                            disabled={deleteLoading === file._id}
                            className="p-2 rounded-lg text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
                            title="Delete file"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
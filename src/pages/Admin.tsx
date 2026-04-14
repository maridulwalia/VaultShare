import React, { useState, useEffect } from 'react';
import { Shield, Users, Files, Download, Trash2, AlertCircle, BarChart3, Activity, TrendingUp } from 'lucide-react';
import { api } from '../services/api';

interface AdminStats {
  users: number;
  totalFiles: number;
  activeFiles: number;
  totalDownloads: number;
}

interface AdminFile {
  _id: string;
  originalName: string;
  size: number;
  uploaderId: {
    email: string;
  };
  downloadCount: number;
  maxDownloads?: number;
  expiryDate?: string;
  createdAt: string;
  isActive: boolean;
}

interface AdminUser {
  _id: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
  lastLogin?: string;
  fileCount: number;
  totalDownloads: number;
}

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [files, setFiles] = useState<AdminFile[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'files' | 'users'>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [deleteUserLoading, setDeleteUserLoading] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsResult, filesResult, usersResult] = await Promise.all([
        api.getAdminStats(),
        api.getAdminFiles(1, 50),
        api.getAdminUsers()
      ]);

      setStats(statsResult.stats);
      setFiles(filesResult.files);
      setUsers(usersResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file? This action cannot be undone.')) {
      return;
    }

    setDeleteLoading(fileId);
    try {
      await api.deleteFileAdmin(fileId);
      setFiles(files.filter(f => f._id !== fileId));
      // Update stats
      if (stats) {
        setStats({
          ...stats,
          totalFiles: stats.totalFiles - 1,
          activeFiles: stats.activeFiles - 1
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete file');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This will also delete all their files.')) {
      return;
    }

    setDeleteUserLoading(userId);
    try {
      await api.deleteUserAdmin(userId);
      setUsers(users.filter(u => u._id !== userId));
      // Refresh stats
      loadDashboardData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    } finally {
      setDeleteUserLoading(null);
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
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-2 border-accent-500/30 border-t-accent-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: BarChart3 },
    { id: 'files' as const, label: 'Files', icon: Files },
    { id: 'users' as const, label: 'Users', icon: Users },
  ];

  const statCards = stats ? [
    { label: 'Total Users', value: stats.users, icon: Users, color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20' },
    { label: 'Total Files', value: stats.totalFiles, icon: Files, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { label: 'Active Files', value: stats.activeFiles, icon: Activity, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    { label: 'Total Downloads', value: stats.totalDownloads, icon: TrendingUp, color: 'text-accent-400', bg: 'bg-accent-500/10', border: 'border-accent-500/20' },
  ] : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page Header */}
      <div className="mb-10 animate-fade-up">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-500/10 border border-accent-500/20 mb-4">
          <Shield className="h-3.5 w-3.5 text-accent-400" />
          <span className="text-sm font-medium text-accent-400">Administration</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-3">
          Admin Dashboard
        </h1>
        <p className="text-dark-400 text-lg">Monitor and manage the VaultShare platform</p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
          <span className="text-sm text-red-400">{error}</span>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="mb-8 flex gap-1 p-1 rounded-xl bg-dark-900 border border-white/[0.06] inline-flex">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
              activeTab === tab.id
                ? 'bg-accent-500 text-white shadow-lg shadow-accent-500/20'
                : 'text-dark-400 hover:text-dark-200 hover:bg-white/[0.04]'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && stats && (
        <div className="animate-fade-up">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {statCards.map((card, i) => (
              <div key={i} className="glass-card-hover p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl ${card.bg} border ${card.border} flex items-center justify-center`}>
                    <card.icon className={`h-5 w-5 ${card.color}`} />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{card.value}</div>
                <div className="text-sm text-dark-500">{card.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Files Tab */}
      {activeTab === 'files' && (
        <div className="glass-card overflow-hidden animate-fade-up">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="px-6 py-4 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">File</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Uploader</th>
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
                      <div className="text-sm text-dark-300">{file.uploaderId.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-dark-200">
                        {file.downloadCount}{file.maxDownloads && ` / ${file.maxDownloads}`}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {file.isActive ? (
                        <span className="tag tag-success">Active</span>
                      ) : (
                        <span className="tag tag-danger">Inactive</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDeleteFile(file._id)}
                        disabled={deleteLoading === file._id}
                        className="p-2 rounded-lg text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {files.length === 0 && (
            <div className="p-12 text-center text-dark-500">No files found</div>
          )}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="glass-card overflow-hidden animate-fade-up">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="px-6 py-4 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Files</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Downloads</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Last Login</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-dark-100">{user.email}</div>
                        <div className="text-xs text-dark-500 mt-0.5">Joined {formatDate(user.createdAt)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.isAdmin ? (
                        <span className="tag tag-accent">Admin</span>
                      ) : (
                        <span className="tag bg-dark-800 text-dark-300 border-dark-700">User</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-dark-200">{user.fileCount}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-dark-200">{user.totalDownloads}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-dark-300">
                        {user.lastLogin ? formatDate(user.lastLogin) : <span className="text-dark-600">Never</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {!user.isAdmin && (
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          disabled={deleteUserLoading === user._id}
                          className="p-2 rounded-lg text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {users.length === 0 && (
            <div className="p-12 text-center text-dark-500">No users found</div>
          )}
        </div>
      )}
    </div>
  );
};
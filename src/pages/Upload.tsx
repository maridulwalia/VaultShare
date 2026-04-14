import React, { useState } from 'react';
import { Upload, Shield, Clock, Download, Lock, AlertCircle, CheckCircle, Copy, Check, ArrowRight, Sparkles } from 'lucide-react';
import { api } from '../services/api';

export const UploadPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [expiryHours, setExpiryHours] = useState('');
  const [maxDownloads, setMaxDownloads] = useState('');
  const [isLoginRequired, setIsLoginRequired] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [authorizedEmails, setAuthorizedEmails] = useState('');
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (password) formData.append('password', password);
      if (expiryHours) formData.append('expiryHours', expiryHours);
      if (maxDownloads) formData.append('maxDownloads', maxDownloads);
      formData.append('isLoginRequired', isLoginRequired.toString());

      if (isLoginRequired) {
        const emailsArray = authorizedEmails
          .split(',')
          .map(email => email.trim())
          .filter(email => email.length > 0);
        formData.append('authorizedEmails', JSON.stringify(emailsArray));
      }

      const result = await api.uploadFile(formData);
      setUploadResult(result);
      
      // Reset form
      setFile(null);
      setPassword('');
      setExpiryHours('');
      setMaxDownloads('');
      setIsLoginRequired(false);
      setAuthorizedEmails('');
      
      // Reset file input
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const copyDownloadLink = () => {
    if (uploadResult?.file?.id) {
      const link = `${window.location.origin}/file/${uploadResult.file.id}`;
      navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page Header */}
      <div className="mb-10 animate-fade-up">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-500/10 border border-accent-500/20 mb-4">
          <Upload className="h-3.5 w-3.5 text-accent-400" />
          <span className="text-sm font-medium text-accent-400">Secure Upload</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-3">
          Upload your files
        </h1>
        <p className="text-dark-400 text-lg">
          Military-grade encryption with customizable security options
        </p>
      </div>

      {uploadResult ? (
        /* Upload Success */
        <div className="glass-card p-8 md:p-10 animate-fade-up">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-6">
              <CheckCircle className="h-8 w-8 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Upload Successful!</h2>
            <p className="text-dark-400">
              <span className="text-dark-200 font-medium">{uploadResult.file.originalName}</span>
              {' '}({formatFileSize(uploadResult.file.size)})
            </p>
          </div>
          
          {/* Share Link */}
          <div className="bg-dark-950 rounded-xl p-5 border border-white/[0.06] mb-8">
            <p className="text-xs text-dark-500 uppercase tracking-wider mb-3">Share this secure link</p>
            <div className="flex items-center gap-3">
              <code className="flex-1 bg-dark-900 px-4 py-3 rounded-lg text-sm text-accent-400 overflow-x-auto border border-white/[0.04]">
                {window.location.origin}/file/{uploadResult.file.id}
              </code>
              <button
                onClick={copyDownloadLink}
                className={`flex-shrink-0 p-3 rounded-lg transition-all duration-300 ${
                  copied
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-accent-500/10 text-accent-400 border border-accent-500/20 hover:bg-accent-500/20'
                }`}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>
          
          <div className="text-center">
            <button
              onClick={() => { setUploadResult(null); setCopied(false); }}
              className="btn-accent text-sm gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload Another File
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error */}
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center space-x-3 animate-fade-in">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
              <span className="text-sm text-red-400">{error}</span>
            </div>
          )}

          {/* File Drop Zone */}
          <div className="glass-card p-8 animate-fade-up">
            <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
              <Upload className="h-5 w-5 text-accent-400" />
              Select File
            </h3>
            
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 cursor-pointer ${
                dragOver
                  ? 'border-accent-500 bg-accent-500/[0.05]'
                  : file
                    ? 'border-emerald-500/30 bg-emerald-500/[0.03]'
                    : 'border-dark-700 hover:border-dark-500 bg-dark-950/50'
              }`}
            >
              <input
                id="file-input"
                type="file"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                required
              />
              <div className={`w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center transition-colors duration-300 ${
                file ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-dark-800 border border-dark-700'
              }`}>
                {file ? <CheckCircle className="h-6 w-6 text-emerald-400" /> : <Upload className="h-6 w-6 text-dark-400" />}
              </div>
              <p className="text-base text-dark-200 mb-2 font-medium">
                {file ? file.name : 'Drop your file here or click to browse'}
              </p>
              <p className="text-sm text-dark-500">
                {file ? `${formatFileSize(file.size)} • ${file.type || 'Unknown type'}` : 'Maximum file size: 100MB'}
              </p>
            </div>
          </div>

          {/* Security Options */}
          <div className="glass-card p-8 animate-fade-up delay-100">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Shield className="h-5 w-5 text-accent-400" />
              Security Options
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2 flex items-center gap-2">
                  <Lock className="h-3.5 w-3.5 text-dark-400" />
                  Password Protection
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-dark"
                  placeholder="Optional password"
                />
              </div>

              {/* Expiry */}
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2 flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-dark-400" />
                  Auto-Delete After (Hours)
                </label>
                <input
                  type="number"
                  min="1"
                  max="8760"
                  value={expiryHours}
                  onChange={(e) => setExpiryHours(e.target.value)}
                  className="input-dark"
                  placeholder="e.g., 24"
                />
              </div>

              {/* Download Limit */}
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2 flex items-center gap-2">
                  <Download className="h-3.5 w-3.5 text-dark-400" />
                  Maximum Downloads
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={maxDownloads}
                  onChange={(e) => setMaxDownloads(e.target.value)}
                  className="input-dark"
                  placeholder="e.g., 10"
                />
              </div>

              {/* Login Required */}
              <div className="flex items-center">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isLoginRequired}
                    onChange={(e) => setIsLoginRequired(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-dark-700 rounded-full peer peer-checked:bg-accent-500 transition-colors duration-300 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                  <span className="ml-3 text-sm font-medium text-dark-200">Require login</span>
                </label>
              </div>

              {/* Authorized Emails */}
              {isLoginRequired && (
                <div className="md:col-span-2 animate-fade-in">
                  <label className="block text-sm font-medium text-dark-200 mb-2">
                    Authorized Emails
                  </label>
                  <textarea
                    value={authorizedEmails}
                    onChange={(e) => setAuthorizedEmails(e.target.value)}
                    rows={3}
                    className="input-dark !rounded-xl resize-none"
                    placeholder="user1@example.com, user2@example.com&#10;Leave empty to allow any logged-in user"
                  />
                  <p className="mt-2 text-xs text-dark-500">
                    Separate emails with commas. Leave empty to allow any authenticated user.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Upload Button */}
          <div className="flex justify-center animate-fade-up delay-200">
            <button
              type="submit"
              disabled={!file || loading}
              className="btn-accent text-base gap-2 group"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Encrypting & Uploading...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Secure Upload
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
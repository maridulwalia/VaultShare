import React, { useState } from 'react';
import { Upload, Shield, Clock, Download, Lock, AlertCircle, CheckCircle, Copy } from 'lucide-react';
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


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
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

      const result = await api.uploadFile(formData);
      setUploadResult(result);
      
      // Reset form
      setFile(null);
      setPassword('');
      setExpiryHours('');
      setMaxDownloads('');
      setIsLoginRequired(false);
      
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
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Secure File Upload</h1>
        <p className="text-gray-600">
          Upload files with military-grade encryption and customizable security options
        </p>
      </div>

      {uploadResult ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <h3 className="text-lg font-semibold text-green-800">Upload Successful!</h3>
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm text-green-700 mb-2">
                <strong>File:</strong> {uploadResult.file.originalName} ({formatFileSize(uploadResult.file.size)})
              </p>
            </div>
            
            <div className="bg-white rounded-md p-4 border border-green-200">
              <p className="text-sm text-gray-700 mb-2">Share this secure link:</p>
              <div className="flex items-center space-x-2">
                <code className="flex-1 bg-gray-100 px-3 py-2 rounded text-sm">
                  {window.location.origin}/file/{uploadResult.file.id}
                </code>
                <button
                  onClick={copyDownloadLink}
                  className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setUploadResult(null)}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Upload Another File
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {/* File Selection */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>Select File</span>
            </h3>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
              <input
                id="file-input"
                type="file"
                onChange={handleFileChange}
                className="hidden"
                required
              />
              <label htmlFor="file-input" className="cursor-pointer">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg text-gray-600 mb-2">
                  {file ? file.name : 'Click to select a file'}
                </p>
                <p className="text-sm text-gray-500">
                  {file ? `${formatFileSize(file.size)} • ${file.type}` : 'Maximum file size: 100MB'}
                </p>
              </label>
            </div>
          </div>

          {/* Security Options */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Security Options</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Password Protection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                  <Lock className="h-4 w-4" />
                  <span>Password Protection (Optional)</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter password to protect file"
                />
              </div>

              {/* Expiry Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Auto-Delete After (Hours)</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="8760"
                  value={expiryHours}
                  onChange={(e) => setExpiryHours(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 24 (optional)"
                />
              </div>

              {/* Download Limit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>Maximum Downloads</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={maxDownloads}
                  onChange={(e) => setMaxDownloads(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 10 (optional)"
                />
              </div>

              {/* Login Required */}
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={isLoginRequired}
                    onChange={(e) => setIsLoginRequired(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="text-sm font-medium text-gray-700">Require login to download</span>
                </label>
              </div>

              {/* Authorized Emails */}
              {isLoginRequired && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Authorized Email Addresses (Optional)
                  </label>
                  <textarea
                    value={authorizedEmails}
                    onChange={(e) => setAuthorizedEmails(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter email addresses separated by commas (e.g., user1@example.com, user2@example.com)&#10;Leave empty to allow any logged-in user"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    If specified, only users with these email addresses can download the file. Leave empty to allow any authenticated user.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Upload Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={!file || loading}
              className="px-8 py-3 bg-blue-600 text-white text-lg font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <Shield className="h-5 w-5" />
              <span>{loading ? 'Encrypting & Uploading...' : 'Secure Upload'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
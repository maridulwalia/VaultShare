import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Upload, Files, Settings, LogOut, User, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-dark-950 noise-bg">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-950/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-18 items-center py-4">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-accent-500/20 rounded-lg blur-md group-hover:bg-accent-500/30 transition-all duration-300"></div>
                <Shield className="relative h-8 w-8 text-accent-500" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Vault<span className="text-accent-500">Share</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {user ? (
                <>
                  <Link
                    to="/upload"
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      isActive('/upload')
                        ? 'bg-accent-500/10 text-accent-400 border border-accent-500/20'
                        : 'text-dark-300 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <Upload className="h-4 w-4" />
                    <span>Upload</span>
                  </Link>

                  <Link
                    to="/my-uploads"
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      isActive('/my-uploads')
                        ? 'bg-accent-500/10 text-accent-400 border border-accent-500/20'
                        : 'text-dark-300 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <Files className="h-4 w-4" />
                    <span>My Files</span>
                  </Link>

                  {user.isAdmin && (
                    <Link
                      to="/admin"
                      className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                        isActive('/admin')
                          ? 'bg-accent-500/10 text-accent-400 border border-accent-500/20'
                          : 'text-dark-300 hover:text-white hover:bg-white/[0.04]'
                      }`}
                    >
                      <Settings className="h-4 w-4" />
                      <span>Admin</span>
                    </Link>
                  )}

                  <div className="w-px h-6 bg-white/[0.08] mx-3"></div>

                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06]">
                      <div className="w-6 h-6 rounded-full bg-accent-500/20 flex items-center justify-center">
                        <User className="h-3 w-3 text-accent-400" />
                      </div>
                      <span className="text-sm text-dark-200 max-w-[140px] truncate">{user.email}</span>
                    </div>
                    <button
                      onClick={logout}
                      className="flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="px-5 py-2 text-sm font-medium text-dark-200 hover:text-white transition-colors duration-300"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="btn-accent text-sm !px-6 !py-2"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-dark-300 hover:text-white hover:bg-white/[0.04] transition-colors"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-6 border-t border-white/[0.06] pt-4 animate-fade-in">
              <div className="space-y-2">
                {user ? (
                  <>
                    <Link
                      to="/upload"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        isActive('/upload') ? 'bg-accent-500/10 text-accent-400' : 'text-dark-300 hover:text-white hover:bg-white/[0.04]'
                      }`}
                    >
                      <Upload className="h-4 w-4" />
                      <span>Upload</span>
                    </Link>
                    <Link
                      to="/my-uploads"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        isActive('/my-uploads') ? 'bg-accent-500/10 text-accent-400' : 'text-dark-300 hover:text-white hover:bg-white/[0.04]'
                      }`}
                    >
                      <Files className="h-4 w-4" />
                      <span>My Files</span>
                    </Link>
                    {user.isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                          isActive('/admin') ? 'bg-accent-500/10 text-accent-400' : 'text-dark-300 hover:text-white hover:bg-white/[0.04]'
                        }`}
                      >
                        <Settings className="h-4 w-4" />
                        <span>Admin</span>
                      </Link>
                    )}
                    <div className="border-t border-white/[0.06] pt-2 mt-2">
                      <div className="px-4 py-2 text-xs text-dark-500">{user.email}</div>
                      <button
                        onClick={() => { logout(); setMobileMenuOpen(false); }}
                        className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 w-full transition-all"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 rounded-xl text-sm font-medium text-dark-300 hover:text-white hover:bg-white/[0.04] transition-all"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 rounded-xl text-sm font-semibold text-accent-500 hover:bg-accent-500/10 transition-all"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-[72px]">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-accent-500" />
            <span className="text-sm font-semibold text-dark-200">VaultShare</span>
          </div>
          <p className="text-xs text-dark-500">
            © {new Date().getFullYear()} VaultShare. Military-grade encryption for your files.
          </p>
        </div>
      </footer>
    </div>
  );
};
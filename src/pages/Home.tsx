import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Upload, Download, Lock, Clock, Users, ArrowRight, Zap, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Home: React.FC = () => {
  const { user } = useAuth();

  const features = [
    { icon: Lock, title: 'AES-256 Encryption', description: 'Military-grade encryption protects your files with the strongest available standards.' },
    { icon: Clock, title: 'Auto-Expiration', description: 'Files auto-delete after your specified time — you set the rules.' },
    { icon: Download, title: 'Download Limits', description: 'Cap how many times a file can be downloaded for tighter access control.' },
    { icon: Users, title: 'Access Control', description: 'Require login or a password before anyone can download.' },
    { icon: Eye, title: 'Activity Tracking', description: 'See real-time download counts and monitor file access.' },
    { icon: Zap, title: 'Instant Sharing', description: 'Generate a secure encrypted link the moment your file uploads.' },
  ];

  return (
    <div className="min-h-screen">

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        {/* Glow orbs */}
        <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-accent-500/[0.07] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-[200px] right-[10%] w-[300px] h-[300px] bg-cyan-500/[0.04] rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-accent-500/10 border border-accent-500/15 mb-8 animate-fade-in">
              <div className="w-1.5 h-1.5 rounded-full bg-accent-500 animate-pulse" />
              <span className="text-xs font-medium text-accent-400 tracking-wide uppercase">End-to-end encrypted file sharing</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] mb-6 animate-fade-up">
              Secure file sharing
              <br />
              <span className="gradient-text">made simple</span>
            </h1>

            <p className="text-base md:text-lg text-dark-400 max-w-xl mx-auto mb-10 animate-fade-up delay-100 leading-relaxed">
              Military-grade encryption with password protection, auto-expiration, and download limits.
              Share sensitive documents with total confidence.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up delay-200">
              <Link to={user ? "/upload" : "/register"} className="btn-accent text-sm gap-2 group">
                {user ? "Start Uploading" : "Get Started Free"}
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="#features" className="btn-ghost text-sm">Explore Features</a>
            </div>
          </div>

          {/* Stats bar */}
          <div className="mt-16 glass-card p-5 md:p-6 max-w-3xl mx-auto animate-fade-up delay-300">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { value: 'AES-256', label: 'Encryption' },
                { value: '100MB', label: 'Max File Size' },
                { value: '∞', label: 'File Types' },
                { value: '99.9%', label: 'Uptime' },
              ].map((s, i) => (
                <div key={i} className="text-center relative">
                  {i > 0 && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-px h-8 bg-dark-700 hidden md:block" />}
                  <div className="text-xl md:text-2xl font-bold text-white">{s.value}</div>
                  <div className="text-xs text-dark-500 uppercase tracking-widest mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section id="features" className="py-16 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-accent-500/10 border border-accent-500/15 mb-4">
              <Shield className="h-3.5 w-3.5 text-accent-400" />
              <span className="text-xs font-medium text-accent-400 uppercase tracking-wide">Features</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight mb-3">
              Bank-level security <span className="text-dark-400">for your files</span>
            </h2>
            <p className="text-sm text-dark-500 max-w-md mx-auto leading-relaxed">
              Advanced encryption and controls to protect your most sensitive documents
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <div key={i} className="glass-card-hover p-6 group">
                <div className="w-11 h-11 rounded-xl bg-accent-500/10 border border-accent-500/15 flex items-center justify-center mb-4 group-hover:bg-accent-500/20 group-hover:border-accent-500/25 transition-all duration-400">
                  <f.icon className="h-5 w-5 text-accent-400" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-dark-400 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────── */}
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight mb-3">How it works</h2>
            <p className="text-sm text-dark-500">Three steps to share files securely</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { step: '01', title: 'Upload', desc: 'Select your file and set security options — password, expiry, download limits.' },
              { step: '02', title: 'Encrypt', desc: 'Your file is encrypted with AES-256. A unique secure download link is created.' },
              { step: '03', title: 'Share', desc: 'Share the link. Recipients download with all the protections you configured.' },
            ].map((item, i) => (
              <div key={i} className="relative group">
                <div className="glass-card p-7 h-full transition-all duration-300 hover:border-accent-500/15">
                  <div className="text-5xl font-extrabold text-dark-800 mb-4 group-hover:text-accent-500/15 transition-colors duration-500">{item.step}</div>
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-dark-400 leading-relaxed">{item.desc}</p>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-2 text-dark-700 z-10">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto relative">
          <div className="absolute inset-0 bg-accent-500/[0.04] rounded-3xl blur-[60px]" />
          <div className="relative glass-card p-10 md:p-12 text-center overflow-hidden">
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-500/40 to-transparent" />
            <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight mb-4">
              Ready to secure your files?
            </h2>
            <p className="text-sm text-dark-400 max-w-md mx-auto mb-8">
              Join users who trust VaultShare for their secure file sharing needs.
            </p>
            <Link to={user ? "/upload" : "/register"} className="btn-accent text-sm gap-2 group">
              {user ? "Upload Files Now" : "Start Free Today"}
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};
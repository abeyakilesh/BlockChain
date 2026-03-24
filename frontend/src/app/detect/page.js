'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function DetectPage() {
  const [file, setFile] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);

  const handleScan = async (e) => {
    e.preventDefault();
    if (!file) return;

    setScanning(true);
    setResult(null);

    const scanToast = toast.loading('Extracting AI fingerprint & scanning registry...');

    try {
      const data = await api.detectContent(file);
      setResult(data);
      
      if (data.matchFound) {
        toast.success('Match found in registry!', { id: scanToast });
      } else {
        toast.success('No matches found. This content appears unique.', { id: scanToast });
      }
    } catch (err) {
      toast.error(err.message || 'Detection failed', { id: scanToast });
    } finally {
      setScanning(false);
    }
  };

  return (
    <main className="page-container relative overflow-hidden">
      <Navbar />
      
      {/* Background vectors */}
      <div className="absolute top-1/4 -right-1/4 w-1/2 h-1/2 bg-neon-cyan/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-neon-purple/5 rounded-full blur-[120px]" />

      <div className="pt-32 pb-16 relative z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan text-sm font-medium mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-cyan opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-cyan"></span>
            </span>
            Live AI Detection Engine
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Verify Content <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple">Originality</span>
          </h1>
          <p className="text-lg text-white/50 mb-10 max-w-2xl mx-auto">
            Upload any image, audio, or video. Our AI will extract its perceptual fingerprint and compare it against the immutable blockchain registry to detect unauthorized copies.
          </p>

          {/* Scanner UI */}
          <div className="glass-card p-2 md:p-8 max-w-2xl mx-auto text-left relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/5 to-neon-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <form onSubmit={handleScan} className="relative z-10 flex flex-col items-center">
              <label className={`w-full h-64 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300
                ${file ? 'border-neon-cyan/50 bg-neon-cyan/5' : 'border-white/10 hover:border-white/30 hover:bg-white/[0.02]'}`}>
                {file ? (
                  <div className="text-center px-4">
                    <div className="w-16 h-16 mx-auto mb-4 bg-neon-cyan/20 rounded-xl flex items-center justify-center">
                      <span className="text-3xl">📄</span>
                    </div>
                    <p className="text-white font-medium text-lg truncate mb-1">{file.name}</p>
                    <p className="text-white/40 text-sm">Ready to scan ({(file.size/1024/1024).toFixed(2)} MB)</p>
                  </div>
                ) : (
                  <div className="text-center px-4">
                    <div className="w-16 h-16 mx-auto mb-4 bg-white/5 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                      <svg className="w-8 h-8 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    </div>
                    <p className="text-white font-medium text-lg mb-1">Drop content here</p>
                    <p className="text-white/40 text-sm">Supports JPG, PNG, MP3, WAV, MP4</p>
                  </div>
                )}
                <input type="file" className="hidden" onChange={(e) => {
                  setFile(e.target.files[0]);
                  setResult(null);
                }} />
              </label>

              <button 
                type="submit" 
                disabled={!file || scanning}
                className="mt-6 w-full max-w-sm py-4 bg-gradient-to-r from-neon-cyan to-neon-purple text-white font-bold rounded-xl
                         disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(0,212,255,0.3)] transition-all duration-300 flex items-center justify-center gap-3">
                {scanning ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Scanning Registry...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Run AI Verification
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Results Area */}
          {result && (
            <div className={`max-w-2xl mx-auto mt-8 animate-slide-up glass-card p-6 md:p-8 text-left border 
              ${result.matchFound ? 'border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.1)]' : 'border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.1)]'}`}>
              
              <div className="flex items-start gap-4 mb-6">
                <div className={`p-3 rounded-xl ${result.matchFound ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                  {result.matchFound ? (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  ) : (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  )}
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${result.matchFound ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {result.matchFound ? 'Match Found in Registry' : 'No Matches Found'}
                  </h3>
                  <p className="text-sm text-white/60 mt-1">
                    {result.matchFound 
                      ? 'This content closely matches an existing registered asset on CreatorChain.'
                      : 'This content appears to be original and does not exist in our blockchain registry.'}
                  </p>
                </div>
              </div>

              {result.matchFound && result.content && (
                <div className="bg-dark-900 rounded-xl p-5 border border-white/5 space-y-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <span className="text-white/40 text-sm">Similarity Score</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500" style={{ width: `${result.similarity}%` }} />
                      </div>
                      <span className="text-amber-500 font-bold">{result.similarity}%</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                    <div>
                      <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Original Title</p>
                      <Link href={`/content/${result.content.id}`} className="text-white font-medium hover:text-neon-cyan transition-colors">
                        {result.content.title}
                      </Link>
                    </div>
                    <div>
                      <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Registered Owner</p>
                      <p className="text-white font-medium">{result.content.creator_name}</p>
                    </div>
                  </div>
                  
                  <div className="pt-3">
                     <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Blockchain ID</p>
                     <p className="font-mono text-xs text-white/60 break-all">{result.content.tx_hash}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { UploadCloud, FileText, XCircle, CheckCircle, Search } from 'lucide-react';
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
    <main className="page-container">
      <Navbar />

      <div className="pt-32 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 text-sm font-medium mb-6 text-gray-600 dark:text-gray-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Live AI Detection Engine
          </div>
          
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-4">
            Verify Content <span className="text-primary-600 dark:text-primary-400">Originality</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
            Upload any image, audio, or video. Our AI will extract its perceptual fingerprint and compare it against the immutable blockchain registry to detect unauthorized copies.
          </p>

          {/* Scanner UI */}
          <div className="card p-6 md:p-8 max-w-2xl mx-auto text-left">
            <form onSubmit={handleScan} className="flex flex-col items-center">
              <label className={`w-full h-56 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-200
                ${file ? 'border-primary-400 bg-primary-50 dark:bg-primary-500/5' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}>
                {file ? (
                  <div className="text-center px-4">
                    <FileText className="w-10 h-10 text-primary-500 mx-auto mb-3" strokeWidth={1.5} />
                    <p className="text-gray-900 dark:text-white font-medium truncate mb-1">{file.name}</p>
                    <p className="text-gray-400 text-sm">Ready to scan ({(file.size/1024/1024).toFixed(2)} MB)</p>
                  </div>
                ) : (
                  <div className="text-center px-4">
                    <UploadCloud className="w-10 h-10 text-gray-400 mx-auto mb-3" strokeWidth={1.5} />
                    <p className="text-gray-700 dark:text-gray-300 font-medium mb-1">Drop content here</p>
                    <p className="text-gray-400 text-sm">Supports JPG, PNG, MP3, WAV, MP4</p>
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
                className="mt-6 w-full max-w-sm btn-primary py-3 flex items-center justify-center gap-2">
                {scanning ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Scanning Registry...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Run AI Verification
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Results Area */}
          {result && (
            <div className={`max-w-2xl mx-auto mt-8 animate-slide-up card p-6 md:p-8 text-left border ${
              result.matchFound ? 'border-amber-300 dark:border-amber-500/30' : 'border-emerald-300 dark:border-emerald-500/30'
            }`}>
              
              <div className="flex items-start gap-4 mb-6">
                <div className={`p-2.5 rounded-xl ${result.matchFound ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-500' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500'}`}>
                  {result.matchFound ? <XCircle className="w-6 h-6" /> : <CheckCircle className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className={`text-lg font-semibold ${result.matchFound ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {result.matchFound ? 'Match Found in Registry' : 'No Matches Found'}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {result.matchFound 
                      ? 'This content closely matches an existing registered asset on CreatorChain.'
                      : 'This content appears to be original and does not exist in our blockchain registry.'}
                  </p>
                </div>
              </div>

              {result.matchFound && result.content && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5 space-y-4">
                  <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3">
                    <span className="text-gray-500 text-sm">Similarity Score</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500" style={{ width: `${result.similarity}%` }} />
                      </div>
                      <span className="text-amber-600 dark:text-amber-400 font-semibold text-sm">{result.similarity}%</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400 text-xs font-medium mb-1">Original Title</p>
                      <Link href={`/content/${result.content.id}`} className="text-gray-900 dark:text-white font-medium hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                        {result.content.title}
                      </Link>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs font-medium mb-1">Registered Owner</p>
                      <p className="text-gray-900 dark:text-white font-medium">{result.content.creator_name}</p>
                    </div>
                  </div>
                  
                  <div className="pt-3">
                     <p className="text-gray-400 text-xs font-medium mb-1">Blockchain ID</p>
                     <p className="font-mono text-xs text-gray-500 break-all">{result.content.tx_hash}</p>
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

'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';

export default function DetectPage() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleDetect = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    setResults({
      matchFound: true,
      query_fingerprint: 'e3b0c442...98fc1c14',
      matches: [{
        contentId: '1', title: 'Neon City Skyline', creator: 'Alex Chen',
        creatorWallet: '0x1234...abcd', similarity: 0.94,
        registeredAt: '2026-03-20T14:30:00Z', txHash: '0xa1b2c3...abcdef',
        ipfsCid: 'QmSimAbC123...',
      }],
    });
    setLoading(false);
  };

  return (
    <main className="page-container">
      <Navbar />
      <div className="pt-24 pb-16 content-wrapper max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-5xl mb-4 block">🔍</span>
          <h1 className="text-3xl font-bold text-white">Content Detection</h1>
          <p className="text-white/40 mt-2 max-w-lg mx-auto">Upload any file to check if it matches registered content.</p>
        </div>

        <form onSubmit={handleDetect}>
          <label className={`block w-full p-12 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${file ? 'border-neon-cyan/50 bg-neon-cyan/5' : 'border-white/10 hover:border-white/20'}`}>
            {file ? (
              <div><span className="text-5xl block mb-3">✅</span><p className="text-white font-medium">{file.name}</p><p className="text-sm text-white/40 mt-1">{(file.size/1024/1024).toFixed(2)} MB</p></div>
            ) : (
              <div><span className="text-5xl block mb-3">📤</span><p className="text-white/60">Drop a file or click to upload</p></div>
            )}
            <input type="file" className="hidden" onChange={(e)=>setFile(e.target.files[0])} accept="image/*,audio/*,video/*" />
          </label>
          <button type="submit" disabled={loading||!file} className="btn-primary w-full mt-6 py-4 text-lg flex items-center justify-center gap-2">
            {loading ? (<><svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Analyzing...</>) : '🔬 Scan for Matches'}
          </button>
        </form>

        {results && (
          <div className="mt-12 animate-slide-up">
            <div className={`glass-card p-6 mb-6 border ${results.matchFound?'border-amber-500/30':'border-emerald-500/30'}`}>
              <div className="flex items-center gap-4">
                <span className="text-4xl">{results.matchFound?'⚠️':'✅'}</span>
                <div>
                  <h3 className={`text-lg font-bold ${results.matchFound?'text-amber-400':'text-emerald-400'}`}>{results.matchFound?'Match Found!':'No Matches'}</h3>
                  <p className="text-sm text-white/40">{results.matchFound?'This content matches registered work.':'No matching fingerprints found.'}</p>
                </div>
              </div>
            </div>
            {results.matches?.map((m,i)=>(
              <div key={i} className="glass-card p-6 mb-4">
                <div className="flex items-start justify-between mb-4">
                  <div><h4 className="font-semibold text-white">{m.title}</h4><p className="text-sm text-white/40">by {m.creator}</p></div>
                  <div className="text-right"><div className="text-2xl font-bold text-red-400">{(m.similarity*100).toFixed(1)}%</div><div className="text-xs text-white/30">Similarity</div></div>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2 mb-4"><div className="h-2 rounded-full bg-red-500" style={{width:`${m.similarity*100}%`}}/></div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div><span className="text-white/30">Creator Wallet</span><p className="font-mono text-white/60 mt-0.5">{m.creatorWallet}</p></div>
                  <div><span className="text-white/30">Registered</span><p className="text-white/60 mt-0.5">{new Date(m.registeredAt).toLocaleDateString()}</p></div>
                  <div><span className="text-white/30">TX Hash</span><p className="font-mono text-white/60 mt-0.5">{m.txHash}</p></div>
                  <div><span className="text-white/30">IPFS CID</span><p className="font-mono text-white/60 mt-0.5">{m.ipfsCid}</p></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

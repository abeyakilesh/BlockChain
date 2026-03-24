'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';

const statusColors = {
  PENDING: 'badge-pending',
  PROCESSING: 'badge-pending',
  FINGERPRINTING: 'badge-info',
  UPLOADING_IPFS: 'badge-info',
  REGISTERING_BLOCKCHAIN: 'badge-info',
  REGISTERED: 'badge-success',
  REJECTED: 'badge-error',
  FAILED: 'badge-error',
};

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [content, setContent] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadMeta, setUploadMeta] = useState({ title: '', description: '', category: 'image', price: '0.01' });
  const [uploading, setUploading] = useState(false);
  const [activeJobs, setActiveJobs] = useState([]);
  const [tab, setTab] = useState('content');

  useEffect(() => {
    const userData = localStorage.getItem('creatorchain_user');
    if (userData) {
      try { setUser(JSON.parse(userData)); } catch {}
    }
    // In a real app, we'd fetch from API
    // For demo, populate with mock data
    setContent([
      { id: '1', title: 'Sunset Photography', category: 'image', status: 'REGISTERED', price: '0.05', preview_url: null, license_count: 12, total_earnings: '0.60', created_at: new Date().toISOString(), ipfs_cid: 'QmSim1234', tx_hash: '0x1234...abcd' },
      { id: '2', title: 'Lo-fi Beat Pack', category: 'audio', status: 'REGISTERED', price: '0.10', preview_url: null, license_count: 8, total_earnings: '0.80', created_at: new Date().toISOString(), ipfs_cid: 'QmSim5678', tx_hash: '0x5678...efgh' },
      { id: '3', title: 'Motion Graphics Intro', category: 'video', status: 'PROCESSING', price: '0.25', preview_url: null, license_count: 0, total_earnings: '0', created_at: new Date().toISOString() },
    ]);
    setEarnings({
      totalEarnings: 1.40,
      totalClaimed: 0.50,
      unclaimed: 0.90,
      dailyEarnings: [
        { date: '2026-03-20', daily_amount: 0.15 },
        { date: '2026-03-21', daily_amount: 0.25 },
        { date: '2026-03-22', daily_amount: 0.10 },
        { date: '2026-03-23', daily_amount: 0.40 },
        { date: '2026-03-24', daily_amount: 0.50 },
      ],
    });
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;
    setUploading(true);

    try {
      const data = await api.uploadContent(uploadFile, uploadMeta);
      setActiveJobs([...activeJobs, { jobId: data.jobId, contentId: data.contentId, ...uploadMeta, status: 'PENDING' }]);
      setShowUpload(false);
      setUploadFile(null);
      setUploadMeta({ title: '', description: '', category: 'image', price: '0.01' });
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="page-container">
      <Navbar />

      <div className="pt-24 pb-16 content-wrapper">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Creator Dashboard</h1>
            <p className="text-white/40 mt-1">Manage your content, track earnings, and claim royalties</p>
          </div>
          <button onClick={() => setShowUpload(true)} className="btn-primary mt-4 md:mt-0 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Upload Content
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Content', value: content.length, icon: '📁', color: 'from-cyan-500 to-blue-500' },
            { label: 'Total Earnings', value: `${earnings?.totalEarnings || 0} MATIC`, icon: '💰', color: 'from-emerald-500 to-teal-500' },
            { label: 'Unclaimed', value: `${earnings?.unclaimed || 0} MATIC`, icon: '🔓', color: 'from-amber-500 to-orange-500' },
            { label: 'Total Licenses', value: content.reduce((sum, c) => sum + (parseInt(c.license_count) || 0), 0), icon: '🎫', color: 'from-purple-500 to-pink-500' },
          ].map((stat, i) => (
            <div key={i} className="glass-card p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{stat.icon}</span>
                <div className={`w-8 h-1 rounded-full bg-gradient-to-r ${stat.color}`} />
              </div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-white/40 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Earnings Chart (simplified bar representation) */}
        {earnings?.dailyEarnings && (
          <div className="glass-card p-6 mb-8">
            <h3 className="font-semibold text-white mb-4">Earnings (Last 5 days)</h3>
            <div className="flex items-end gap-3 h-32">
              {earnings.dailyEarnings.map((day, i) => {
                const maxAmount = Math.max(...earnings.dailyEarnings.map(d => parseFloat(d.daily_amount)));
                const height = (parseFloat(day.daily_amount) / maxAmount) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-xs text-white/60">{parseFloat(day.daily_amount).toFixed(2)}</span>
                    <div className="w-full rounded-t-lg bg-gradient-to-t from-neon-cyan/30 to-neon-cyan/70 transition-all duration-500"
                         style={{ height: `${height}%`, minHeight: '8px' }} />
                    <span className="text-xs text-white/30">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 p-1 glass-card rounded-xl mb-6 max-w-sm">
          {['content', 'processing'].map((t) => (
            <button key={t} onClick={() => setTab(t)}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                      tab === t ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'
                    }`}>
              {t === 'content' ? 'My Content' : 'Processing'}
            </button>
          ))}
        </div>

        {/* Content Table */}
        {tab === 'content' && (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left px-6 py-4 text-xs text-white/40 uppercase tracking-wider">Content</th>
                    <th className="text-left px-6 py-4 text-xs text-white/40 uppercase tracking-wider">Type</th>
                    <th className="text-left px-6 py-4 text-xs text-white/40 uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-4 text-xs text-white/40 uppercase tracking-wider">Price</th>
                    <th className="text-left px-6 py-4 text-xs text-white/40 uppercase tracking-wider">Licenses</th>
                    <th className="text-left px-6 py-4 text-xs text-white/40 uppercase tracking-wider">Earned</th>
                  </tr>
                </thead>
                <tbody>
                  {content.map((item) => (
                    <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white text-sm">{item.title}</div>
                        {item.ipfs_cid && <div className="text-xs text-white/30 font-mono mt-0.5">{item.ipfs_cid.substring(0, 16)}...</div>}
                      </td>
                      <td className="px-6 py-4 text-sm text-white/60 capitalize">{item.category}</td>
                      <td className="px-6 py-4"><span className={statusColors[item.status]}>{item.status}</span></td>
                      <td className="px-6 py-4 text-sm text-white/60">{item.price} MATIC</td>
                      <td className="px-6 py-4 text-sm text-white/60">{item.license_count}</td>
                      <td className="px-6 py-4 text-sm text-neon-cyan font-medium">{item.total_earnings} MATIC</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Processing Jobs */}
        {tab === 'processing' && (
          <div className="space-y-4">
            {activeJobs.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <span className="text-4xl mb-4 block">⏳</span>
                <p className="text-white/40">No active processing jobs</p>
              </div>
            ) : (
              activeJobs.map((job) => (
                <div key={job.jobId} className="glass-card p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-white">{job.title}</span>
                    <span className={statusColors[job.status]}>{job.status}</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-2">
                    <div className="bg-gradient-to-r from-neon-cyan to-neon-purple h-2 rounded-full transition-all duration-500"
                         style={{ width: '30%' }} />
                  </div>
                  <p className="text-xs text-white/30 mt-2">Job ID: {job.jobId}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* Claim Button */}
        {earnings && earnings.unclaimed > 0 && (
          <div className="mt-8 glass-card p-6 neon-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-white font-semibold">Unclaimed Royalties</p>
              <p className="text-2xl font-bold neon-text">{earnings.unclaimed} MATIC</p>
            </div>
            <button className="btn-primary flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              Withdraw via Merkle Proof
            </button>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card p-8 w-full max-w-lg neon-border animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Upload Content</h2>
              <button onClick={() => setShowUpload(false)} className="text-white/40 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              {/* File Drop Zone */}
              <label className="block w-full p-8 border-2 border-dashed border-white/10 rounded-xl text-center cursor-pointer
                               hover:border-neon-cyan/30 hover:bg-white/[0.02] transition-all">
                {uploadFile ? (
                  <div>
                    <span className="text-3xl">✅</span>
                    <p className="text-white mt-2">{uploadFile.name}</p>
                    <p className="text-xs text-white/40">{(uploadFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <div>
                    <span className="text-3xl">📁</span>
                    <p className="text-white/40 mt-2">Drop file or click to browse</p>
                    <p className="text-xs text-white/20 mt-1">Images, Audio, Video • Max 100MB</p>
                  </div>
                )}
                <input type="file" className="hidden" onChange={(e) => setUploadFile(e.target.files[0])}
                       accept="image/*,audio/*,video/*" />
              </label>

              <div>
                <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">Title</label>
                <input type="text" className="input-field" value={uploadMeta.title}
                       onChange={(e) => setUploadMeta({...uploadMeta, title: e.target.value})}
                       placeholder="Content title" required />
              </div>

              <div>
                <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">Description</label>
                <textarea className="input-field h-20 resize-none" value={uploadMeta.description}
                          onChange={(e) => setUploadMeta({...uploadMeta, description: e.target.value})}
                          placeholder="Describe your content" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">Category</label>
                  <select className="input-field" value={uploadMeta.category}
                          onChange={(e) => setUploadMeta({...uploadMeta, category: e.target.value})}>
                    <option value="image">Image</option>
                    <option value="audio">Audio</option>
                    <option value="video">Video</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">Price (MATIC)</label>
                  <input type="number" step="0.001" min="0" className="input-field" value={uploadMeta.price}
                         onChange={(e) => setUploadMeta({...uploadMeta, price: e.target.value})} />
                </div>
              </div>

              <button type="submit" disabled={uploading || !uploadFile}
                      className="btn-primary w-full flex items-center justify-center gap-2">
                {uploading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Uploading...
                  </>
                ) : 'Upload & Process'}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import StatusTracker from '@/components/StatusTracker';
import EarningsChart from '@/components/EarningsChart';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';

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
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [content, setContent] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadMeta, setUploadMeta] = useState({ title: '', description: '', category: 'image', price: '0.01' });
  const [uploading, setUploading] = useState(false);
  const [activeJobs, setActiveJobs] = useState([]);
  const [tab, setTab] = useState('content');
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/auth');
      return;
    }

    const fetchData = async () => {
      try {
        const [contentRes, earningsRes] = await Promise.all([
          api.getMyContent(),
          api.getEarnings(),
        ]);
        setContent(contentRes.content || []);
        setEarnings(earningsRes);
        
        // Find any active jobs from the content list and add them to active jobs
        const pending = (contentRes.content || []).filter(c => !['REGISTERED', 'REJECTED', 'FAILED'].includes(c.status));
        if (pending.length > 0) {
          // We need job IDs, but content API might just have the item details.
          // For now, let's keep it simple — we'll only track new active jobs via session state on upload.
          // Real app would fetch incomplete jobs endpoint.
        }
      } catch (err) {
        toast.error('Failed to load dashboard data');
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, [user, authLoading, router]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;
    setUploading(true);

    try {
      const data = await api.uploadContent(uploadFile, uploadMeta);
      setActiveJobs(prev => [...prev, { jobId: data.jobId, contentId: data.contentId, ...uploadMeta, status: 'PENDING' }]);
      setShowUpload(false);
      setUploadFile(null);
      setUploadMeta({ title: '', description: '', category: 'image', price: '0.01' });
      setTab('processing');
      toast.success('Upload started! Checking for duplicates...', { icon: '🚀' });
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleJobComplete = (result) => {
    if (result.status === 'REGISTERED') {
      toast.success(`Content registered successfully!`, { icon: '📜' });
      // Refresh content list
      api.getMyContent().then(res => setContent(res.content || []));
    } else if (result.status === 'REJECTED') {
      toast.error(`Content rejected: ${result.error}`, { icon: '⚠️' });
    } else {
      toast.error(`Processing failed: ${result.error}`);
    }
  };

  const handleClaim = async () => {
    const amount = earnings?.unclaimed;
    if (!amount || amount <= 0) return;
    
    // Toast promise for claim
    toast.promise(
      api.claimRoyalty(amount, []), // The backend generates the real proof internally or requires it based on impl
      {
        loading: 'Verifying Merkle proof & claiming royalties...',
        success: () => {
          // Refresh earnings
          api.getEarnings().then(setEarnings);
          return `Successfully claimed ${amount} MATIC!`;
        },
        error: (err) => `Claim failed: ${err.message}`,
      }
    );
  };

  if (authLoading || fetching) {
    return (
      <main className="page-container">
        <Navbar />
        <div className="pt-32 flex justify-center"><div className="w-8 h-8 rounded-full border-2 border-neon-cyan border-t-transparent animate-spin" /></div>
      </main>
    );
  }

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

        {/* Earnings Chart */}
        <div className="mb-8">
          <EarningsChart dailyEarnings={earnings?.dailyEarnings || []} />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 glass-card rounded-xl mb-6 max-w-sm">
          {['content', 'processing'].map((t) => (
            <button key={t} onClick={() => setTab(t)}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                      tab === t ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'
                    }`}>
              {t === 'content' ? 'My Content' : `Processing (${activeJobs.length})`}
            </button>
          ))}
        </div>

        {/* Content Table */}
        {tab === 'content' && (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Content Info</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Type</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Price / Licenses</th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Earned</th>
                  </tr>
                </thead>
                <tbody>
                  {content.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-white/40">You haven't uploaded any content yet.</td>
                    </tr>
                  ) : content.map((item) => (
                    <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white text-sm">{item.title}</div>
                        {item.ipfs_cid && <div className="text-xs text-white/30 font-mono mt-0.5" title={item.ipfs_cid}>{item.ipfs_cid.substring(0, 16)}...</div>}
                      </td>
                      <td className="px-6 py-4 text-sm text-white/60 capitalize">{item.category}</td>
                      <td className="px-6 py-4"><span className={statusColors[item.status] || 'badge-pending'}>{item.status}</span></td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-white/80">{item.price} MATIC</div>
                        <div className="text-xs text-white/40 mt-0.5">{item.license_count || 0} sold</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-neon-cyan font-semibold text-right text-lg">
                        {item.total_earnings || 0}
                      </td>
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
                <p className="text-white/40">No active uploads processing</p>
              </div>
            ) : (
              activeJobs.map((job) => (
                <div key={job.jobId}>
                  <div className="mb-2 px-2 text-sm font-medium text-white">{job.title}</div>
                  <StatusTracker jobId={job.jobId} onComplete={handleJobComplete} />
                </div>
              ))
            )}
          </div>
        )}

        {/* Claim Button */}
        {earnings && Number(earnings.unclaimed) > 0 && (
          <div className="mt-8 glass-card p-6 border border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 animate-glow shadow-[0_0_30px_rgba(245,158,11,0.1)]">
            <div>
              <p className="text-white font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                Unclaimed Royalties Available
              </p>
              <div className="flex items-end gap-2 mt-1">
                <p className="text-3xl font-bold neon-text bg-gradient-to-r from-amber-400 to-orange-500">{earnings.unclaimed}</p>
                <p className="text-white/40 pb-1 font-medium text-sm">MATIC</p>
              </div>
            </div>
            <button onClick={handleClaim} className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl
                                                   transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/30 hover:scale-[1.02] flex items-center gap-2 text-lg">
              Withdraw via Merkle Proof
            </button>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-card p-8 w-full max-w-lg neon-border animate-slide-up shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Upload New Content</h2>
              <button type="button" onClick={() => setShowUpload(false)} className="text-white/40 hover:text-white p-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-5">
              <label className="block w-full p-8 border-2 border-dashed border-white/10 rounded-xl text-center cursor-pointer
                               hover:border-neon-cyan/30 hover:bg-white/[0.02] transition-colors focus-within:border-neon-cyan/50">
                {uploadFile ? (
                  <div>
                    <span className="text-3xl block mb-2">✅</span>
                    <p className="text-white font-medium truncate px-4">{uploadFile.name}</p>
                    <p className="text-xs text-white/40 mt-1">{(uploadFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <div>
                    <span className="text-3xl block mb-2 opacity-80">📁</span>
                    <p className="text-white/60 font-medium text-sm">Drop file or click to browse</p>
                    <p className="text-[10px] uppercase tracking-wider text-white/30 mt-2">Images, Audio, Video • Max 100MB</p>
                  </div>
                )}
                <input type="file" className="hidden" onChange={(e) => setUploadFile(e.target.files[0])}
                       accept="image/*,audio/*,video/*" />
              </label>

              <div>
                <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider font-semibold">Title</label>
                <input type="text" className="input-field" value={uploadMeta.title}
                       onChange={(e) => setUploadMeta({...uploadMeta, title: e.target.value})}
                       placeholder="e.g. Sunset Photography Pack" required />
              </div>

              <div>
                <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider font-semibold">Description</label>
                <textarea className="input-field h-24 resize-none" value={uploadMeta.description}
                          onChange={(e) => setUploadMeta({...uploadMeta, description: e.target.value})}
                          placeholder="Describe your content..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider font-semibold">Type</label>
                  <select className="input-field appearance-none" value={uploadMeta.category}
                          onChange={(e) => setUploadMeta({...uploadMeta, category: e.target.value})}>
                    <option value="image">Image</option>
                    <option value="audio">Audio</option>
                    <option value="video">Video</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider font-semibold">Price (MATIC)</label>
                  <input type="number" step="0.001" min="0" className="input-field" value={uploadMeta.price}
                         onChange={(e) => setUploadMeta({...uploadMeta, price: e.target.value})} />
                </div>
              </div>

              <button type="submit" disabled={uploading || !uploadFile}
                      className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 mt-2 text-base">
                {uploading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Uploading & Fingerprinting...
                  </>
                ) : 'Upload & Verify Ownership'}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

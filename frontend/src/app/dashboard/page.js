'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import StatusTracker from '@/components/StatusTracker';
import EarningsChart from '@/components/EarningsChart';
import { DashboardSkeleton } from '@/components/SkeletonLoader';
import { useAuth } from '@/context/AuthContext';
import { Folder, DollarSign, Unlock, Ticket, Plus, Clock, X, CheckCircle2, Upload } from 'lucide-react';
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
        
        const pending = (contentRes.content || []).filter(c => !['REGISTERED', 'REJECTED', 'FAILED'].includes(c.status));
        if (pending.length > 0) {
          // Real app would fetch incomplete jobs endpoint
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
      toast.success('Upload started! Checking for duplicates...');
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleJobComplete = (result) => {
    if (result.status === 'REGISTERED') {
      toast.success('Content registered successfully!');
      api.getMyContent().then(res => setContent(res.content || []));
    } else if (result.status === 'REJECTED') {
      toast.error(`Content rejected: ${result.error}`);
    } else {
      toast.error(`Processing failed: ${result.error}`);
    }
  };

  const handleClaim = async () => {
    const amount = earnings?.unclaimed;
    if (!amount || amount <= 0) return;
    
    toast.promise(
      api.claimRoyalty(amount, []),
      {
        loading: 'Verifying Merkle proof & claiming royalties...',
        success: () => {
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
        <div className="pt-24 pb-16 content-wrapper">
          <DashboardSkeleton />
        </div>
      </main>
    );
  }

  return (
    <main className="page-container">
      <Navbar />

      <div className="pt-24 pb-16 content-wrapper animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Creator Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage your content, track earnings, and claim royalties</p>
          </div>
          <button onClick={() => setShowUpload(true)} className="btn-primary mt-4 md:mt-0 flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" />
            Upload Content
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Content', value: content.length, Icon: Folder, color: 'text-primary-500', bg: 'bg-primary-50 dark:bg-primary-500/10' },
            { label: 'Total Earnings', value: `${earnings?.totalEarnings || 0} MATIC`, Icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
            { label: 'Unclaimed', value: `${earnings?.unclaimed || 0} MATIC`, Icon: Unlock, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' },
            { label: 'Total Licenses', value: content.reduce((sum, c) => sum + (parseInt(c.license_count) || 0), 0), Icon: Ticket, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-500/10' },
          ].map((stat, i) => (
            <div key={i} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <stat.Icon className={`w-4.5 h-4.5 ${stat.color}`} />
                </div>
              </div>
              <div className="text-2xl font-semibold text-gray-900 dark:text-white">{stat.value}</div>
              <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Earnings Chart */}
        <div className="mb-8">
          <EarningsChart dailyEarnings={earnings?.dailyEarnings || []} />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg mb-6 max-w-xs">
          {['content', 'processing'].map((t) => (
            <button key={t} onClick={() => setTab(t)}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-150 ${
                      tab === t ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                    }`}>
              {t === 'content' ? 'My Content' : `Processing (${activeJobs.length})`}
            </button>
          ))}
        </div>

        {/* Content Table */}
        {tab === 'content' && (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Content Info</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price / Licenses</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Earned</th>
                  </tr>
                </thead>
                <tbody>
                  {content.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-400">You haven&apos;t uploaded any content yet.</td>
                    </tr>
                  ) : content.map((item) => (
                    <tr key={item.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 dark:text-white text-sm">{item.title}</div>
                        {item.ipfs_cid && <div className="text-xs text-gray-400 font-mono mt-0.5" title={item.ipfs_cid}>{item.ipfs_cid.substring(0, 16)}...</div>}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 capitalize">{item.category}</td>
                      <td className="px-6 py-4"><span className={statusColors[item.status] || 'badge-pending'}>{item.status}</span></td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.price} MATIC</div>
                        <div className="text-xs text-gray-400 mt-0.5">{item.license_count || 0} sold</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-primary-600 dark:text-primary-400 font-semibold text-right">
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
              <div className="card p-12 text-center">
                <Clock className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 dark:text-gray-500">No active uploads processing</p>
              </div>
            ) : (
              activeJobs.map((job) => (
                <div key={job.jobId}>
                  <div className="mb-2 px-1 text-sm font-medium text-gray-900 dark:text-white">{job.title}</div>
                  <StatusTracker jobId={job.jobId} onComplete={handleJobComplete} />
                </div>
              ))
            )}
          </div>
        )}

        {/* Claim Button */}
        {earnings && Number(earnings.unclaimed) > 0 && (
          <div className="mt-8 card p-6 border-amber-200 dark:border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-gray-900 dark:text-white font-medium flex items-center gap-2 text-sm">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                Unclaimed Royalties Available
              </p>
              <div className="flex items-end gap-2 mt-1">
                <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{earnings.unclaimed}</p>
                <p className="text-gray-400 pb-1 font-medium text-sm">MATIC</p>
              </div>
            </div>
            <button onClick={handleClaim} className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg
                                                   transition-all duration-150 active:scale-[0.98] flex items-center gap-2">
              Withdraw via Merkle Proof
            </button>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 animate-fade-in">
          <div className="card p-8 w-full max-w-lg shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upload New Content</h2>
              <button type="button" onClick={() => setShowUpload(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-5">
              <label className="block w-full p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-center cursor-pointer
                               hover:border-primary-400 dark:hover:border-primary-500 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                {uploadFile ? (
                  <div>
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="text-gray-900 dark:text-white font-medium truncate px-4">{uploadFile.name}</p>
                    <p className="text-xs text-gray-400 mt-1">{(uploadFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 dark:text-gray-300 font-medium text-sm">Drop file or click to browse</p>
                    <p className="text-xs text-gray-400 mt-1">Images, Audio, Video · Max 100MB</p>
                  </div>
                )}
                <input type="file" className="hidden" onChange={(e) => setUploadFile(e.target.files[0])}
                       accept="image/*,audio/*,video/*" />
              </label>

              <div>
                <label className="block text-xs text-gray-500 mb-1.5 font-medium">Title</label>
                <input type="text" className="input-field" value={uploadMeta.title}
                       onChange={(e) => setUploadMeta({...uploadMeta, title: e.target.value})}
                       placeholder="e.g. Sunset Photography Pack" required />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1.5 font-medium">Description</label>
                <textarea className="input-field h-24 resize-none" value={uploadMeta.description}
                          onChange={(e) => setUploadMeta({...uploadMeta, description: e.target.value})}
                          placeholder="Describe your content..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5 font-medium">Type</label>
                  <select className="input-field appearance-none" value={uploadMeta.category}
                          onChange={(e) => setUploadMeta({...uploadMeta, category: e.target.value})}>
                    <option value="image">Image</option>
                    <option value="audio">Audio</option>
                    <option value="video">Video</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5 font-medium">Price (MATIC)</label>
                  <input type="number" step="0.001" min="0" className="input-field" value={uploadMeta.price}
                         onChange={(e) => setUploadMeta({...uploadMeta, price: e.target.value})} />
                </div>
              </div>

              <button type="submit" disabled={uploading || !uploadFile}
                      className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2 text-sm">
                {uploading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
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

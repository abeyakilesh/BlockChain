'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import StatusTracker from '@/components/StatusTracker';
import EarningsChart from '@/components/EarningsChart';
import ProcessingQueue from '@/components/ProcessingQueue';
import StatsCard from '@/components/StatsCard';
import UploadModal from '@/components/UploadModal';
import { DashboardSkeleton } from '@/components/SkeletonLoader';
import { useAuth } from '@/context/AuthContext';
import { Folder, DollarSign, Unlock, Ticket, Plus, Clock, CheckCircle2, Trash2 } from 'lucide-react';
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
      } catch (err) {
        // Silently fail — show empty state
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, [user, authLoading, router]);

  // ─── Upload Handler ─────────────────────────────────────
  const handleUpload = async (file, meta) => {
    if (!file) return;
    setUploading(true);

    try {
      const data = await api.uploadContent(file, meta);

      // Add to processing queue
      const job = {
        jobId: data.jobId || `job-${Date.now()}`,
        contentId: data.contentId,
        title: meta.title,
        category: meta.category,
        fileSize: file.size,
        status: data.status || 'PROCESSING',
      };

      // If already REGISTERED (inline processing), skip queue
      if (data.status === 'REGISTERED') {
        toast.success('Content uploaded & verified!');
        const res = await api.getMyContent();
        setContent(res.content || []);
      } else {
        setActiveJobs(prev => [...prev, job]);
        setTab('processing');
        toast.success('Upload started! Processing...');
      }

      setShowUpload(false);
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // ─── Job Completion Handler ─────────────────────────────
  const handleJobComplete = useCallback((result) => {
    if (result.status === 'REGISTERED') {
      toast.success('Content verified & minted!');
      api.getMyContent().then(res => setContent(res.content || []));
    } else if (result.status === 'REJECTED') {
      toast.error('Content rejected as duplicate');
    }
  }, []);

  const handleRemoveJob = useCallback((jobId) => {
    setActiveJobs(prev => prev.filter(j => j.jobId !== jobId));
  }, []);

  // ─── Delete Content ────────────────────────────────────
  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to remove this content from the marketplace?')) return;
    
    toast.promise(
      api.deleteContent(id),
      {
        loading: 'Removing content...',
        success: () => {
          setContent(prev => prev.map(c => c.id === id ? { ...c, status: 'DELETED' } : c));
          return 'Content moved to History';
        },
        error: 'Failed to remove content'
      }
    );
  };

  // ─── Claim Royalties ───────────────────────────────────
  const handleClaim = async () => {
    const amount = earnings?.unclaimed;
    if (!amount || amount <= 0) return;

    toast.promise(
      api.claimRoyalty(amount, earnings?.proof || []),
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

  // ─── Stats Card Details ─────────────────────────────────
  const activeContent = content.filter(c => c.status !== 'DELETED');
  const historyContent = content.filter(c => c.status === 'DELETED');
  const totalLicenses = activeContent.reduce((sum, c) => sum + (parseInt(c.license_count) || 0), 0);
  const registeredCount = activeContent.filter(c => c.status === 'REGISTERED').length;
  const pendingCount = activeContent.filter(c => !['REGISTERED', 'REJECTED', 'FAILED', 'DELETED'].includes(c.status)).length;

  const statsCards = [
    {
      label: 'Total Content',
      value: content.length,
      Icon: Folder,
      color: 'text-primary-500',
      bg: 'bg-primary-50 dark:bg-primary-500/10',
      detail: [
        { label: 'Registered', value: registeredCount },
        { label: 'Pending', value: pendingCount },
        { label: 'Total uploads', value: content.length },
      ],
    },
    {
      label: 'Total Earnings',
      value: `${earnings?.totalEarnings || 0} MATIC`,
      Icon: DollarSign,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50 dark:bg-emerald-500/10',
      detail: [
        { label: 'Total earned', value: `${earnings?.totalEarnings || 0} MATIC` },
        { label: 'Claimed', value: `${earnings?.totalClaimed || 0} MATIC` },
        { label: 'Pending', value: `${earnings?.unclaimed || 0} MATIC`, highlight: true },
      ],
    },
    {
      label: 'Unclaimed',
      value: `${earnings?.unclaimed || 0} MATIC`,
      Icon: Unlock,
      color: 'text-amber-500',
      bg: 'bg-amber-50 dark:bg-amber-500/10',
      detail: [
        { label: 'Available', value: `${earnings?.unclaimed || 0} MATIC`, highlight: true },
        { label: 'Via Merkle proof', value: 'Polygon' },
        { label: 'Gas fee', value: '~0.001 MATIC' },
      ],
    },
    {
      label: 'Total Licenses',
      value: totalLicenses,
      Icon: Ticket,
      color: 'text-violet-500',
      bg: 'bg-violet-50 dark:bg-violet-500/10',
      detail: [
        { label: 'Total sales', value: totalLicenses },
        { label: 'Unique content', value: content.filter(c => parseInt(c.license_count) > 0).length },
        { label: 'License type', value: 'Commercial' },
      ],
    },
  ];

  // ─── Loading State ──────────────────────────────────────
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
          <button
            onClick={() => setShowUpload(true)}
            className="btn-primary mt-4 md:mt-0 flex items-center gap-2 text-sm transition-all duration-200 hover:scale-[1.03] hover:shadow-lg hover:shadow-primary-500/20 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Upload Content
          </button>
        </div>

        {/* Stats Cards — Interactive */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statsCards.map((stat, i) => (
            <StatsCard key={i} {...stat} />
          ))}
        </div>

        {/* Earnings Chart — Interactive with Recharts */}
        <div className="mb-8">
          <EarningsChart transactions={earnings?.transactions || []} />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg mb-6 max-w-sm">
          {['content', 'processing', 'history'].map((t) => (
            <button key={t} onClick={() => setTab(t)}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                      tab === t ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                    }`}>
              {t === 'content' ? 'My Content' : t === 'history' ? 'History' : (
                <span className="flex items-center justify-center gap-1.5">
                  Processing
                  {activeJobs.length > 0 && (
                    <span className="w-5 h-5 rounded-full bg-primary-500 text-white text-[10px] flex items-center justify-center font-bold">
                      {activeJobs.length}
                    </span>
                  )}
                </span>
              )}
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
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {activeContent.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                        <Folder className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                        <p className="text-sm font-medium">No content uploaded yet</p>
                        <p className="text-xs mt-1">Click "Upload Content" to get started</p>
                      </td>
                    </tr>
                  ) : activeContent.map((item) => (
                    <tr key={item.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors duration-150 cursor-pointer group">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 dark:text-white text-sm group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{item.title}</div>
                        {item.fingerprint_hash && (
                          <div className="text-xs text-gray-400 font-mono mt-0.5" title={item.fingerprint_hash}>
                            SHA256: {item.fingerprint_hash.substring(0, 12)}...
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 capitalize">{item.content_type || item.category}</td>
                      <td className="px-6 py-4">
                        <span className={`${statusColors[item.status] || 'badge-pending'} transition-all duration-200`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.price} MATIC</div>
                        <div className="text-xs text-gray-400 mt-0.5">{item.license_count || 0} sold</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-primary-600 dark:text-primary-400 font-semibold text-right">
                        {item.total_earnings || 0}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={(e) => handleDelete(e, item.id)} className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Processing Queue */}
        {tab === 'processing' && (
          <ProcessingQueue
            jobs={activeJobs}
            onJobComplete={handleJobComplete}
            onRemoveJob={handleRemoveJob}
          />
        )}

        {/* History Tab */}
        {tab === 'history' && (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Deleted Content Info</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Uploaded on</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {historyContent.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="px-6 py-12 text-center text-gray-400">
                        <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                        <p className="text-sm font-medium">No history available</p>
                      </td>
                    </tr>
                  ) : historyContent.map(item => (
                    <tr key={item.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-all duration-200 opacity-60 hover:opacity-100 group">
                      <td className="px-6 py-4 relative overflow-hidden">
                        <div className="absolute inset-y-0 left-0 w-1 bg-gray-300 dark:bg-gray-700" />
                        <div className="font-semibold text-gray-900 dark:text-gray-200 line-through group-hover:no-underline decoration-gray-400">{item.title}</div>
                        <div className="text-xs text-gray-500 font-mono mt-1">{item.id}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 font-medium whitespace-nowrap">
                        {new Date(item.created_at || item.registered_at || new Date()).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-md text-xs font-semibold">
                          Creator Deleted
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Claim Button */}
        {earnings && Number(earnings.unclaimed) > 0 && (
          <div className="mt-8 card p-6 border-amber-200 dark:border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/5">
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
                                                   transition-all duration-200 active:scale-[0.98] hover:shadow-lg hover:shadow-amber-500/20 flex items-center gap-2">
              Withdraw via Merkle Proof
            </button>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <UploadModal
        show={showUpload}
        onClose={() => setShowUpload(false)}
        onSubmit={handleUpload}
        uploading={uploading}
      />
    </main>
  );
}

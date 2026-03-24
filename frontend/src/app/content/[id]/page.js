'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { DetailSkeleton } from '@/components/SkeletonLoader';
import { useAuth } from '@/context/AuthContext';
import { Lock, Music, Video, Image as ImageIcon, Link2, FileCheck } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function ContentDetailPage({ params }) {
  const router = useRouter();
  const { user } = useAuth();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const data = await api.getContent(params.id);
        setContent(data);
      } catch (err) {
        toast.error('Failed to load content details');
        router.push('/marketplace');
      } finally {
        setLoading(false);
      }
    };
    
    fetchContent();
  }, [params.id, router]);

  const handlePurchase = async () => {
    if (!user) {
      toast('Please log in to purchase licenses');
      router.push('/auth');
      return;
    }
    
    setPurchasing(true);
    const loadingToast = toast.loading('Purchasing license via Smart Contract...');
    
    try {
      await api.purchaseLicense(content.id);
      toast.success('License purchased successfully!', { id: loadingToast });
      
      const data = await api.getContent(params.id);
      setContent(data);
    } catch (err) {
      toast.error(err.message || 'Purchase failed', { id: loadingToast });
    } finally {
      setPurchasing(false);
    }
  };

  const downloadCertificate = () => {
    window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/content/${content.id}/certificate`, '_blank');
  };

  if (loading) {
    return (
      <main className="page-container">
        <Navbar />
        <div className="pt-24 pb-16 content-wrapper">
          <DetailSkeleton />
        </div>
      </main>
    );
  }

  if (!content) return null;

  const typeColors = {
    audio: 'bg-violet-500',
    video: 'bg-amber-500',
    image: 'bg-primary-500',
  };

  const typeIcons = {
    audio: <Music className="w-20 h-20 text-white/80" strokeWidth={1.5} />,
    video: <Video className="w-20 h-20 text-white/80" strokeWidth={1.5} />,
    image: <ImageIcon className="w-20 h-20 text-white/80" strokeWidth={1.5} />,
  };

  return (
    <main className="page-container">
      <Navbar />

      <div className="pt-24 pb-16 content-wrapper animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - Preview */}
          <div className="space-y-6">
            <div className={`aspect-square sm:aspect-video lg:aspect-square rounded-xl ${typeColors[content.category] || typeColors.image} 
                            flex items-center justify-center relative overflow-hidden`}>
              <div className="opacity-60">
                {typeIcons[content.category] || typeIcons.image}
              </div>
            </div>
            
            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-4 flex items-center gap-2">
                <Link2 className="w-4 h-4 text-primary-500" /> Blockchain Proof
              </h3>
              <div className="space-y-2 font-mono text-xs">
                {[
                  { label: 'Network', value: 'Polygon Amoy' },
                  { label: 'Block', value: content.block_number || 'Pending...' },
                  { label: 'TX Hash', value: content.tx_hash || 'Pending...', full: true },
                  { label: 'IPFS CID', value: content.ipfs_cid || 'Pending...', full: true },
                  { label: 'AI Fingerprint', value: content.fingerprint_hash || 'Pending...', full: true },
                ].map((row, i) => (
                  <div key={i} className={`${row.full ? 'flex flex-col gap-1' : 'flex justify-between items-center'} bg-gray-50 dark:bg-gray-800 p-3 rounded-lg`}>
                    <span className="text-gray-400 dark:text-gray-500">{row.label}</span>
                    <span className="text-gray-700 dark:text-gray-300 break-all">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div>
            <div className="mb-4">
              <span className="badge-success mb-3 block w-max">AI Verified & Notarized</span>
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white mb-2">{content.title}</h1>
              <div className="flex items-center gap-3 text-sm">
                <span className="px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 capitalize text-xs">{content.category}</span>
                <span className="text-gray-300 dark:text-gray-600">·</span>
                <span className="text-gray-500 dark:text-gray-400">Created by <span className="text-primary-600 dark:text-primary-400 font-medium">{content.creator_name}</span></span>
              </div>
            </div>

            <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-8 text-sm">{content.description || 'No description provided.'}</p>

            <div className="card p-6 mb-8">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <p className="text-gray-500 text-xs mb-1 font-medium">License Price</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">{content.price}</span>
                    <span className="text-gray-400 font-medium text-sm">MATIC</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-xs mb-1">Total Sales</p>
                  <p className="text-gray-900 dark:text-white font-semibold">{content.license_count || 0}</p>
                </div>
              </div>

              {content.creator_id === user?.id ? (
                <button className="btn-secondary w-full py-3 opacity-50 cursor-not-allowed">
                  You own this content
                </button>
              ) : (
                <button 
                  onClick={handlePurchase} 
                  disabled={purchasing || content.status !== 'REGISTERED'}
                  className="btn-primary w-full py-3 text-sm font-semibold flex flex-col items-center gap-0.5">
                  <span className="flex items-center gap-2">
                    {purchasing ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : 'License via Smart Contract'}
                  </span>
                  <span className="text-[10px] font-normal text-white/60">Gasless Transaction</span>
                </button>
              )}
            </div>

            <div className="card p-6">
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-amber-500" /> Proof of Authenticity
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
                This content has been cryptographically signed and fingerprinted by our AI. The exact perceptual hash is stored on the Polygon blockchain, rendering the registration immutable.
              </p>
              <button 
                onClick={downloadCertificate}
                disabled={content.status !== 'REGISTERED'}
                className="btn-secondary text-sm py-2 px-4">
                Download PDF Certificate
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

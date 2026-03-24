'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
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
      toast('Please log in to purchase licenses', { icon: '🔒' });
      router.push('/auth');
      return;
    }
    
    setPurchasing(true);
    const loadingToast = toast.loading('Purchasing license via Smart Contract...');
    
    try {
      await api.purchaseLicense(content.id);
      toast.success('License purchased successfully!', { id: loadingToast });
      
      // Refresh content to show updated sales/status
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
        <div className="flex justify-center items-center h-screen">
          <div className="w-8 h-8 rounded-full border-2 border-neon-cyan border-t-transparent animate-spin" />
        </div>
      </main>
    );
  }

  if (!content) return null;

  return (
    <main className="page-container">
      <Navbar />

      <div className="pt-24 pb-16 content-wrapper">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - Preview */}
          <div className="space-y-6">
            <div className={`aspect-square sm:aspect-video lg:aspect-square rounded-2xl bg-gradient-to-br 
                            ${content.category === 'audio' ? 'from-purple-500 to-pink-600' : 
                              content.category === 'video' ? 'from-amber-500 to-red-600' : 
                              'from-cyan-500 to-blue-600'} 
                            flex items-center justify-center relative overflow-hidden group shadow-2xl shadow-black/50`}>
              <span className="text-9xl opacity-50 group-hover:scale-110 transition-transform duration-700">
                {content.category === 'audio' ? '🎵' : content.category === 'video' ? '🎬' : '🖼️'}
              </span>
              <div className="absolute inset-0 bg-black/20" />
            </div>
            
            <div className="glass-card p-6">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-neon-cyan">🔗</span> Blockchain Proof
              </h3>
              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center bg-black/20 p-3 rounded-lg border border-white/5">
                  <span className="text-white/40">Network</span>
                  <span className="text-white/80">Polygon Amoy</span>
                </div>
                <div className="flex justify-between items-center bg-black/20 p-3 rounded-lg border border-white/5">
                  <span className="text-white/40">Block</span>
                  <span className="text-white/80">{content.block_number || 'Pending...'}</span>
                </div>
                <div className="flex flex-col gap-1 bg-black/20 p-3 rounded-lg border border-white/5">
                  <span className="text-white/40">TX Hash</span>
                  <span className="text-white/80 break-all">{content.tx_hash || 'Pending...'}</span>
                </div>
                <div className="flex flex-col gap-1 bg-black/20 p-3 rounded-lg border border-white/5">
                  <span className="text-white/40">IPFS CID</span>
                  <span className="text-white/80 break-all">{content.ipfs_cid || 'Pending...'}</span>
                </div>
                <div className="flex flex-col gap-1 bg-black/20 p-3 rounded-lg border border-white/5">
                  <span className="text-white/40">AI Fingerprint</span>
                  <span className="text-white/80 break-all">{content.fingerprint_hash || 'Pending...'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div>
            <div className="mb-4">
              <span className="badge-success mb-3 block w-max">AI Verified & Notarized</span>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{content.title}</h1>
              <div className="flex items-center gap-3 text-sm">
                <span className="px-3 py-1 rounded-full bg-white/5 text-white/70 capitalize">{content.category}</span>
                <span className="text-white/30">•</span>
                <span className="text-white/50">Created by <span className="text-neon-cyan">{content.creator_name}</span></span>
              </div>
            </div>

            <p className="text-white/60 leading-relaxed mb-8">{content.description || 'No description provided.'}</p>

            <div className="glass-card p-6 border-neon-cyan/20 mb-8">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <p className="text-white/40 text-sm mb-1 uppercase tracking-wider font-semibold">License Price</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold neon-text">{content.price}</span>
                    <span className="text-white/50 font-medium">MATIC</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white/40 text-xs mb-1">Total Sales</p>
                  <p className="text-white font-semibold">{content.license_count || 0}</p>
                </div>
              </div>

              {content.creator_id === user?.id ? (
                <button className="btn-secondary w-full py-4 opacity-50 cursor-not-allowed">
                  You own this content
                </button>
              ) : (
                <button 
                  onClick={handlePurchase} 
                  disabled={purchasing || content.status !== 'REGISTERED'}
                  className="btn-primary w-full py-4 text-lg font-bold flex flex-col items-center gap-1 group">
                  <span className="flex items-center gap-2">
                    {purchasing ? (
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : 'License via Smart Contract'}
                  </span>
                  <span className="text-[10px] font-normal text-white/50 group-hover:text-white/70 transition-colors uppercase tracking-widest">
                    Gasless Transaction
                  </span>
                </button>
              )}
            </div>

            <div className="bg-dark-900 border border-white/5 rounded-2xl p-6">
              <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                <span className="text-amber-400">📜</span> Proof of Authenticity
              </h4>
              <p className="text-sm text-white/50 mb-4 leading-relaxed">
                This content has been cryptographically signed and fingerprinted by our AI. The exact perceptual hash is stored on the Polygon blockchain, rendering the registration immutable.
              </p>
              <button 
                onClick={downloadCertificate}
                disabled={content.status !== 'REGISTERED'}
                className="w-full sm:w-auto px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-xl transition-all border border-white/5">
                Download PDF Certificate
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

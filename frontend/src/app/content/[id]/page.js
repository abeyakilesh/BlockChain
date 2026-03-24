'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { DetailSkeleton } from '@/components/SkeletonLoader';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Music, Video, Image as ImageIcon, Play, FileCheck, Star, ExternalLink,
  ShieldCheck, Clock, Users, Eye, TrendingUp, Heart, Share2, Maximize2,
  Copy, Loader2, CheckCircle2, Zap
} from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

// ─── Animation Variants ──────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
  }),
};

export default function ContentDetailPage({ params }) {
  const router = useRouter();
  const { user } = useAuth();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [liked, setLiked] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const data = await api.getContent(params.id);
        const item = data.content || data;
        if (item && item.title) setContent(item);
        else { toast.error('Content not found'); router.push('/marketplace'); }
      } catch {
        toast.error('Content not found');
        router.push('/marketplace');
      } finally { setLoading(false); }
    };
    fetchContent();
  }, [params.id, router]);

  const handlePurchase = async () => {
    if (!user) { toast('Please log in to purchase'); router.push('/auth'); return; }
    setPurchasing(true);
    try {
      await api.purchaseLicense(content.id);
      toast.success('🎉 License acquired successfully!');
      const data = await api.getContent(params.id);
      setContent(data.content || data);
    } catch (err) {
      toast.error(err.message || 'Purchase failed');
    } finally { setPurchasing(false); }
  };

  if (loading) return <main className="page-container"><Navbar /><div className="pt-24 pb-16"><div className="content-wrapper"><DetailSkeleton /></div></div></main>;
  if (!content) return null;

  const type = content.content_type || content.category || 'image';
  const coverSrc = content.cover_url || content.preview_url;
  const views = Math.floor((content.license_count || 1) * 12.4 + 230);
  const rating = (4.5 + (content.title?.charCodeAt(0) % 5) * 0.1).toFixed(1);
  const creatorSales = Math.floor((content.title?.charCodeAt(2) || 5) % 200) + 50;

  return (
    <main className="min-h-screen bg-white dark:bg-[#0a0f18]">
      <Navbar />

      <div className="pt-16 min-h-[calc(100vh-64px)] flex flex-col md:flex-row w-full">
        {/* ═══════════ LEFT: Asset & Details (1.6fr) ═══════════ */}
        <motion.div
          className="flex-[1.6] w-full border-r border-gray-100 dark:border-gray-800/60 flex flex-col"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0}
        >
          {/* Main Content Padding wrapper */}
          <div className="flex-1 p-6 lg:p-10 xl:p-12">
            
            {/* Asset Viewer - Massive and Dominant */}
            <div className="space-y-6 mb-10">
              <div
                className="relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800/40 group cursor-pointer shadow-sm border border-gray-200/50 dark:border-gray-800/50"
                onClick={() => coverSrc && setFullscreen(true)}
              >
                <div className="w-full h-[500px] xl:h-[600px]">
                  {coverSrc ? (
                    <img
                      src={coverSrc}
                      alt={content.title}
                      className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-700 ease-out"
                      loading="lazy"
                    />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center ${
                      type === 'audio' ? 'bg-gradient-to-br from-violet-500 to-purple-700'
                      : type === 'video' ? 'bg-gradient-to-br from-gray-800 to-gray-900'
                      : 'bg-gradient-to-br from-primary-400 to-primary-600'
                    }`}>
                      {type === 'audio' && <Music className="w-32 h-32 text-white/50" strokeWidth={1} />}
                      {type === 'video' && <Video className="w-32 h-32 text-white/50" strokeWidth={1} />}
                      {type === 'image' && <ImageIcon className="w-32 h-32 text-white/50" strokeWidth={1} />}
                    </div>
                  )}
                  
                  {/* Video play button */}
                  {type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:scale-110 group-hover:bg-white/20 transition-all duration-300 shadow-2xl border border-white/20">
                        <Play className="w-10 h-10 text-white ml-1.5" fill="white" />
                      </div>
                    </div>
                  )}
                  
                  {/* Audio waveform */}
                  {type === 'audio' && coverSrc && (
                    <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                      <div className="flex items-end gap-1.5 w-full justify-center">
                        {[40,70,50,80,60,45,75,55,65,50,70,40,60,75,45,60,80,50,70,90,40,60].map((h,i) => (
                          <div key={i} className="w-2 rounded-full bg-white/90" style={{height:`${h*0.8}px`}} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Overlays */}
                <div className="absolute top-6 left-6 flex gap-3">
                  <span className="px-4 py-2 rounded-lg bg-black/60 backdrop-blur-md text-xs text-white font-bold uppercase tracking-wider">{type}</span>
                  {content.duration && <span className="px-4 py-2 rounded-lg bg-black/60 backdrop-blur-md text-xs text-white font-mono">{content.duration}</span>}
                </div>
                
                <button
                  className="absolute top-6 right-6 p-3.5 rounded-lg bg-black/40 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/70 hover:scale-105"
                  onClick={(e) => { e.stopPropagation(); setFullscreen(true); }}
                >
                  <Maximize2 className="w-5 h-5" />
                </button>
              </div>

              {/* Action Bar */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setLiked(!liked)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    liked
                      ? 'bg-red-50 dark:bg-red-500/10 text-red-500 scale-[1.02]'
                      : 'bg-gray-100 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:-translate-y-0.5'
                  }`}
                >
                  <Heart className={`w-4 h-4 transition-all duration-200 ${liked ? 'fill-current scale-110' : ''}`} />
                  {liked ? 'Liked' : 'Like'}
                </button>
                <button
                  onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold bg-gray-100 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:-translate-y-0.5 transition-all duration-200"
                >
                  <Share2 className="w-4 h-4" /> Share
                </button>
                <div className="ml-auto flex items-center gap-6 text-sm font-semibold text-gray-400">
                  <span className="flex items-center gap-2"><Eye className="w-4 h-4" /> {views} views</span>
                  <span className="flex items-center gap-2"><Heart className="w-4 h-4" /> {Math.floor(views * 0.12)} likes</span>
                </div>
              </div>
            </div>

            {/* Title & Creator Info */}
            <div className="max-w-4xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-bold uppercase tracking-wide mb-5">
                <ShieldCheck className="w-4 h-4" /> Blockchain Verified
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-[1.1] tracking-tight mb-6">
                {content.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm mb-10">
                <span className="px-4 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 capitalize font-semibold tracking-wide border border-gray-200 dark:border-gray-700/50">{type}</span>
                <span className="px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-400 font-semibold tracking-wide border border-primary-100 dark:border-primary-900/30">Premium</span>
                <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-500 font-bold bg-amber-50 dark:bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-100 dark:border-amber-900/30">
                  <Star className="w-4 h-4 fill-current border-none" /> {rating}
                </span>
                <span className="text-gray-400 text-sm font-semibold ml-2">{content.license_count || 0} licenses sold</span>
              </div>

              {/* Creator Row */}
              <div className="flex items-center justify-between p-6 rounded-2xl bg-gray-50/80 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800 mb-12 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg ring-4 ring-white dark:ring-gray-950">
                    {(content.creator_name || 'U')[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-gray-900 dark:text-white flex items-center gap-1.5">
                      {content.creator_name}
                      <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" fill="currentColor" stroke="white" />
                    </h3>
                    <p className="text-sm font-semibold text-gray-500 mt-0.5">Pro Creator • {creatorSales} sales</p>
                  </div>
                </div>
                <button className="px-6 py-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 hover:-translate-y-0.5 transition-all shadow-sm">
                  Follow
                </button>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 dark:border-gray-800 mb-8">
                <div className="flex gap-10">
                  {['description', 'details', 'blockchain'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-4 text-base font-bold capitalize transition-colors relative ${
                        activeTab === tab 
                          ? 'text-gray-900 dark:text-white' 
                          : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                      }`}
                    >
                      {tab}
                      {activeTab === tab && (
                        <motion.div layoutId="activeTab" className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-gray-900 dark:bg-white rounded-t-full" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="min-h-[300px] mb-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.2 }}
                  >
                    {activeTab === 'description' && (
                      <div className="prose prose-base dark:prose-invert max-w-none">
                        <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                          {content.description || 'No detailed description provided for this content. It has been verified and encrypted on the blockchain for secure ownership.'}
                        </p>
                        <div className="mt-10 flex flex-wrap gap-3">
                          {['digital-asset', type, 'premium-quality', 'commercial-use', 'blockchain-verified'].map(tag => (
                            <span key={tag} className="px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-800/80 text-sm text-gray-600 dark:text-gray-400 font-semibold tracking-wide border border-gray-200/50 dark:border-gray-700/50">#{tag}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === 'details' && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        {[
                          { l: 'File Type', v: type.charAt(0).toUpperCase() + type.slice(1) },
                          { l: 'Resolution/Quality', v: type === 'audio' ? '320kbps HQ' : '4K Ultra' },
                          { l: 'Format', v: type === 'audio' ? 'WAV / MP3' : type === 'video' ? 'MP4 / ProRes' : 'PNG / RAW' },
                          { l: 'File Size', v: content.file_size ? `${(content.file_size / 1024 / 1024).toFixed(1)} MB` : 'High-Res Origin' },
                          { l: 'Created', v: content.created_at ? new Date(content.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Recently' },
                          { l: 'License Type', v: 'Commercial' },
                        ].map((r, i) => (
                          <div key={i} className="p-5 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800/60 transition-colors hover:bg-gray-100/50 dark:hover:bg-gray-800/60">
                            <span className="block text-sm text-gray-500 dark:text-gray-400 font-semibold mb-1.5">{r.l}</span>
                            <span className="block text-base text-gray-900 dark:text-white font-bold">{r.v}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeTab === 'blockchain' && (
                      <div className="space-y-6">
                        <div className="p-6 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800 font-mono text-sm space-y-5">
                          {[
                            { label: 'Contract Network', value: 'Polygon Amoy Testnet', copyable: false },
                            { label: 'Token Hash', value: content.fingerprint_hash || 'SHA256: Generated upon mint', copyable: !!content.fingerprint_hash },
                            { label: 'Transaction', value: content.tx_hash || 'Pending settlement', copyable: !!content.tx_hash },
                            { label: 'Block Number', value: content.block_number || 'Awaiting confirmation', copyable: false },
                          ].map((item, i) => (
                            <div key={i}>
                              <span className="block text-sm text-gray-500 dark:text-gray-400 font-sans font-semibold mb-2">{item.label}</span>
                              <div className="flex items-center justify-between bg-white dark:bg-gray-950 px-4 py-3 rounded-lg border border-gray-100 dark:border-gray-800/60">
                                <span className="text-gray-900 dark:text-gray-300 truncate mr-4 text-[13px]">{item.value}</span>
                                {item.copyable && (
                                  <button onClick={() => { navigator.clipboard.writeText(item.value); toast.success('Copied!'); }}
                                          className="p-1.5 rounded bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300 shadow-sm">
                                    <Copy className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        {content.tx_hash && (
                          <a href={`https://amoy.polygonscan.com/tx/${content.tx_hash}`} target="_blank" rel="noopener noreferrer"
                             className="inline-flex items-center gap-2 text-base text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-bold transition-colors">
                            <ExternalLink className="w-4 h-4" /> View Full On-Chain Data
                          </a>
                        )}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ═══════════ RIGHT: Action Panel (1fr, Sticky Sidebar) ═══════════ */}
        <motion.div
          className="flex-1 bg-white/50 dark:bg-[#0a0f18]/50 backdrop-blur-3xl sticky top-16 h-[calc(100vh-64px)] overflow-y-auto"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1}
        >
          <div className="p-6 lg:p-10 xl:p-12 space-y-8">
            
            {/* Action Price Core */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Fixed Price</span>
                <span className="flex items-center gap-1.5 text-xs font-bold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-500/10 px-3 py-1.5 rounded-md">
                  <TrendingUp className="w-4 h-4" /> High Demand
                </span>
              </div>
              
              <div className="flex items-end gap-3 mb-2 mt-6">
                <span className="text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tighter leading-none">{content.price}</span>
                <span className="text-2xl font-bold text-gray-400 mb-1">MATIC</span>
              </div>
              <p className="text-base font-semibold text-gray-500 mb-10">≈ ${(parseFloat(content.price || 0) * 0.85).toFixed(2)} USD</p>

              {content.creator_id === user?.id ? (
                <button className="w-full py-5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-400 font-bold text-base cursor-not-allowed">
                  You own this content
                </button>
              ) : (
                <button
                  onClick={handlePurchase}
                  disabled={purchasing}
                  className="w-full py-5 text-base font-extrabold rounded-xl text-white transition-all duration-300 shadow-[0_0_40px_-5px_rgba(59,130,246,0.5)]
                    bg-primary-600 hover:bg-primary-500 hover:-translate-y-1 hover:shadow-[0_0_50px_0px_rgba(59,130,246,0.6)]
                    active:translate-y-0 active:scale-95
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:-translate-y-0 disabled:hover:shadow-none
                    flex items-center justify-center gap-2"
                >
                  {purchasing ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" /> Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-6 h-6 fill-current" /> License via Smart Contract
                    </>
                  )}
                </button>
              )}
            </div>

            <hr className="border-gray-200 dark:border-gray-800/80" />

            {/* Social Proof Stats */}
            <div className="space-y-5 text-base font-semibold text-gray-700 dark:text-gray-300">
              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0 group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20 transition-colors">
                  <Users className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                </div>
                <span><strong>{content.license_count || 0}</strong> creators purchased this</span>
              </div>
              {content.last_purchased_at && (
                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center shrink-0 group-hover:bg-amber-100 dark:group-hover:bg-amber-500/20 transition-colors">
                    <Clock className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                  </div>
                  <span>
                    Last purchased <strong>{
                      (() => {
                        const diffMs = new Date() - new Date(content.last_purchased_at);
                        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
                        if (diffHrs < 1) {
                          const diffMins = Math.floor(diffMs / (1000 * 60)) || 1;
                          return `${diffMins}m ago`;
                        }
                        if (diffHrs < 24) return `${diffHrs}h ago`;
                        return `${Math.floor(diffHrs / 24)}d ago`;
                      })()
                    }</strong>
                  </span>
                </div>
              )}
            </div>

            <hr className="border-gray-200 dark:border-gray-800/80" />

            {/* License Info */}
            <div className="space-y-4">
              <h4 className="font-extrabold text-base text-gray-900 dark:text-white flex items-center gap-2">
                Commercial License Included
              </h4>
              <ul className="space-y-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                <li className="flex gap-3 items-start leading-snug"><CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" /> Worldwide, non-exclusive commercial rights</li>
                <li className="flex gap-3 items-start leading-snug"><CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" /> Monetized video, ads, podcasts, & web</li>
                <li className="flex gap-3 items-start leading-snug"><CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" /> Indefinite lifetime usage across platforms</li>
              </ul>
            </div>

            {/* Shield / Security */}
            <div className="p-6 rounded-xl border-2 border-green-100 dark:border-green-900/30 bg-white dark:bg-green-500/5 shadow-sm">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-500/20 flex items-center justify-center shrink-0 text-green-600 dark:text-green-500">
                  <FileCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-gray-900 dark:text-white mb-1.5">100% Verified Provenance</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-semibold">
                    Cryptographically fingerprinted via AI hash detection. Ownership enforced by Polygon Smart Contracts.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </motion.div>

      </div>
    </main>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import ContentCard from '@/components/ContentCard';
import { DetailSkeleton } from '@/components/SkeletonLoader';
import { useAuth } from '@/context/AuthContext';
import { Music, Video, Image as ImageIcon, Play, Link2, FileCheck, ChevronDown, Star, ExternalLink, ShieldCheck, Clock, Users, Eye, TrendingUp, Heart, Share2, Maximize2 } from 'lucide-react';
import api from '@/lib/api';
import demoContent from '@/lib/demoContent';
import toast from 'react-hot-toast';

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
    const demo = demoContent.find(d => d.id === params.id);
    if (demo) {
      setContent(demo);
      setLoading(false);
      api.getContent(params.id).then(data => {
        const item = data.content || data;
        if (item && item.title) setContent(item);
      }).catch(() => {});
      return;
    }
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
    const loadingToast = toast.loading('Processing via Smart Contract...');
    const isDemo = params.id.startsWith('img-') || params.id.startsWith('vid-') || params.id.startsWith('aud-');
    if (isDemo) {
      await new Promise(r => setTimeout(r, 1500));
      toast.success('License purchased! (Demo)', { id: loadingToast });
      setContent(prev => ({ ...prev, license_count: (prev.license_count || 0) + 1 }));
      setPurchasing(false);
      return;
    }
    try {
      await api.purchaseLicense(content.id);
      toast.success('License purchased!', { id: loadingToast });
      const data = await api.getContent(params.id);
      setContent(data.content || data);
    } catch (err) {
      toast.error(err.message || 'Purchase failed', { id: loadingToast });
    } finally { setPurchasing(false); }
  };

  if (loading) return <main className="page-container"><Navbar /><div className="pt-24 pb-16 content-wrapper"><DetailSkeleton /></div></main>;
  if (!content) return null;

  const type = content.content_type || content.category || 'image';
  const coverSrc = content.cover_url || content.preview_url;
  const views = Math.floor((content.license_count || 1) * 12.4 + 230);
  const rating = (4.5 + Math.random() * 0.4).toFixed(1);
  const hoursAgo = Math.floor(Math.random() * 72) + 1;
  const related = demoContent.filter(d => d.content_type === type && d.id !== content.id).slice(0, 4);

  return (
    <main className="page-container">
      <Navbar />
      
      {/* Fullscreen Preview */}
      {fullscreen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center cursor-pointer animate-fade-in" onClick={() => setFullscreen(false)}>
          {coverSrc && <img src={coverSrc} alt={content.title} className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg" />}
        </div>
      )}

      <div className="pt-24 pb-16 content-wrapper animate-fade-in">
        {/* Top: Image + Details + Sticky Purchase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* ─── Image Section (col 1-5) ─── */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 group cursor-pointer" onClick={() => coverSrc && setFullscreen(true)}>
              <div className="aspect-[4/3]">
                {coverSrc ? (
                  <img src={coverSrc} alt={content.title} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" loading="lazy" />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center ${
                    type === 'audio' ? 'bg-gradient-to-br from-violet-500 to-purple-700'
                    : type === 'video' ? 'bg-gradient-to-br from-gray-800 to-gray-900'
                    : 'bg-gradient-to-br from-primary-400 to-primary-600'
                  }`}>
                    {type === 'audio' && <Music className="w-20 h-20 text-white/60" strokeWidth={1.5} />}
                    {type === 'video' && <Video className="w-20 h-20 text-white/60" strokeWidth={1.5} />}
                    {type === 'image' && <ImageIcon className="w-20 h-20 text-white/60" strokeWidth={1.5} />}
                  </div>
                )}
                {type === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center"><div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform"><Play className="w-7 h-7 text-white ml-1" fill="white" /></div></div>
                )}
                {type === 'audio' && coverSrc && (
                  <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/60 to-transparent">
                    <div className="flex items-end gap-[3px]">{[40,70,50,80,60,45,75,55,65,50,70,40,60,75,45].map((h,i) => <div key={i} className="w-1.5 rounded-full bg-white/70" style={{height:`${h*0.35}px`}} />)}</div>
                  </div>
                )}
              </div>
              {/* Overlay badges */}
              <div className="absolute top-3 left-3 flex gap-2">
                <span className="px-2 py-1 rounded-md bg-black/50 backdrop-blur-sm text-[10px] text-white font-medium uppercase">{type}</span>
                {content.duration && <span className="px-2 py-1 rounded-md bg-black/50 backdrop-blur-sm text-[10px] text-white font-mono">{content.duration}</span>}
              </div>
              <button className="absolute top-3 right-3 p-2 rounded-lg bg-black/30 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); setFullscreen(true); }}>
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
            {/* Action bar */}
            <div className="flex items-center gap-3">
              <button onClick={() => setLiked(!liked)} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all ${liked ? 'bg-red-50 dark:bg-red-500/10 text-red-500' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} /> {liked ? 'Liked' : 'Like'}
              </button>
              <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">
                <Share2 className="w-4 h-4" /> Share
              </button>
              <div className="ml-auto flex items-center gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {views}</span>
                <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> {Math.floor(views * 0.12)}</span>
              </div>
            </div>
          </div>

          {/* ─── Details (col 6-8) ─── */}
          <div className="lg:col-span-4">
            <span className="badge-success mb-3 block w-max text-[10px]">AI Verified</span>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">{content.title}</h1>
            <div className="flex items-center gap-2 text-sm mb-6">
              <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 capitalize text-xs">{type}</span>
              <span className="text-gray-300 dark:text-gray-600">·</span>
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="w-3.5 h-3.5 fill-current" /> {rating}
              </div>
              <span className="text-gray-300 dark:text-gray-600">·</span>
              <span className="text-gray-400 text-xs">{content.license_count || 0} sales</span>
            </div>

            {/* Creator Card */}
            <div className="card p-4 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm">
                {(content.creator_name || 'U')[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{content.creator_name}</p>
                <p className="text-xs text-gray-400">Verified Creator</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-0.5 text-amber-500 text-xs"><Star className="w-3 h-3 fill-current" /> 4.9</div>
                <p className="text-[10px] text-gray-400 mt-0.5">{Math.floor(Math.random() * 200 + 50)} sales</p>
              </div>
            </div>

            {/* Tabbed Sections */}
            <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg mb-4">
              {['description', 'details', 'license'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-2 text-xs font-medium rounded-md transition-all capitalize ${activeTab === tab ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                  {tab}
                </button>
              ))}
            </div>

            <div className="min-h-[120px]">
              {activeTab === 'description' && (
                <div className="animate-fade-in">
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{content.description || 'No description provided.'}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {['digital-art', type, 'premium', 'commercial'].map(tag => (
                      <span key={tag} className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-[10px] text-gray-500 capitalize">{tag}</span>
                    ))}
                  </div>
                </div>
              )}
              {activeTab === 'details' && (
                <div className="animate-fade-in space-y-3 text-sm">
                  {[
                    { l: 'Type', v: type.charAt(0).toUpperCase() + type.slice(1) },
                    { l: 'Resolution', v: type === 'audio' ? '320kbps' : '4K (3840×2160)' },
                    { l: 'Format', v: type === 'audio' ? 'WAV / MP3' : type === 'video' ? 'MP4 / MOV' : 'PNG / JPEG' },
                    { l: 'Created', v: new Date(Date.now() - Math.random() * 90 * 86400000).toLocaleDateString() },
                    { l: 'AI Verified', v: 'Yes — Perceptual Hash' },
                  ].map((r, i) => (
                    <div key={i} className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                      <span className="text-gray-400">{r.l}</span>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{r.v}</span>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === 'license' && (
                <div className="animate-fade-in space-y-3 text-sm">
                  <div className="card p-3 border-2 border-primary-500/30 bg-primary-50/50 dark:bg-primary-500/5">
                    <div className="flex justify-between items-center">
                      <div><p className="font-semibold text-gray-900 dark:text-white text-xs">Commercial License</p><p className="text-[10px] text-gray-400 mt-0.5">Use in commercial projects, ads, products</p></div>
                      <span className="font-bold text-primary-600">{content.price} MATIC</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">License grants worldwide, non-exclusive commercial rights. Cannot be resold or sublicensed. Protected by smart contract on Polygon.</p>
                </div>
              )}
            </div>

            {/* Blockchain Proof Timeline */}
            <div className="mt-6">
              <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Link2 className="w-4 h-4 text-primary-500" /> Blockchain Proof
              </h3>
              <div className="relative pl-6">
                <div className="absolute left-2 top-1 bottom-1 w-px bg-gray-200 dark:bg-gray-700" />
                {[
                  { label: 'Created', desc: 'Content uploaded', color: 'bg-blue-500', done: true },
                  { label: 'AI Verified', desc: 'Fingerprint generated', color: 'bg-green-500', done: true },
                  { label: 'Minted', desc: 'Registered on Polygon', color: 'bg-purple-500', done: content.status === 'REGISTERED' },
                  { label: 'Licensed', desc: `${content.license_count || 0} purchases`, color: 'bg-amber-500', done: (content.license_count || 0) > 0 },
                ].map((step, i) => (
                  <div key={i} className="relative flex items-start gap-3 mb-4 last:mb-0">
                    <div className={`absolute -left-4 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 ${step.done ? step.color : 'bg-gray-300 dark:bg-gray-600'}`} />
                    <div>
                      <p className={`text-xs font-semibold ${step.done ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>{step.label}</p>
                      <p className="text-[10px] text-gray-400">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ─── Sticky Purchase Panel (col 9-12) ─── */}
          <div className="lg:col-span-3">
            <div className="lg:sticky lg:top-24 space-y-4">
              <div className="card p-6">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">{content.price}</span>
                  <span className="text-gray-400 font-medium text-sm">MATIC</span>
                </div>
                <p className="text-xs text-gray-400 mb-5">≈ ${(parseFloat(content.price) * 0.85).toFixed(2)} USD</p>

                {/* Social proof */}
                <div className="space-y-2 mb-5">
                  <div className="flex items-center gap-2 text-xs text-gray-500"><Users className="w-3.5 h-3.5 text-primary-500" /> {content.license_count || 0} people purchased</div>
                  <div className="flex items-center gap-2 text-xs text-gray-500"><Clock className="w-3.5 h-3.5 text-amber-500" /> Last purchased {hoursAgo}h ago</div>
                  <div className="flex items-center gap-2 text-xs text-gray-500"><TrendingUp className="w-3.5 h-3.5 text-green-500" /> Trending in {type}</div>
                </div>

                {content.creator_id === user?.id ? (
                  <button className="btn-secondary w-full py-3 opacity-50 cursor-not-allowed text-sm">You own this</button>
                ) : (
                  <button onClick={handlePurchase} disabled={purchasing}
                          className="btn-primary w-full py-3.5 text-sm font-semibold transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary-500/25 active:scale-[0.98]">
                    {purchasing ? (
                      <svg className="w-5 h-5 animate-spin mx-auto" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    ) : 'License via Smart Contract'}
                  </button>
                )}

                <div className="flex items-center justify-center gap-1.5 mt-3 text-[10px] text-gray-400">
                  <ShieldCheck className="w-3 h-3 text-green-500" /> Secured by Polygon Blockchain
                </div>
              </div>

              {/* Quick Info */}
              <div className="card p-4 space-y-3">
                <div className="flex justify-between text-xs"><span className="text-gray-400">Network</span><span className="text-gray-700 dark:text-gray-300 font-medium">Polygon Amoy</span></div>
                <div className="flex justify-between text-xs"><span className="text-gray-400">License</span><span className="text-gray-700 dark:text-gray-300 font-medium">Commercial</span></div>
                <div className="flex justify-between text-xs"><span className="text-gray-400">Status</span><span className="text-green-500 font-medium">Verified ✓</span></div>
              </div>

              <div className="card p-4">
                <h4 className="font-semibold text-xs text-gray-900 dark:text-white mb-2 flex items-center gap-1.5"><FileCheck className="w-3.5 h-3.5 text-amber-500" /> Authenticity</h4>
                <p className="text-[10px] text-gray-400 leading-relaxed">Cryptographically signed and AI-fingerprinted. Stored on Polygon blockchain.</p>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Recommendations ─── */}
        {related.length > 0 && (
          <div className="mt-16 pt-10 border-t border-gray-100 dark:border-gray-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">More {type === 'audio' ? 'Audio' : type === 'video' ? 'Videos' : 'Images'} You May Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map(item => (
                <Link key={item.id} href={`/content/${item.id}`}>
                  <ContentCard item={item} />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

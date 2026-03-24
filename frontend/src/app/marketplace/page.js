'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

const categories = ['All', 'Image', 'Audio', 'Video'];
const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most Licensed' },
  { value: 'price_low', label: 'Price: Low → High' },
  { value: 'price_high', label: 'Price: High → Low' },
];

// Demo data
const demoContent = [
  { id: '1', title: 'Neon City Skyline', category: 'image', price: '0.05', creator_name: 'Alex Chen', license_count: 24, content_type: 'image', status: 'REGISTERED' },
  { id: '2', title: 'Ambient Chill Pack Vol.3', category: 'audio', price: '0.15', creator_name: 'Luna Beats', license_count: 42, content_type: 'audio', status: 'REGISTERED' },
  { id: '3', title: 'Abstract Motion Loop', category: 'video', price: '0.25', creator_name: 'Motion Lab', license_count: 8, content_type: 'video', status: 'REGISTERED' },
  { id: '4', title: 'Mountain Landscape 4K', category: 'image', price: '0.08', creator_name: 'Nature Pros', license_count: 56, content_type: 'image', status: 'REGISTERED' },
  { id: '5', title: 'Synthwave Retrograde', category: 'audio', price: '0.12', creator_name: 'RetroSynth', license_count: 19, content_type: 'audio', status: 'REGISTERED' },
  { id: '6', title: 'Drone Aerial Footage', category: 'video', price: '0.50', creator_name: 'SkyView Pro', license_count: 5, content_type: 'video', status: 'REGISTERED' },
  { id: '7', title: 'Watercolor Textures Set', category: 'image', price: '0.03', creator_name: 'ArtCore', license_count: 89, content_type: 'image', status: 'REGISTERED' },
  { id: '8', title: 'Podcast Intro Jingle', category: 'audio', price: '0.07', creator_name: 'SoundForge', license_count: 33, content_type: 'audio', status: 'REGISTERED' },
];

const typeIcons = { image: '🖼️', audio: '🎵', video: '🎬' };
const typeColors = { image: 'from-cyan-500 to-blue-600', audio: 'from-purple-500 to-pink-600', video: 'from-amber-500 to-red-600' };

export default function MarketplacePage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('newest');
  const [content, setContent] = useState(demoContent);

  const filtered = content.filter(item => {
    if (category !== 'All' && item.content_type !== category.toLowerCase()) return false;
    if (search && !item.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <main className="page-container">
      <Navbar />

      <div className="pt-24 pb-16 content-wrapper">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Marketplace</h1>
          <p className="text-white/40 mt-1">Discover and license verified digital content</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="flex-1 relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" className="input-field pl-11" placeholder="Search content..."
                   value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          {/* Category */}
          <div className="flex gap-1 p-1 glass-card rounded-xl">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setCategory(cat)}
                      className={`px-4 py-2 text-sm rounded-lg transition-all ${
                        category === cat ? 'bg-white/10 text-white font-medium' : 'text-white/40 hover:text-white/60'
                      }`}>
                {cat}
              </button>
            ))}
          </div>

          {/* Sort */}
          <select className="input-field w-auto" value={sort} onChange={(e) => setSort(e.target.value)}>
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Content Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((item) => (
            <Link key={item.id} href={`/content/${item.id}`}
                  className="glass-card-hover group overflow-hidden">
              {/* Preview */}
              <div className={`relative h-48 bg-gradient-to-br ${typeColors[item.content_type]} flex items-center justify-center`}>
                <span className="text-6xl opacity-50 group-hover:scale-110 transition-transform duration-500">
                  {typeIcons[item.content_type]}
                </span>
                <div className="absolute top-3 right-3">
                  <span className="badge-success text-[10px]">Verified ✓</span>
                </div>
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/40 backdrop-blur-sm">
                  <span className="text-xs text-white font-semibold">{item.price} MATIC</span>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-semibold text-white text-sm group-hover:text-neon-cyan transition-colors line-clamp-1">
                  {item.title}
                </h3>
                <p className="text-xs text-white/40 mt-1">{item.creator_name}</p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                  <span className="text-xs text-white/30 capitalize">{item.content_type}</span>
                  <span className="text-xs text-white/30">🎫 {item.license_count} licenses</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 glass-card mt-8">
            <span className="text-5xl mb-4 block">🔍</span>
            <p className="text-white/40">No content matches your search</p>
          </div>
        )}
      </div>
    </main>
  );
}

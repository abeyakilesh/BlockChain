'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import ContentCard from '@/components/ContentCard';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function MarketplacePage() {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('newest');

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      try {
        const data = await api.getMarketplace({ search, category, sort });
        setContent(data.content || []);
      } catch (err) {
        toast.error('Failed to load marketplace');
      } finally {
        setLoading(false);
      }
    };
    
    // Simple debounce
    const timeout = setTimeout(fetchContent, 300);
    return () => clearTimeout(timeout);
  }, [search, category, sort]);

  return (
    <main className="page-container">
      <Navbar />

      <div className="pt-24 pb-16 content-wrapper">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Marketplace</h1>
            <p className="text-white/50 text-lg">Discover AI-verified, blockchain-backed digital assets.</p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-1 sm:w-64">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" placeholder="Search..." className="input-field pl-9"
                     value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>

            <select className="input-field appearance-none cursor-pointer w-full sm:w-32"
                    value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All Types</option>
              <option value="image">Images</option>
              <option value="audio">Audio</option>
              <option value="video">Video</option>
            </select>

            <select className="input-field appearance-none cursor-pointer w-full sm:w-36"
                    value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="newest">Newest First</option>
              <option value="price_low">Price: Low-High</option>
              <option value="price_high">Price: High-Low</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 rounded-full border-2 border-neon-cyan border-t-transparent animate-spin" />
          </div>
        ) : content.length === 0 ? (
          <div className="glass-card p-12 text-center mt-8">
            <span className="text-5xl block mb-4 opacity-50">🔍</span>
            <h3 className="text-xl font-semibold text-white mb-2">No content found</h3>
            <p className="text-white/40">Try adjusting your filters or check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {content.map((item) => (
              <Link key={item.id} href={`/content/${item.id}`}>
                <ContentCard item={item} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

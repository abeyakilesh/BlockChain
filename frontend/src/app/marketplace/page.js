'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import ContentCard from '@/components/ContentCard';
import { CardSkeleton } from '@/components/SkeletonLoader';
import { Search, Image as ImageIcon, Video, Music, LayoutGrid } from 'lucide-react';
import api from '@/lib/api';


const categories = [
  { value: '', label: 'All', Icon: LayoutGrid },
  { value: 'image', label: 'Images', Icon: ImageIcon },
  { value: 'video', label: 'Videos', Icon: Video },
  { value: 'audio', label: 'Audio', Icon: Music },
];

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
      } catch {
        setContent([]);
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(fetchContent, 200);
    return () => clearTimeout(timeout);
  }, [search, category, sort]);

  return (
    <main className="page-container">
      <Navbar />

      <div className="pt-24 pb-16 content-wrapper">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Marketplace</h1>
            <p className="text-gray-500 dark:text-gray-400">Browse AI-verified digital assets — images, videos, and audio.</p>
          </div>

          {/* Search + Sort */}
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search assets..." className="input-field pl-10 py-2.5"
                     value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select className="input-field appearance-none cursor-pointer py-2.5 w-full sm:w-44"
                    value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="newest">Newest First</option>
              <option value="popular">Most Popular</option>
              <option value="price_low">Price: Low → High</option>
              <option value="price_high">Price: High → Low</option>
            </select>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button key={cat.value} onClick={() => setCategory(cat.value)}
                    className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-150 whitespace-nowrap ${
                      category === cat.value
                        ? 'bg-primary-600 text-white shadow-sm'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}>
              <cat.Icon className="w-4 h-4" />
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results Count */}
        {!loading && (
          <p className="text-sm text-gray-400 mb-6">{content.length} assets found</p>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : content.length === 0 ? (
          <div className="card p-16 text-center mt-8 animate-fade-in">
            <Search className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No assets found</h3>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
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

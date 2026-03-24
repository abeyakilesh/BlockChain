'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import ContentCard from '@/components/ContentCard';
import { CardSkeleton } from '@/components/SkeletonLoader';
import { Search, SlidersHorizontal } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const demoContent = [
  // Photography
  { id: 'd1', title: 'Neon City Skyline', creator_name: 'Alex Chen', category: 'image', price: '0.05', status: 'REGISTERED', license_count: 12, cover_url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=600&h=400&fit=crop' },
  { id: 'd2', title: 'Mountain Lake Reflection', creator_name: 'Luna Beats', category: 'image', price: '0.08', status: 'REGISTERED', license_count: 8, cover_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop' },
  { id: 'd3', title: 'Tokyo Street Night', creator_name: 'Kenji Studios', category: 'image', price: '0.12', status: 'REGISTERED', license_count: 24, cover_url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&h=400&fit=crop' },
  { id: 'd4', title: 'Golden Hour Portrait', creator_name: 'Sarah Kim', category: 'image', price: '0.15', status: 'REGISTERED', license_count: 31, cover_url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&h=400&fit=crop' },
  // Audio
  { id: 'd5', title: 'Ambient Chill Pack Vol.3', creator_name: 'Luna Beats', category: 'audio', price: '0.15', status: 'REGISTERED', license_count: 45, cover_url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&h=400&fit=crop' },
  { id: 'd6', title: 'Lo-Fi Study Beats', creator_name: 'ChillWave', category: 'audio', price: '0.10', status: 'REGISTERED', license_count: 67, cover_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&h=400&fit=crop' },
  { id: 'd7', title: 'Cinematic Orchestra Bundle', creator_name: 'SoundForge', category: 'audio', price: '0.25', status: 'REGISTERED', license_count: 18, cover_url: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=600&h=400&fit=crop' },
  { id: 'd8', title: 'Electronic Drum Kit Pro', creator_name: 'BeatLab', category: 'audio', price: '0.20', status: 'REGISTERED', license_count: 33, cover_url: 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=600&h=400&fit=crop' },
  // Video
  { id: 'd9', title: 'Abstract Motion Loop', creator_name: 'Motion Lab', category: 'video', price: '0.30', status: 'REGISTERED', license_count: 15, cover_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&h=400&fit=crop' },
  { id: 'd10', title: 'Drone Aerial Landscapes', creator_name: 'SkyView Media', category: 'video', price: '0.40', status: 'REGISTERED', license_count: 22, cover_url: 'https://images.unsplash.com/photo-1473830394358-91588751b241?w=600&h=400&fit=crop' },
  { id: 'd11', title: 'Underwater Coral Reef 4K', creator_name: 'OceanLens', category: 'video', price: '0.35', status: 'REGISTERED', license_count: 9, cover_url: 'https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=600&h=400&fit=crop' },
  { id: 'd12', title: 'Time-Lapse City Traffic', creator_name: 'Alex Chen', category: 'video', price: '0.18', status: 'REGISTERED', license_count: 41, cover_url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&h=400&fit=crop' },
  // More Photography
  { id: 'd13', title: 'Macro Flower Collection', creator_name: 'FloraLens', category: 'image', price: '0.06', status: 'REGISTERED', license_count: 5, cover_url: 'https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=600&h=400&fit=crop' },
  { id: 'd14', title: 'Architecture Minimal', creator_name: 'StructureArt', category: 'image', price: '0.09', status: 'REGISTERED', license_count: 19, cover_url: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=600&h=400&fit=crop' },
  { id: 'd15', title: 'Northern Lights Iceland', creator_name: 'AuroraShot', category: 'image', price: '0.22', status: 'REGISTERED', license_count: 52, cover_url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600&h=400&fit=crop' },
  { id: 'd16', title: 'Vintage Film Textures', creator_name: 'RetroGrain', category: 'image', price: '0.04', status: 'REGISTERED', license_count: 73, cover_url: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=600&h=400&fit=crop' },
];

const categories = [
  { value: '', label: 'All Types' },
  { value: 'image', label: 'Images' },
  { value: 'audio', label: 'Audio' },
  { value: 'video', label: 'Video' },
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
        const apiContent = data.content || [];
        // Merge API content with demo if API returns few results
        const merged = apiContent.length >= 8 ? apiContent : [...apiContent, ...demoContent];
        // Apply local filters on demo data
        let filtered = merged;
        if (category) filtered = filtered.filter(c => c.category === category);
        if (search) filtered = filtered.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));
        if (sort === 'price_low') filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        else if (sort === 'price_high') filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));

        setContent(filtered);
      } catch {
        // Fallback to demo content if API unreachable
        let filtered = [...demoContent];
        if (category) filtered = filtered.filter(c => c.category === category);
        if (search) filtered = filtered.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));
        if (sort === 'price_low') filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        else if (sort === 'price_high') filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        setContent(filtered);
      } finally {
        setLoading(false);
      }
    };
    
    const timeout = setTimeout(fetchContent, 300);
    return () => clearTimeout(timeout);
  }, [search, category, sort]);

  return (
    <main className="page-container">
      <Navbar />

      <div className="pt-24 pb-16 content-wrapper">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Marketplace</h1>
            <p className="text-gray-500 dark:text-gray-400">Discover AI-verified, blockchain-backed digital assets across multiple domains.</p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search content..." className="input-field pl-9 py-2.5"
                     value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>

            <div className="flex gap-3">
              {categories.map((cat) => (
                <button key={cat.value} onClick={() => setCategory(cat.value)}
                        className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-150 whitespace-nowrap ${
                          category === cat.value
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}>
                  {cat.label}
                </button>
              ))}
            </div>

            <select className="input-field appearance-none cursor-pointer py-2.5 w-full sm:w-40"
                    value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="newest">Newest First</option>
              <option value="price_low">Price: Low → High</option>
              <option value="price_high">Price: High → Low</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        {!loading && (
          <p className="text-sm text-gray-400 mb-6">{content.length} items</p>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : content.length === 0 ? (
          <div className="card p-16 text-center mt-8 animate-fade-in">
            <Search className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No content found</h3>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters or check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 animate-fade-in">
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

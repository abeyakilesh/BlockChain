'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import ContentCard from '@/components/ContentCard';
import { CardSkeleton } from '@/components/SkeletonLoader';
import { Search, Image as ImageIcon, Video, Music, LayoutGrid } from 'lucide-react';
import api from '@/lib/api';

/* ════════════════════════════════════════════════════
   40 Realistic Sample Products
   15 Images · 15 Videos · 10 Audio
   ════════════════════════════════════════════════════ */

const demoContent = [
  // ─── IMAGES (15) ────────────────────────────────
  { id: 'img-1', title: 'Abstract Gradient Pack', description: 'Collection of 20 abstract gradient wallpapers in 4K resolution.', content_type: 'image', price: '0.05', creator_name: 'Alex Chen', status: 'REGISTERED', license_count: 34,
    cover_url: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=600&h=400&fit=crop' },
  { id: 'img-2', title: 'Neon City Skyline', description: 'Urban night photography capturing cyberpunk cityscapes.', content_type: 'image', price: '0.08', creator_name: 'Kevin Park', status: 'REGISTERED', license_count: 56,
    cover_url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=600&h=400&fit=crop' },
  { id: 'img-3', title: 'UI Dashboard Kit', description: 'Modern SaaS dashboard components and layout templates.', content_type: 'image', price: '0.12', creator_name: 'DesignForge', status: 'REGISTERED', license_count: 128,
    cover_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop' },
  { id: 'img-4', title: 'Golden Hour Portraits', description: 'Professional portrait photography during golden hour.', content_type: 'image', price: '0.15', creator_name: 'Sarah Kim', status: 'REGISTERED', license_count: 42,
    cover_url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&h=400&fit=crop' },
  { id: 'img-5', title: 'Minimal Architecture', description: 'Clean geometric architecture photography from around the world.', content_type: 'image', price: '0.09', creator_name: 'StructureArt', status: 'REGISTERED', license_count: 23,
    cover_url: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=600&h=400&fit=crop' },
  { id: 'img-6', title: 'Northern Lights Collection', description: 'Aurora borealis captured across Iceland and Norway.', content_type: 'image', price: '0.25', creator_name: 'AuroraShot', status: 'REGISTERED', license_count: 89,
    cover_url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600&h=400&fit=crop' },
  { id: 'img-7', title: 'Tokyo Street Nights', description: 'Moody night photography from the streets of Tokyo.', content_type: 'image', price: '0.10', creator_name: 'Kenji Studios', status: 'REGISTERED', license_count: 67,
    cover_url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&h=400&fit=crop' },
  { id: 'img-8', title: 'Macro Botanical Series', description: 'Extreme close-up photography of flowers and plants.', content_type: 'image', price: '0.06', creator_name: 'FloraLens', status: 'REGISTERED', license_count: 15,
    cover_url: 'https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=600&h=400&fit=crop' },
  { id: 'img-9', title: '3D Isometric Icons', description: 'Hand-crafted 3D icons for apps and presentations.', content_type: 'image', price: '0.18', creator_name: 'PixelCraft', status: 'REGISTERED', license_count: 201,
    cover_url: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=600&h=400&fit=crop' },
  { id: 'img-10', title: 'Vintage Film Textures', description: 'Authentic film grain and light leak overlays.', content_type: 'image', price: '0.04', creator_name: 'RetroGrain', status: 'REGISTERED', license_count: 143,
    cover_url: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=600&h=400&fit=crop' },
  { id: 'img-11', title: 'Mountain Lake Reflection', description: 'Serene mountain lake landscapes in ultra-high resolution.', content_type: 'image', price: '0.07', creator_name: 'NatureFrame', status: 'REGISTERED', license_count: 38,
    cover_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop' },
  { id: 'img-12', title: 'Food Photography Pro', description: 'Styled food and beverage photography for commercial use.', content_type: 'image', price: '0.11', creator_name: 'TasteVisuals', status: 'REGISTERED', license_count: 52,
    cover_url: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=600&h=400&fit=crop' },
  { id: 'img-13', title: 'Streetwear Lookbook', description: 'Urban fashion photography with editorial styling.', content_type: 'image', price: '0.14', creator_name: 'UrbanThread', status: 'REGISTERED', license_count: 31,
    cover_url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&h=400&fit=crop' },
  { id: 'img-14', title: 'Space & Cosmos Pack', description: 'Deep space imagery, nebula renders, and astrophotography.', content_type: 'image', price: '0.20', creator_name: 'CosmicEye', status: 'REGISTERED', license_count: 76,
    cover_url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=600&h=400&fit=crop' },
  { id: 'img-15', title: 'Minimalist Workspace', description: 'Clean desk setups and productivity-focused photography.', content_type: 'image', price: '0.05', creator_name: 'DeskVibes', status: 'REGISTERED', license_count: 94,
    cover_url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=400&fit=crop' },

  // ─── VIDEOS (15) ────────────────────────────────
  { id: 'vid-1', title: 'Cinematic Sunset Clip', description: 'Golden hour sunset timelapse over the ocean.', content_type: 'video', price: '0.30', creator_name: 'Motion Lab', status: 'REGISTERED', license_count: 22, duration: '0:30',
    cover_url: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=600&h=400&fit=crop' },
  { id: 'vid-2', title: 'Startup Promo Video', description: 'Modern tech startup intro template with dynamic transitions.', content_type: 'video', price: '0.45', creator_name: 'BrandMotion', status: 'REGISTERED', license_count: 83, duration: '1:15',
    cover_url: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&h=400&fit=crop' },
  { id: 'vid-3', title: 'Drone Aerial Landscapes', description: 'Breathtaking aerial footage of mountains and coastlines.', content_type: 'video', price: '0.40', creator_name: 'SkyView Media', status: 'REGISTERED', license_count: 45, duration: '2:00',
    cover_url: 'https://images.unsplash.com/photo-1473830394358-91588751b241?w=600&h=400&fit=crop' },
  { id: 'vid-4', title: 'Abstract Motion Loop', description: 'Seamless looping abstract motion graphics for backgrounds.', content_type: 'video', price: '0.15', creator_name: 'LoopStudio', status: 'REGISTERED', license_count: 117, duration: '0:10',
    cover_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&h=400&fit=crop' },
  { id: 'vid-5', title: 'Underwater Coral Reef 4K', description: 'Vivid underwater footage of coral reefs and marine life.', content_type: 'video', price: '0.35', creator_name: 'OceanLens', status: 'REGISTERED', license_count: 19, duration: '3:22',
    cover_url: 'https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=600&h=400&fit=crop' },
  { id: 'vid-6', title: 'Time-Lapse City Traffic', description: 'High-speed timelapse of bustling city intersections at night.', content_type: 'video', price: '0.18', creator_name: 'Alex Chen', status: 'REGISTERED', license_count: 61, duration: '0:45',
    cover_url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&h=400&fit=crop' },
  { id: 'vid-7', title: 'Product Showcase Template', description: 'Sleek 3D product reveal animation template.', content_type: 'video', price: '0.50', creator_name: 'RenderHouse', status: 'REGISTERED', license_count: 35, duration: '0:20',
    cover_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop' },
  { id: 'vid-8', title: 'Smoke & Particles FX', description: 'Realistic smoke, dust, and particle effects for compositing.', content_type: 'video', price: '0.22', creator_name: 'VFX Vault', status: 'REGISTERED', license_count: 156, duration: '0:15',
    cover_url: 'https://images.unsplash.com/photo-1504253163759-c23fccaebb55?w=600&h=400&fit=crop' },
  { id: 'vid-9', title: 'Nature Documentary B-Roll', description: 'Forest and wildlife footage perfect for documentaries.', content_type: 'video', price: '0.28', creator_name: 'WildFrame', status: 'REGISTERED', license_count: 14, duration: '5:10',
    cover_url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop' },
  { id: 'vid-10', title: 'Social Media Story Pack', description: 'Animated Instagram & TikTok story templates with transitions.', content_type: 'video', price: '0.12', creator_name: 'SocialKit', status: 'REGISTERED', license_count: 234, duration: '0:05',
    cover_url: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=600&h=400&fit=crop' },
  { id: 'vid-11', title: 'Cyberpunk City Loop', description: 'Futuristic neon city flythrough animation.', content_type: 'video', price: '0.32', creator_name: 'NeonWorks', status: 'REGISTERED', license_count: 42, duration: '0:30',
    cover_url: 'https://images.unsplash.com/photo-1515630771457-09367d0ae038?w=600&h=400&fit=crop' },
  { id: 'vid-12', title: 'Fitness Workout Clips', description: 'Professional gym and exercise footage for fitness brands.', content_type: 'video', price: '0.16', creator_name: 'FitFilm', status: 'REGISTERED', license_count: 28, duration: '1:40',
    cover_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop' },
  { id: 'vid-13', title: 'Coffee Shop Ambience', description: 'Cozy café interior footage with soft lighting.', content_type: 'video', price: '0.10', creator_name: 'CozyClips', status: 'REGISTERED', license_count: 73, duration: '4:00',
    cover_url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=400&fit=crop' },
  { id: 'vid-14', title: 'Rain on Window Loop', description: 'Calming rain droplets on glass — perfect for ASMR or chill content.', content_type: 'video', price: '0.08', creator_name: 'AmbiLoop', status: 'REGISTERED', license_count: 188, duration: '10:00',
    cover_url: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=600&h=400&fit=crop' },
  { id: 'vid-15', title: 'Glitch Transition Pack', description: 'Digital glitch and distortion transitions for video editing.', content_type: 'video', price: '0.14', creator_name: 'EditLab', status: 'REGISTERED', license_count: 97, duration: '0:08',
    cover_url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&h=400&fit=crop' },

  // ─── AUDIO (10) ─────────────────────────────────
  { id: 'aud-1', title: 'Ambient Lo-Fi Track', description: 'Relaxing lo-fi hip hop beat for studying and focus.', content_type: 'audio', price: '0.10', creator_name: 'ChillWave', status: 'REGISTERED', license_count: 145,
    cover_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&h=400&fit=crop' },
  { id: 'aud-2', title: 'Cinematic Orchestra Bundle', description: 'Epic orchestral scores for trailers and presentations.', content_type: 'audio', price: '0.35', creator_name: 'SoundForge', status: 'REGISTERED', license_count: 67,
    cover_url: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=600&h=400&fit=crop' },
  { id: 'aud-3', title: 'Electronic Drum Kit Pro', description: '200+ high-quality electronic drum samples and loops.', content_type: 'audio', price: '0.20', creator_name: 'BeatLab', status: 'REGISTERED', license_count: 89,
    cover_url: 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=600&h=400&fit=crop' },
  { id: 'aud-4', title: 'Podcast Intro Jingles', description: '10 professional podcast intro/outro jingles.', content_type: 'audio', price: '0.08', creator_name: 'PodSound', status: 'REGISTERED', license_count: 203,
    cover_url: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=600&h=400&fit=crop' },
  { id: 'aud-5', title: 'Synthwave Retro Pack', description: '80s-inspired synthwave music for retro-themed projects.', content_type: 'audio', price: '0.15', creator_name: 'RetroSynth', status: 'REGISTERED', license_count: 52,
    cover_url: 'https://images.unsplash.com/photo-1614149162883-504ce4d13909?w=600&h=400&fit=crop' },
  { id: 'aud-6', title: 'Nature Sound Effects', description: 'Rain, wind, thunder, birds — perfect for ambient soundscapes.', content_type: 'audio', price: '0.06', creator_name: 'EcoSound', status: 'REGISTERED', license_count: 178,
    cover_url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600&h=400&fit=crop' },
  { id: 'aud-7', title: 'Corporate Background Music', description: 'Upbeat, positive background tracks for business content.', content_type: 'audio', price: '0.12', creator_name: 'BizTune', status: 'REGISTERED', license_count: 312,
    cover_url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&h=400&fit=crop' },
  { id: 'aud-8', title: 'Gaming SFX Collection', description: '500+ game sound effects: UI clicks, hits, power-ups, more.', content_type: 'audio', price: '0.25', creator_name: 'GameAudio', status: 'REGISTERED', license_count: 176,
    cover_url: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&h=400&fit=crop' },
  { id: 'aud-9', title: 'Acoustic Guitar Sessions', description: 'Warm acoustic guitar recordings for ads and intros.', content_type: 'audio', price: '0.09', creator_name: 'StringWorks', status: 'REGISTERED', license_count: 44 },
  { id: 'aud-10', title: 'Hip-Hop Beat Tape Vol.2', description: 'Hard-hitting hip-hop instrumentals ready for vocals.', content_type: 'audio', price: '0.18', creator_name: 'Luna Beats', status: 'REGISTERED', license_count: 91 },
];

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
        const apiContent = data.content || [];
        // Use API content if robust, otherwise merge with demo
        const merged = apiContent.length >= 20 ? apiContent : [...apiContent, ...demoContent];

        // De-duplicate by id
        const seen = new Set();
        const unique = merged.filter(c => { if (seen.has(c.id)) return false; seen.add(c.id); return true; });

        // Local filters
        let filtered = unique;
        if (category) filtered = filtered.filter(c => (c.content_type || c.category) === category);
        if (search) filtered = filtered.filter(c => c.title.toLowerCase().includes(search.toLowerCase()) || c.description?.toLowerCase().includes(search.toLowerCase()));
        if (sort === 'price_low') filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        else if (sort === 'price_high') filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        else if (sort === 'popular') filtered.sort((a, b) => (b.license_count || 0) - (a.license_count || 0));

        setContent(filtered);
      } catch {
        // Fallback to demo
        let filtered = [...demoContent];
        if (category) filtered = filtered.filter(c => c.content_type === category);
        if (search) filtered = filtered.filter(c => c.title.toLowerCase().includes(search.toLowerCase()) || c.description?.toLowerCase().includes(search.toLowerCase()));
        if (sort === 'price_low') filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        else if (sort === 'price_high') filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        else if (sort === 'popular') filtered.sort((a, b) => (b.license_count || 0) - (a.license_count || 0));
        setContent(filtered);
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

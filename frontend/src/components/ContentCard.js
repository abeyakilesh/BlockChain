'use client';

import { Image as ImageIcon, Music, Video, Ticket, CheckCircle2 } from 'lucide-react';

export default function ContentCard({ item, showCreator = true }) {
  const category = item.category || item.content_type || 'image';

  const typeColors = {
    image: 'bg-primary-500',
    audio: 'bg-violet-500',
    video: 'bg-amber-500',
    '3d': 'bg-rose-500',
    design: 'bg-cyan-500',
    photography: 'bg-emerald-500',
  };

  const typeIcons = { 
    image: <ImageIcon className="w-12 h-12 text-white/80" strokeWidth={1.5} />, 
    audio: <Music className="w-12 h-12 text-white/80" strokeWidth={1.5} />, 
    video: <Video className="w-12 h-12 text-white/80" strokeWidth={1.5} />,
  };

  const hasCover = item.cover_url || item.preview_url;

  return (
    <div className="card-hover group overflow-hidden">
      {/* Preview */}
      <div className={`relative h-48 ${!hasCover ? (typeColors[category] || typeColors.image) : 'bg-gray-100 dark:bg-gray-800'} flex items-center justify-center overflow-hidden`}>
        {hasCover ? (
          <img
            src={item.cover_url || item.preview_url}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="opacity-60 group-hover:scale-105 transition-transform duration-200">
            {typeIcons[category] || <ImageIcon className="w-12 h-12 text-white/80" strokeWidth={1.5} />}
          </div>
        )}
        {item.status === 'REGISTERED' && (
          <div className="absolute top-3 right-3">
            <span className="badge-success text-[10px] flex items-center gap-1 px-2 py-0.5">
              <CheckCircle2 className="w-3 h-3" /> Verified
            </span>
          </div>
        )}
        {item.price && (
          <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-sm text-xs text-white font-medium">
            {item.price} MATIC
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1">
          {item.title}
        </h3>
        {showCreator && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.creator_name || 'Unknown Creator'}</p>
        )}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
          <span className="text-xs text-gray-400 capitalize">{category}</span>
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Ticket className="w-3.5 h-3.5" /> {item.license_count || 0}
          </span>
        </div>
      </div>
    </div>
  );
}

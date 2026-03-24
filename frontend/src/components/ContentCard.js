'use client';

import { Image as ImageIcon, Music, Video, Play, Ticket, CheckCircle2 } from 'lucide-react';

export default function ContentCard({ item, showCreator = true }) {
  const type = item.content_type || item.category || 'image';

  return (
    <div className="card-hover group overflow-hidden rounded-xl">
      {/* Thumbnail */}
      <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-800">
        {type === 'image' && <ImageThumbnail item={item} />}
        {type === 'video' && <VideoThumbnail item={item} />}
        {type === 'audio' && <AudioThumbnail item={item} />}

        {/* Verified Badge */}
        {item.status === 'REGISTERED' && (
          <div className="absolute top-3 right-3 z-10">
            <span className="badge-success text-[10px] flex items-center gap-1 px-2 py-0.5 shadow-sm">
              <CheckCircle2 className="w-3 h-3" /> Verified
            </span>
          </div>
        )}

        {/* Price Badge */}
        {item.price && (
          <div className="absolute bottom-3 left-3 z-10 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-xs text-white font-semibold">
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
        {item.description && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 line-clamp-2">{item.description}</p>
        )}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
          <span className="text-xs text-gray-400 capitalize font-medium">{type}</span>
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Ticket className="w-3.5 h-3.5" /> {item.license_count || 0}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── Image Thumbnail ───────────────────────────── */
function ImageThumbnail({ item }) {
  const src = item.cover_url || item.preview_url;

  if (src) {
    return (
      <img src={src} alt={item.title} loading="lazy"
           className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" />
    );
  }

  // Fallback
  return (
    <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
      <ImageIcon className="w-12 h-12 text-white/60" strokeWidth={1.5} />
    </div>
  );
}

/* ─── Video Thumbnail ───────────────────────────── */
function VideoThumbnail({ item }) {
  const src = item.cover_url || item.preview_url;

  return (
    <div className="w-full h-full relative">
      {src ? (
        <img src={src} alt={item.title} loading="lazy"
             className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
          <Video className="w-12 h-12 text-white/30" strokeWidth={1.5} />
        </div>
      )}
      {/* Play icon overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 group-hover:scale-110 transition-all duration-200">
          <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
        </div>
      </div>
      {/* Duration badge */}
      {item.duration && (
        <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-black/70 text-[10px] text-white font-mono">
          {item.duration}
        </div>
      )}
    </div>
  );
}

/* ─── Audio Thumbnail ───────────────────────────── */
function AudioThumbnail({ item }) {
  const src = item.cover_url || item.preview_url;

  if (src) {
    return (
      <div className="w-full h-full relative">
        <img src={src} alt={item.title} loading="lazy"
             className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" />
        {/* Music overlay */}
        <div className="absolute inset-0 bg-black/20 flex items-end p-4">
          <div className="flex items-end gap-[3px]">
            {[40, 70, 50, 80, 60, 45, 75, 55, 65, 50, 70, 40].map((h, i) => (
              <div key={i} className="w-1 rounded-full bg-white/80 transition-all duration-300"
                   style={{ height: `${h * 0.35}px`, animationDelay: `${i * 0.05}s` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Gradient fallback for audio
  const gradients = [
    'from-violet-500 to-purple-700',
    'from-rose-500 to-pink-700',
    'from-cyan-500 to-blue-700',
    'from-amber-500 to-orange-700',
    'from-emerald-500 to-teal-700',
  ];
  const gradient = gradients[Math.abs(item.title?.charCodeAt(0) || 0) % gradients.length];

  return (
    <div className={`w-full h-full bg-gradient-to-br ${gradient} flex flex-col items-center justify-center p-6`}>
      <Music className="w-10 h-10 text-white/80 mb-3" strokeWidth={1.5} />
      <div className="flex items-end gap-[3px]">
        {[35, 60, 45, 75, 55, 40, 70, 50, 62, 42, 68, 38, 58, 48].map((h, i) => (
          <div key={i} className="w-1 rounded-full bg-white/50"
               style={{ height: `${h * 0.3}px` }} />
        ))}
      </div>
    </div>
  );
}

'use client';

import { Image as ImageIcon, Music, Video, Ticket, CheckCircle2 } from 'lucide-react';

export default function ContentCard({ item, showCreator = true }) {
  const typeIcons = { 
    image: <ImageIcon className="w-16 h-16 text-white" strokeWidth={1.5} />, 
    audio: <Music className="w-16 h-16 text-white" strokeWidth={1.5} />, 
    video: <Video className="w-16 h-16 text-white" strokeWidth={1.5} /> 
  };
  
  const typeColors = {
    image: 'from-cyan-500/80 to-blue-600/80',
    audio: 'from-purple-500/80 to-pink-600/80',
    video: 'from-amber-500/80 to-red-600/80',
  };

  const category = item.category || item.content_type || 'image';

  return (
    <div className="glass-card-hover group overflow-hidden">
      {/* Preview */}
      <div className={`relative h-48 bg-gradient-to-br ${typeColors[category] || typeColors.image} flex items-center justify-center`}>
        <div className="opacity-50 group-hover:scale-110 transition-transform duration-500">
          {typeIcons[category] || <ImageIcon className="w-16 h-16 text-white" strokeWidth={1.5} />}
        </div>
        {item.status === 'REGISTERED' && (
          <div className="absolute top-3 right-3">
            <span className="badge-success text-[10px] flex items-center gap-1.5 px-2 py-1">
              <CheckCircle2 className="w-3 h-3" /> Verified
            </span>
          </div>
        )}
        {item.price && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10">
            <span className="text-xs text-white font-semibold">{item.price} MATIC</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-white text-sm group-hover:text-neon-cyan transition-colors line-clamp-1">
          {item.title}
        </h3>
        {showCreator && (
          <p className="text-xs text-white/40 mt-1">{item.creator_name || 'Unknown Creator'}</p>
        )}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
          <span className="text-xs text-white/30 capitalize">{category}</span>
          <span className="text-xs text-white/30 flex items-center gap-1.5">
            <Ticket className="w-3.5 h-3.5 opacity-70" /> {item.license_count || 0} licenses
          </span>
        </div>
      </div>
    </div>
  );
}

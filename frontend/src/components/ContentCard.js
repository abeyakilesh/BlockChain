'use client';

export default function ContentCard({ item, showCreator = true }) {
  const typeIcons = { image: '🖼️', audio: '🎵', video: '🎬' };
  const typeColors = {
    image: 'from-cyan-500 to-blue-600',
    audio: 'from-purple-500 to-pink-600',
    video: 'from-amber-500 to-red-600',
  };

  const category = item.category || item.content_type || 'image';

  return (
    <div className="glass-card-hover group overflow-hidden">
      {/* Preview */}
      <div className={`relative h-48 bg-gradient-to-br ${typeColors[category] || typeColors.image} flex items-center justify-center`}>
        <span className="text-6xl opacity-50 group-hover:scale-110 transition-transform duration-500">
          {typeIcons[category] || '📄'}
        </span>
        {item.status === 'REGISTERED' && (
          <div className="absolute top-3 right-3">
            <span className="badge-success text-[10px]">Verified ✓</span>
          </div>
        )}
        {item.price && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/40 backdrop-blur-sm">
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
          <span className="text-xs text-white/30">🎫 {item.license_count || 0} licenses</span>
        </div>
      </div>
    </div>
  );
}

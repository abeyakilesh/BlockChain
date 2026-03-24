'use client';

import { useState, useRef, useEffect } from 'react';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

export default function StatsCard({ label, value, Icon, color, bg, detail, onClick }) {
  const [hovered, setHovered] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const cardRef = useRef(null);

  useEffect(() => {
    if (hovered && cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setTooltipPos({
        top: rect.height + 8,
        left: rect.width / 2,
      });
    }
  }, [hovered]);

  return (
    <div
      ref={cardRef}
      className={`card p-5 relative cursor-pointer transition-all duration-200 
        hover:scale-[1.03] hover:shadow-lg hover:shadow-primary-500/5
        ${hovered ? 'ring-1 ring-primary-500/20' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center transition-transform duration-200 ${hovered ? 'scale-110' : ''}`}>
          <Icon className={`w-4.5 h-4.5 ${color}`} />
        </div>
        {hovered && (
          <ArrowRight className="w-3.5 h-3.5 text-gray-400 animate-fade-in" />
        )}
      </div>
      <div className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</div>
      <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">{label}</div>

      {/* Hover Tooltip */}
      {hovered && detail && (
        <div
          className="absolute z-30 w-52 bg-gray-900 dark:bg-gray-800 border border-gray-700 rounded-xl p-4 shadow-2xl animate-fade-in"
          style={{
            top: tooltipPos.top,
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          {/* Arrow */}
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-900 dark:bg-gray-800 border-l border-t border-gray-700 rotate-45" />
          <div className="space-y-2">
            {detail.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-[11px] text-gray-400">{item.label}</span>
                <span className={`text-[11px] font-medium ${item.highlight ? 'text-green-400' : 'text-white'}`}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

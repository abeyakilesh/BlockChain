'use client';

import { useState, useRef, useCallback } from 'react';
import { X, Upload, CheckCircle2, Image as ImageIcon, Music, Video, FileText, Loader2, Sparkles } from 'lucide-react';

const typeOptions = [
  { value: 'image', label: 'Image', Icon: ImageIcon, color: 'text-blue-500' },
  { value: 'audio', label: 'Audio', Icon: Music, color: 'text-violet-500' },
  { value: 'video', label: 'Video', Icon: Video, color: 'text-emerald-500' },
];

export default function UploadModal({ show, onClose, onSubmit, uploading }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [meta, setMeta] = useState({ title: '', description: '', category: 'image', price: '0.01' });
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = useCallback((f) => {
    if (!f) return;
    setFile(f);
    // Auto-detect type from MIME
    if (f.type.startsWith('image')) setMeta(prev => ({ ...prev, category: 'image' }));
    else if (f.type.startsWith('audio')) setMeta(prev => ({ ...prev, category: 'audio' }));
    else if (f.type.startsWith('video')) setMeta(prev => ({ ...prev, category: 'video' }));
    // Generate preview for images
    if (f.type.startsWith('image')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
    // Auto-fill title from filename
    if (!meta.title) {
      const name = f.name.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' ');
      setMeta(prev => ({ ...prev, title: name.charAt(0).toUpperCase() + name.slice(1) }));
    }
  }, [meta.title]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) return;
    onSubmit?.(file, meta);
  };

  const resetAndClose = () => {
    setFile(null);
    setPreview(null);
    setMeta({ title: '', description: '', category: 'image', price: '0.01' });
    onClose?.();
  };

  if (!show) return null;

  const fileSizeMB = file ? (file.size / (1024 * 1024)).toFixed(2) : 0;
  const TypeIcon = typeOptions.find(t => t.value === meta.category)?.Icon || ImageIcon;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in" onClick={resetAndClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center">
              <Sparkles className="w-4.5 h-4.5 text-primary-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upload New Content</h2>
              <p className="text-xs text-gray-400 mt-0.5">AI-verified & blockchain-registered</p>
            </div>
          </div>
          <button onClick={resetAndClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-5 min-h-[420px]">
            {/* ─── Left: File Preview & Drop Zone (40%) ───── */}
            <div className="lg:col-span-2 p-6 border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-gray-800 flex flex-col">
              <div
                className={`flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 transition-all duration-200 cursor-pointer
                  ${dragOver ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-500/5 scale-[1.01]' : ''}
                  ${file ? 'border-green-300 dark:border-green-500/30 bg-green-50/30 dark:bg-green-500/5' : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500 hover:bg-gray-50 dark:hover:bg-gray-800/50'}
                `}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                {file ? (
                  <div className="text-center w-full">
                    {/* Preview */}
                    {preview ? (
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-4 bg-gray-100 dark:bg-gray-800">
                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className={`w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center ${
                        meta.category === 'audio' ? 'bg-gradient-to-br from-violet-500 to-purple-700'
                        : 'bg-gradient-to-br from-gray-700 to-gray-900'
                      }`}>
                        <TypeIcon className="w-8 h-8 text-white/80" />
                      </div>
                    )}
                    <CheckCircle2 className="w-6 h-6 text-green-500 mx-auto mb-2" />
                    <p className="font-medium text-gray-900 dark:text-white text-sm truncate px-2">{file.name}</p>
                    <div className="flex items-center justify-center gap-3 mt-2 text-[11px] text-gray-400">
                      <span>{fileSizeMB} MB</span>
                      <span>·</span>
                      <span className="capitalize">{meta.category}</span>
                      <span>·</span>
                      <span>{file.type.split('/')[1]?.toUpperCase()}</span>
                    </div>
                    <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); }}
                            className="mt-3 text-xs text-primary-500 hover:text-primary-600 font-medium">
                      Change file
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="font-medium text-gray-600 dark:text-gray-300 text-sm">Drop file or click to browse</p>
                    <p className="text-xs text-gray-400 mt-1.5">Images, Audio, Video</p>
                    <p className="text-xs text-gray-400">Max 100MB</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files[0])}
                  accept="image/*,audio/*,video/*"
                />
              </div>
            </div>

            {/* ─── Right: Metadata Form (60%) ──────────────── */}
            <div className="lg:col-span-3 p-6 space-y-5">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 font-medium">Title *</label>
                <input
                  type="text"
                  className="input-field"
                  value={meta.title}
                  onChange={(e) => setMeta({ ...meta, title: e.target.value })}
                  placeholder="e.g. Sunset Photography Pack"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1.5 font-medium">Description</label>
                <textarea
                  className="input-field h-20 resize-none"
                  value={meta.description}
                  onChange={(e) => setMeta({ ...meta, description: e.target.value })}
                  placeholder="Describe your content and what makes it unique..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5 font-medium">Content Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {typeOptions.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setMeta({ ...meta, category: opt.value })}
                        className={`py-2.5 rounded-lg text-xs font-medium transition-all duration-200 flex flex-col items-center gap-1 ${
                          meta.category === opt.value
                            ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 ring-1 ring-primary-500/30'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        <opt.Icon className="w-4 h-4" />
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5 font-medium">Price (MATIC)</label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    className="input-field"
                    value={meta.price}
                    onChange={(e) => setMeta({ ...meta, price: e.target.value })}
                  />
                  <p className="text-[10px] text-gray-400 mt-1">≈ ${(parseFloat(meta.price || 0) * 0.85).toFixed(2)} USD</p>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1.5 font-medium">License Type</label>
                <select className="input-field appearance-none">
                  <option>Commercial — Use in any project</option>
                  <option>Personal — Non-commercial only</option>
                  <option>Editorial — News & educational</option>
                </select>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-7 py-5 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <p className="text-[11px] text-gray-400">
              Content will be SHA-256 fingerprinted and registered on Polygon
            </p>
            <div className="flex items-center gap-3">
              <button type="button" onClick={resetAndClose} className="btn-secondary py-2.5 px-5 text-sm">
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading || !file}
                className="btn-primary py-2.5 px-6 text-sm flex items-center gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Minting on blockchain…
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Upload & Verify Ownership
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

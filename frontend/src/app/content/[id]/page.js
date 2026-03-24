'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

// Demo content detail
const demoData = {
  '1': {
    title: 'Neon City Skyline', description: 'A stunning 4K photograph of a cyberpunk-themed city skyline at night, featuring vibrant neon lights reflecting off wet streets.',
    category: 'image', content_type: 'image', price: '0.05', currency: 'MATIC',
    creator_name: 'Alex Chen', creator_wallet: '0x1234...abcd',
    ipfs_cid: 'QmSimAbC123xYz789mNoPqRsTuVwXyZ', tx_hash: '0xa1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
    block_number: 52847391, fingerprint_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    certificate_url: '/uploads/certificates/cert_demo.pdf', registered_at: '2026-03-20T14:30:00Z',
    license_count: 24, status: 'REGISTERED'
  },
};

export default function ContentDetailPage() {
  const params = useParams();
  const content = demoData[params.id] || demoData['1'];
  const [licensing, setLicensing] = useState(false);
  const [licensed, setLicensed] = useState(false);

  const handleLicense = async () => {
    setLicensing(true);
    // Simulate gasless transaction
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLicensed(true);
    setLicensing(false);
  };

  const typeIcons = { image: '🖼️', audio: '🎵', video: '🎬' };
  const typeColors = { image: 'from-cyan-500 to-blue-600', audio: 'from-purple-500 to-pink-600', video: 'from-amber-500 to-red-600' };

  return (
    <main className="page-container">
      <Navbar />

      <div className="pt-24 pb-16 content-wrapper">
        <Link href="/marketplace" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white mb-6 transition-colors">
          ← Back to Marketplace
        </Link>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Preview (3/5) */}
          <div className="lg:col-span-3 space-y-6">
            <div className={`relative rounded-2xl overflow-hidden h-80 md:h-[480px] bg-gradient-to-br ${typeColors[content.content_type]} flex items-center justify-center`}>
              <span className="text-[120px] opacity-30">{typeIcons[content.content_type]}</span>
              <div className="absolute top-4 left-4"><span className="badge-success">✓ Blockchain Verified</span></div>
            </div>

            {/* Blockchain Proof */}
            <div className="glass-card p-6">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-neon-cyan" />
                Blockchain Proof
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Transaction Hash', value: content.tx_hash, mono: true },
                  { label: 'Block Number', value: content.block_number },
                  { label: 'IPFS CID', value: content.ipfs_cid, mono: true },
                  { label: 'Fingerprint Hash', value: content.fingerprint_hash, mono: true },
                  { label: 'Registered', value: new Date(content.registered_at).toLocaleString() },
                ].map((field, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                    <span className="text-xs text-white/40 uppercase tracking-wider w-40 shrink-0">{field.label}</span>
                    <span className={`text-sm text-white/70 break-all ${field.mono ? 'font-mono text-xs' : ''}`}>
                      {field.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar (2/5) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Creator */}
            <div>
              <span className="badge-info mb-2 inline-block capitalize">{content.category}</span>
              <h1 className="text-2xl md:text-3xl font-bold text-white mt-2">{content.title}</h1>
              <p className="text-white/40 mt-3 leading-relaxed text-sm">{content.description}</p>
            </div>

            {/* Creator Info */}
            <div className="glass-card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-sm font-bold text-white">
                {content.creator_name.charAt(0)}
              </div>
              <div>
                <div className="font-medium text-white text-sm">{content.creator_name}</div>
                <div className="text-xs text-white/30 font-mono">{content.creator_wallet}</div>
              </div>
            </div>

            {/* Price & License */}
            <div className="glass-card p-6 neon-border">
              <div className="flex items-end gap-2 mb-4">
                <span className="text-3xl font-bold neon-text">{content.price}</span>
                <span className="text-white/40 pb-1">{content.currency}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/40 mb-6">
                <span>🎫</span>
                <span>{content.license_count} licenses sold</span>
              </div>

              {licensed ? (
                <div className="w-full py-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-center text-emerald-400 font-semibold">
                  ✓ Licensed Successfully
                </div>
              ) : (
                <button onClick={handleLicense} disabled={licensing}
                        className="btn-primary w-full flex items-center justify-center gap-2">
                  {licensing ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Processing Gasless TX...
                    </>
                  ) : (
                    <>
                      <span>🔑</span>
                      License This Content
                    </>
                  )}
                </button>
              )}

              <p className="text-xs text-white/20 text-center mt-3">
                Gasless via account abstraction (ERC-4337)
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="glass-card p-4 text-center">
                <div className="text-lg font-bold text-white">{content.license_count}</div>
                <div className="text-xs text-white/40">Total Licenses</div>
              </div>
              <div className="glass-card p-4 text-center">
                <div className="text-lg font-bold neon-text">10%</div>
                <div className="text-xs text-white/40">Royalty Rate</div>
              </div>
            </div>

            {/* Certificate */}
            <a href={content.certificate_url} target="_blank" rel="noopener noreferrer"
               className="glass-card-hover p-4 flex items-center gap-3 block">
              <span className="text-2xl">📜</span>
              <div>
                <div className="font-medium text-white text-sm">Ownership Certificate</div>
                <div className="text-xs text-white/40">Download PDF proof of ownership</div>
              </div>
              <svg className="w-4 h-4 text-white/30 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

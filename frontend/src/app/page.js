'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';

const features = [
  {
    icon: '🧠',
    title: 'AI Content Verification',
    desc: 'Perceptual hashing and fingerprinting detect duplicates before they reach the blockchain.',
    gradient: 'from-cyan-500 to-blue-500',
  },
  {
    icon: '🔗',
    title: 'Blockchain Notarization',
    desc: 'Immutable ownership records on Polygon. Blockchain as legal notary, not database.',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: '💸',
    title: 'Automated Royalties',
    desc: 'Merkle tree batched royalty distribution. Creators withdraw earnings with cryptographic proof.',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    icon: '🛡️',
    title: 'Invisible Watermarking',
    desc: 'Steganographic watermarks protect content even when shared off-platform.',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    icon: '⚡',
    title: 'Web2 Speed',
    desc: 'Marketplace runs at database speed. Blockchain handles verification, not browsing.',
    gradient: 'from-red-500 to-rose-500',
  },
  {
    icon: '🔍',
    title: 'Content Detection',
    desc: 'Upload any file to check if it matches registered content. Defend your IP.',
    gradient: 'from-indigo-500 to-violet-500',
  },
];

const howItWorks = [
  { step: '01', title: 'Upload', desc: 'Creator uploads content with metadata and pricing', icon: '📤' },
  { step: '02', title: 'Verify', desc: 'AI fingerprints the file and checks for duplicates', icon: '🔬' },
  { step: '03', title: 'Store', desc: 'Original content stored on IPFS, metadata in database', icon: '💾' },
  { step: '04', title: 'Register', desc: 'Ownership recorded on Polygon blockchain', icon: '📜' },
  { step: '05', title: 'License', desc: 'Users purchase licenses via gasless transactions', icon: '🎫' },
  { step: '06', title: 'Earn', desc: 'Royalties auto-distributed via Merkle tree claims', icon: '💰' },
];

const stats = [
  { value: '< 2s', label: 'Upload to Processing' },
  { value: '99.7%', label: 'Fingerprint Accuracy' },
  { value: '$0.001', label: 'Avg Transaction Cost' },
  { value: '∞', label: 'Immutable Records' },
];

export default function Landing() {
  return (
    <main className="page-container overflow-hidden">
      <Navbar />

      {/* ═══ Hero ═══ */}
      <section className="relative min-h-screen flex items-center justify-center grid-pattern">
        {/* Ambient glow */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-cyan/10 rounded-full blur-[128px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-purple/10 rounded-full blur-[128px] animate-pulse-slow" />

        <div className="relative content-wrapper text-center py-32">
          <div className="inline-flex items-center gap-2 px-4 py-2 glass-card rounded-full mb-8 animate-fade-in">
            <span className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
            <span className="text-xs text-white/60 font-medium tracking-wide uppercase">Built on Polygon • Powered by AI</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-tight mb-6 animate-slide-up">
            <span className="text-white">Own Your</span>
            <br />
            <span className="neon-text">Digital Legacy</span>
          </h1>

          <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 animate-fade-in leading-relaxed">
            AI-verified content authenticity. Blockchain-notarized ownership.
            Automated royalty distribution. The future of digital rights management.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
            <Link href="/auth" className="btn-primary text-lg px-8 py-4 animate-glow">
              Start Creating →
            </Link>
            <Link href="/marketplace" className="btn-secondary text-lg px-8 py-4">
              Explore Marketplace
            </Link>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 max-w-3xl mx-auto">
            {stats.map((stat, i) => (
              <div key={i} className="glass-card p-4 animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="text-2xl font-bold neon-text">{stat.value}</div>
                <div className="text-xs text-white/40 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Problems ═══ */}
      <section className="py-24 relative">
        <div className="content-wrapper">
          <div className="text-center mb-16">
            <span className="badge-error mb-4">The Problem</span>
            <h2 className="section-title mt-4">Digital Content is Broken</h2>
            <p className="text-white/40 mt-4 max-w-xl mx-auto">
              Creators lose billions annually to copyright violations, centralized platforms, and opaque royalty systems.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              { icon: '❌', title: 'No Verifiable Ownership', desc: 'Anyone can claim content as their own. No immutable proof exists.' },
              { icon: '🏴‍☠️', title: 'Rampant Copyright Violations', desc: 'Content is copied and redistributed without consent or compensation.' },
              { icon: '📊', title: 'Unreliable Royalty Tracking', desc: 'Manual, delayed, and often inaccurate royalty payments.' },
              { icon: '🏢', title: 'Centralized Control', desc: 'Platforms take excessive cuts and control creator revenue streams.' },
            ].map((problem, i) => (
              <div key={i} className="glass-card-hover p-6 flex gap-4">
                <span className="text-3xl">{problem.icon}</span>
                <div>
                  <h3 className="font-bold text-white mb-1">{problem.title}</h3>
                  <p className="text-sm text-white/50">{problem.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Features ═══ */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neon-cyan/[0.02] to-transparent" />
        <div className="relative content-wrapper">
          <div className="text-center mb-16">
            <span className="badge-info mb-4">The Solution</span>
            <h2 className="section-title mt-4">Hybrid Architecture</h2>
            <p className="text-white/40 mt-4 max-w-xl mx-auto">
              Web2 for speed. AI for verification. Blockchain for immutable truth.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="glass-card-hover p-6 group">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center 
                                text-2xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {f.icon}
                </div>
                <h3 className="font-bold text-white text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ How It Works ═══ */}
      <section className="py-24">
        <div className="content-wrapper">
          <div className="text-center mb-16">
            <h2 className="section-title">How It Works</h2>
            <p className="text-white/40 mt-4 max-w-xl mx-auto">
              From upload to earnings in six automated steps
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {howItWorks.map((step, i) => (
              <div key={i} className="glass-card p-6 relative group hover:border-neon-cyan/30 transition-all duration-300">
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-purple
                                flex items-center justify-center text-xs font-bold text-white shadow-lg">
                  {step.step}
                </div>
                <div className="text-3xl mb-3 mt-2">{step.icon}</div>
                <h3 className="font-bold text-white text-lg mb-1">{step.title}</h3>
                <p className="text-sm text-white/50">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Tech Stack ═══ */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neon-purple/[0.02] to-transparent" />
        <div className="relative content-wrapper">
          <div className="text-center mb-16">
            <h2 className="section-title">Tech Stack</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { name: 'Next.js 14', cat: 'Frontend' },
              { name: 'Tailwind CSS', cat: 'Styling' },
              { name: 'Node.js', cat: 'Backend' },
              { name: 'PostgreSQL', cat: 'Database' },
              { name: 'Redis + BullMQ', cat: 'Queue' },
              { name: 'Python Flask', cat: 'AI Service' },
              { name: 'Polygon', cat: 'Blockchain' },
              { name: 'IPFS / Pinata', cat: 'Storage' },
            ].map((t, i) => (
              <div key={i} className="glass-card p-4 text-center hover:border-neon-cyan/20 transition-colors">
                <div className="font-semibold text-white text-sm">{t.name}</div>
                <div className="text-xs text-white/30 mt-1">{t.cat}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/5 via-transparent to-neon-purple/5" />
        <div className="relative content-wrapper text-center">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
            Ready to <span className="neon-text">Protect Your Work</span>?
          </h2>
          <p className="text-xl text-white/40 mb-10 max-w-xl mx-auto">
            Join CreatorChain and start registering your content on the blockchain today.
          </p>
          <Link href="/auth" className="btn-primary text-lg px-10 py-4 animate-glow">
            Get Started Free →
          </Link>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="border-t border-white/5 py-12">
        <div className="content-wrapper">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="font-bold neon-text">CreatorChain</span>
            </div>
            <p className="text-sm text-white/30">
              © 2026 CreatorChain. Blockchain as Legal Notary.
            </p>
            <div className="flex gap-6">
              {['Docs', 'GitHub', 'Discord'].map((link) => (
                <a key={link} href="#" className="text-sm text-white/40 hover:text-white transition-colors">{link}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

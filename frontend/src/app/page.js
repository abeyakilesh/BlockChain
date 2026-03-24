'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import NetBackground from '@/components/NetBackground';
import { Brain, Link2, DollarSign, Shield, Zap, Search, Upload, ScanSearch, HardDrive, FileCheck, Ticket, Coins, XCircle, Skull, BarChart3, Building2 } from 'lucide-react';

const features = [
  {
    Icon: Brain,
    title: 'AI Content Verification',
    desc: 'Perceptual hashing and fingerprinting detect duplicates before they reach the blockchain.',
  },
  {
    Icon: Link2,
    title: 'Blockchain Notarization',
    desc: 'Immutable ownership records on Polygon. Blockchain as legal notary, not database.',
  },
  {
    Icon: DollarSign,
    title: 'Automated Royalties',
    desc: 'Merkle tree batched royalty distribution. Creators withdraw earnings with cryptographic proof.',
  },
  {
    Icon: Shield,
    title: 'Invisible Watermarking',
    desc: 'Steganographic watermarks protect content even when shared off-platform.',
  },
  {
    Icon: Zap,
    title: 'Web2 Speed',
    desc: 'Marketplace runs at database speed. Blockchain handles verification, not browsing.',
  },
  {
    Icon: Search,
    title: 'Content Detection',
    desc: 'Upload any file to check if it matches registered content. Defend your IP.',
  },
];

const howItWorks = [
  { step: '01', title: 'Upload', desc: 'Creator uploads content with metadata and pricing', Icon: Upload },
  { step: '02', title: 'Verify', desc: 'AI fingerprints the file and checks for duplicates', Icon: ScanSearch },
  { step: '03', title: 'Store', desc: 'Original content stored on IPFS, metadata in database', Icon: HardDrive },
  { step: '04', title: 'Register', desc: 'Ownership recorded on Polygon blockchain', Icon: FileCheck },
  { step: '05', title: 'License', desc: 'Users purchase licenses via gasless transactions', Icon: Ticket },
  { step: '06', title: 'Earn', desc: 'Royalties auto-distributed via Merkle tree claims', Icon: Coins },
];

const stats = [
  { value: '< 2s', label: 'Upload to Processing' },
  { value: '99.7%', label: 'Fingerprint Accuracy' },
  { value: '$0.001', label: 'Avg Transaction Cost' },
  { value: '∞', label: 'Immutable Records' },
];

export default function Landing() {
  return (
    <main className="page-container">
      <Navbar animated />

      {/* ═══ Hero ═══ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <NetBackground />
        <div className="relative content-wrapper text-center py-32">

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold leading-tight mb-6 animate-slide-up">
            <span className="text-gray-900 dark:text-white">Own Your</span>
            <br />
            <span className="text-primary-600 dark:text-primary-400">Digital Legacy</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10 animate-fade-in leading-relaxed">
            AI-verified content authenticity. Blockchain-notarized ownership.
            Automated royalty distribution. The future of digital rights management.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center animate-slide-up">
            <Link href="/auth" className="btn-primary text-base px-8 py-3.5">
              Start Creating →
            </Link>
            <Link href="/marketplace" className="btn-secondary text-base px-8 py-3.5">
              Explore Marketplace
            </Link>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 max-w-3xl mx-auto">
            {stats.map((stat, i) => (
              <div key={i} className="card p-4 text-center animate-fade-in">
                <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">{stat.value}</div>
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Problems ═══ */}
      <section className="py-24">
        <div className="content-wrapper">
          <div className="text-center mb-16">
            <span className="badge-error mb-4">The Problem</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-4">Digital Content is Broken</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-4 max-w-xl mx-auto">
              Creators lose billions annually to copyright violations, centralized platforms, and opaque royalty systems.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {[
              { Icon: XCircle, title: 'No Verifiable Ownership', desc: 'Anyone can claim content as their own. No immutable proof exists.' },
              { Icon: Skull, title: 'Rampant Copyright Violations', desc: 'Content is copied and redistributed without consent or compensation.' },
              { Icon: BarChart3, title: 'Unreliable Royalty Tracking', desc: 'Manual, delayed, and often inaccurate royalty payments.' },
              { Icon: Building2, title: 'Centralized Control', desc: 'Platforms take excessive cuts and control creator revenue streams.' },
            ].map((problem, i) => (
              <div key={i} className="card-hover p-5 flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-500/10 flex items-center justify-center shrink-0">
                  <problem.Icon className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{problem.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{problem.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Features ═══ */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
        <div className="content-wrapper">
          <div className="text-center mb-16">
            <span className="badge-info mb-4">The Solution</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-4">Hybrid Architecture</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-4 max-w-xl mx-auto">
              Web2 for speed. AI for verification. Blockchain for immutable truth.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <div key={i} className="card-hover p-6 group">
                <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center mb-4 group-hover:bg-primary-100 dark:group-hover:bg-primary-500/20 transition-colors">
                  <f.Icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ How It Works ═══ */}
      <section className="py-24">
        <div className="content-wrapper">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">How It Works</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-4 max-w-xl mx-auto">
              From upload to earnings in six automated steps
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {howItWorks.map((step, i) => (
              <div key={i} className="card p-6 relative group hover:border-primary-300 dark:hover:border-primary-500/30 transition-colors">
                <div className="absolute -top-3 -left-3 w-7 h-7 rounded-md bg-primary-600 flex items-center justify-center text-xs font-bold text-white">
                  {step.step}
                </div>
                <step.Icon className="w-6 h-6 text-primary-500 mb-3 mt-1" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{step.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Tech Stack ═══ */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
        <div className="content-wrapper">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Tech Stack</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
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
              <div key={i} className="card p-4 text-center hover:border-primary-300 dark:hover:border-primary-500/30 transition-colors">
                <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">{t.name}</div>
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">{t.cat}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-32">
        <div className="content-wrapper text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6">
            Ready to <span className="text-primary-600 dark:text-primary-400">Protect Your Work</span>?
          </h2>
          <p className="text-lg text-gray-500 dark:text-gray-400 mb-10 max-w-xl mx-auto">
            Join CreatorChain and start registering your content on the blockchain today.
          </p>
          <Link href="/auth" className="btn-primary text-base px-10 py-4">
            Get Started Free →
          </Link>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-10">
        <div className="content-wrapper">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-primary-600 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-semibold text-gray-900 dark:text-white text-sm">CreatorChain</span>
            </div>
            <p className="text-sm text-gray-400">
              © 2026 CreatorChain. Blockchain as Legal Notary.
            </p>
            <div className="flex gap-6">
              {['Docs', 'GitHub', 'Discord'].map((link) => (
                <a key={link} href="#" className="text-sm text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">{link}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

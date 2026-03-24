'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('creator');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let data;
      if (mode === 'register') {
        data = await api.register(email, name, role);
      } else {
        data = await api.login(email);
      }

      localStorage.setItem('creatorchain_user', JSON.stringify(data.user));
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-container">
      <Navbar />

      <div className="min-h-screen flex items-center justify-center px-4 grid-pattern">
        {/* Ambient glow */}
        <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-neon-cyan/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/3 right-1/3 w-72 h-72 bg-neon-purple/10 rounded-full blur-[100px]" />

        <div className="relative w-full max-w-md">
          {/* Card */}
          <div className="glass-card p-8 neon-border">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-neon-cyan to-neon-purple 
                              flex items-center justify-center mb-4 shadow-lg shadow-neon-cyan/20">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white">
                {mode === 'login' ? 'Welcome Back' : 'Join CreatorChain'}
              </h1>
              <p className="text-sm text-white/40 mt-2">
                {mode === 'login' ? 'Sign in with your email' : 'Create your account with an embedded wallet'}
              </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 glass-card rounded-xl mb-6">
              {['login', 'register'].map((m) => (
                <button key={m} onClick={() => { setMode(m); setError(''); }}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                          mode === m ? 'bg-gradient-to-r from-neon-cyan/20 to-neon-purple/20 text-white' : 'text-white/40 hover:text-white/60'
                        }`}>
                  {m === 'login' ? 'Sign In' : 'Register'}
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="block text-xs text-white/40 mb-1.5 font-medium uppercase tracking-wider">Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                         className="input-field" placeholder="Your name" required />
                </div>
              )}

              <div>
                <label className="block text-xs text-white/40 mb-1.5 font-medium uppercase tracking-wider">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                       className="input-field" placeholder="you@example.com" required />
              </div>

              {mode === 'register' && (
                <div>
                  <label className="block text-xs text-white/40 mb-1.5 font-medium uppercase tracking-wider">Role</label>
                  <select value={role} onChange={(e) => setRole(e.target.value)}
                          className="input-field appearance-none cursor-pointer">
                    <option value="creator">Creator</option>
                    <option value="buyer">Buyer / Licensee</option>
                  </select>
                </div>
              )}

              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                      className="btn-primary w-full text-center flex items-center justify-center gap-2">
                {loading && (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                {mode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            {/* Social Login Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-white/30">or continue with</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button className="btn-secondary py-2.5 text-sm flex items-center justify-center gap-2"
                      onClick={() => { setEmail('demo@creatorchain.io'); setName('Demo Creator'); setMode('register'); }}>
                <span>🌐</span> Google
              </button>
              <button className="btn-secondary py-2.5 text-sm flex items-center justify-center gap-2"
                      onClick={() => { setEmail('demo@creatorchain.io'); setName('Demo Creator'); setMode('register'); }}>
                <span>🔑</span> Wallet
              </button>
            </div>

            {/* Wallet Notice */}
            <p className="text-center text-xs text-white/20 mt-6">
              🔒 An embedded wallet (ERC-4337) will be created automatically. No MetaMask needed.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

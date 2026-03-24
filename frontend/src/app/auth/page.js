'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export default function AuthPage() {
  const router = useRouter();
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('creator');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'register') {
        await register(email, name, role);
        toast.success('Account created successfully!');
      } else {
        await login(email);
        toast.success('Welcome back!');
      }
      router.push('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role) => {
    setEmail(role === 'creator' ? 'alex@creatorchain.io' : 'buyer@creatorchain.io');
    setName(role === 'creator' ? 'Alex Chen' : 'Demo Buyer');
    setMode('login');
    toast('Demo credentials loaded. Click Sign In.', { icon: '👋' });
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
                <button key={m} type="button" onClick={() => setMode(m)}
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

              <button type="submit" disabled={loading}
                      className="btn-primary w-full text-center flex items-center justify-center gap-2 mt-2">
                {loading && (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                {mode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-white/30">or continue with demo accounts</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button type="button" className="btn-secondary py-2.5 text-sm flex items-center justify-center gap-2"
                      onClick={() => handleDemoLogin('creator')}>
                <span>🎨</span> Demo Creator
              </button>
              <button type="button" className="btn-secondary py-2.5 text-sm flex items-center justify-center gap-2"
                      onClick={() => handleDemoLogin('buyer')}>
                <span>🛒</span> Demo Buyer
              </button>
            </div>

            <p className="text-center text-xs text-white/20 mt-6 md:px-4">
              🔒 An embedded wallet (ERC-4337) will be automatically provisioned.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

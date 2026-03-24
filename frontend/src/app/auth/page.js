'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import NetBackground from '@/components/NetBackground';
import { useAuth } from '@/context/AuthContext';
import { Hexagon, Lock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AuthPage() {
  const router = useRouter();
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'register') {
        await register(email, name, 'creator');
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



  return (
    <main className="page-container">
      <Navbar hideLinks />

      <div className="min-h-screen flex">
        {/* Left Panel — Branding */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary-600 dark:bg-primary-950 items-center justify-center">
          <NetBackground />
          <div className="relative z-10 max-w-md px-12 animate-[fadeSlideRight_0.6s_ease-out_both]">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-8">
              <Hexagon className="w-7 h-7 text-white" strokeWidth={2} />
            </div>
            <h2 className="text-4xl font-bold text-white leading-tight mb-4">
              Own Your<br />Digital Legacy
            </h2>
            <p className="text-white/60 text-lg leading-relaxed mb-10">
              AI-verified content authenticity. Blockchain-notarized ownership. Start protecting your creative work today.
            </p>
            <div className="space-y-4">
              {[
                'AI fingerprinting & duplicate detection',
                'Immutable blockchain registration',
                'Automated royalty distribution',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-white/70" style={{ animationDelay: `${0.3 + i * 0.1}s` }}>
                  <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/80" />
                  </div>
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel — Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6 sm:px-12 py-24">
          <div className="w-full max-w-lg animate-[fadeSlideUp_0.5s_ease-out_both]">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center gap-2 mb-10">
              <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center">
                <Hexagon className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
              <span className="text-xl font-semibold text-gray-900 dark:text-white">CreatorChain</span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              {mode === 'login' ? 'Sign in to manage your content and earnings.' : 'Get started with an embedded blockchain wallet.'}
            </p>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg mb-8">
              {['login', 'register'].map((m) => (
                <button key={m} type="button" onClick={() => setMode(m)}
                        className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
                          mode === m
                            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}>
                  {m === 'login' ? 'Sign In' : 'Register'}
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className={`space-y-5 transition-all duration-300 ${mode === 'register' ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">Full Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                         className="input-field py-3 text-base" placeholder="Your name" required={mode === 'register'} />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">Email Address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                       className="input-field py-3 text-base" placeholder="you@example.com" required />
              </div>



              <button type="submit" disabled={loading}
                      className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2 mt-2 transition-all duration-200">
                {loading ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <>
                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>



            <p className="text-center text-xs text-gray-400 mt-8 flex items-center justify-center gap-1.5">
              <Lock className="w-3 h-3" /> An embedded wallet (ERC-4337) is provisioned automatically.
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeSlideRight {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </main>
  );
}

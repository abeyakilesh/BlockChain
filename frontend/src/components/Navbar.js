'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from 'next-themes';
import { Hexagon, LogOut, Sun, Moon, Menu, X } from 'lucide-react';
import toast from 'react-hot-toast';

const navLinks = [
  { name: 'Marketplace', href: '/marketplace' },
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Detect', href: '/detect' },
  { name: 'Admin', href: '/admin' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled
        ? 'bg-dark-950/90 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/20'
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center
                            group-hover:shadow-lg group-hover:shadow-neon-cyan/30 transition-all duration-300">
              <Hexagon className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold neon-text">CreatorChain</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link key={link.name} href={link.href}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        isActive ? 'text-slate-900 bg-black/5 dark:text-white dark:bg-white/10' : 'text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                      }`}>
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Auth / Action */}
          <div className="hidden md:flex items-center gap-3">
            {mounted && (
              <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                      className="p-2 mr-2 text-slate-500 hover:text-slate-900 dark:text-white/40 dark:hover:text-white transition-colors rounded-full hover:bg-black/5 dark:hover:bg-white/5">
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            )}

            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 glass-card rounded-full">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-mono text-slate-600 dark:text-white/60">
                    {user.wallet_address?.slice(0, 6)}...{user.wallet_address?.slice(-4)}
                  </span>
                </div>
                <div className="flex items-center gap-3 border-l border-black/10 dark:border-white/10 pl-4">
                  <span className="text-sm font-medium text-slate-800 dark:text-white/80">{user.name}</span>
                  <button onClick={handleLogout} className="text-slate-500 hover:text-red-500 dark:text-white/40 dark:hover:text-red-400 transition-colors">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <Link href="/auth" className="btn-primary text-sm py-2 px-5">
                Get Started
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setMobileOpen(!mobileOpen)}
                  className="md:hidden p-2 text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white">
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-slate-50/95 dark:bg-dark-950/95 backdrop-blur-xl border-t border-black/5 dark:border-white/5 animate-slide-up">
          <div className="px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href}
                    className="block px-4 py-3 text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors"
                    onClick={() => setMobileOpen(false)}>
                {link.name}
              </Link>
            ))}
            
            <div className="pt-2 border-t border-black/10 dark:border-white/10 mt-2 flex justify-between items-center px-4 py-2">
              <span className="text-slate-600 dark:text-white/70 text-sm">Theme</span>
              {mounted && (
                <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="p-2 text-slate-500 dark:text-white/40 bg-black/5 dark:bg-white/5 rounded-full">
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
              )}
            </div>

            <div className="pt-2 border-t border-black/10 dark:border-white/10 mt-2">
              {user ? (
                <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="w-full text-left px-4 py-3 text-red-500 dark:text-red-400 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors font-medium">
                  Log Out
                </button>
              ) : (
                <Link href="/auth" className="block text-center btn-primary text-sm mt-4"
                      onClick={() => setMobileOpen(false)}>
                  Get Started
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

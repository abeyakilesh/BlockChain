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
];

export default function Navbar({ animated = false, hideLinks = false }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [visible, setVisible] = useState(!animated);
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  const showLinks = !hideLinks && !animated;
  const visibleLinks = navLinks;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => setVisible(true), 400);
      return () => clearTimeout(timer);
    }
  }, [animated]);

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
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
      scrolled
        ? 'bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800'
        : 'bg-transparent'
    }`}>
      <div className="w-full px-6 sm:px-10 lg:px-16">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className={`flex items-center gap-2.5 group transition-all ${
            animated ? 'duration-700 ease-out' : ''
          } ${animated && !visible ? 'opacity-0 -translate-x-8' : 'opacity-100 translate-x-0'}`}>
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <Hexagon className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-semibold text-gray-900 dark:text-white">CreatorChain</span>
          </Link>

          {/* Right side — nav links + auth */}
          <div className={`hidden md:flex items-center gap-4 transition-all ${
            animated ? 'duration-600 ease-out' : ''
          } ${animated && !visible ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}
               style={animated ? { transitionDelay: '500ms' } : {}}>

            {/* Nav Links — only on pages that show them */}
            {showLinks && (
              <div className="flex items-center gap-1 mr-2">
                {visibleLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link key={link.name} href={link.href}
                          className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-150 ${
                            isActive
                              ? 'bg-gray-100 dark:bg-gray-800 text-primary-600 dark:text-primary-400'
                              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                          }`}>
                      {link.name}
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Theme Toggle */}
            {mounted && (
              <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                      className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
              </button>
            )}

            {/* User / Auth */}
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                    {user.wallet_address?.slice(0, 6)}...{user.wallet_address?.slice(-4)}
                  </span>
                </div>
                <div className="flex items-center gap-3 border-l border-gray-200 dark:border-gray-700 pl-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{user.name}</span>
                  <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <Link href="/auth" className="btn-primary text-sm py-2 px-4">
                Get Started
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setMobileOpen(!mobileOpen)}
                  className={`md:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all ${
                    animated ? 'duration-500' : ''
                  } ${animated && !visible ? 'opacity-0' : 'opacity-100'}`}
                  style={animated ? { transitionDelay: '600ms' } : {}}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white dark:bg-[#0B0F19] border-t border-gray-200 dark:border-gray-800 animate-slide-up">
          <div className="px-4 py-3 space-y-1">
            {showLinks && visibleLinks.map((link) => (
              <Link key={link.name} href={link.href}
                    className="block px-3 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors text-sm"
                    onClick={() => setMobileOpen(false)}>
                {link.name}
              </Link>
            ))}

            <div className="pt-2 border-t border-gray-100 dark:border-gray-800 mt-2 flex justify-between items-center px-3 py-2">
              <span className="text-gray-500 dark:text-gray-400 text-sm">Theme</span>
              {mounted && (
                <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="p-2 text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
              )}
            </div>

            <div className="pt-2 border-t border-gray-100 dark:border-gray-800 mt-2">
              {user ? (
                <button onClick={() => { handleLogout(); setMobileOpen(false); }}
                        className="w-full text-left px-3 py-2.5 text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors text-sm font-medium">
                  Log Out
                </button>
              ) : (
                <Link href="/auth" className="block text-center btn-primary text-sm mt-2"
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

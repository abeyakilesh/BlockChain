'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { Folder, Users, Ticket, DollarSign, Upload, ShoppingCart, UserPlus, Coins, Shield, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const demoStats = {
  totalContent: 156, totalUsers: 48, totalLicenses: 342, totalRevenue: '28.5 MATIC',
  recentActivity: [
    { type: 'upload', user: 'Alex Chen', action: 'Uploaded "Sunset Photo Pack"', time: '5 min ago' },
    { type: 'license', user: 'Sarah Kim', action: 'Licensed "Lo-fi Beat Pack"', time: '12 min ago' },
    { type: 'register', user: 'New User', action: 'Account created', time: '1 hr ago' },
    { type: 'claim', user: 'Luna Beats', action: 'Claimed 0.5 MATIC royalty', time: '2 hrs ago' },
    { type: 'upload', user: 'Motion Lab', action: 'Uploaded "3D Render Pack"', time: '3 hrs ago' },
  ],
  contentByStatus: { REGISTERED: 120, PENDING: 15, PROCESSING: 8, REJECTED: 10, FAILED: 3 },
};

const activityIcons = {
  upload: Upload,
  license: ShoppingCart,
  register: UserPlus,
  claim: Coins,
};

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Role guard
  if (!loading && (!user || user.role !== 'admin')) {
    return (
      <main className="page-container">
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="card p-12 text-center max-w-md animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-7 h-7 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              This page is restricted to platform administrators only.
            </p>
            <button onClick={() => router.push('/dashboard')} className="btn-primary py-2.5 px-6 text-sm">
              Go to Dashboard
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page-container">
      <Navbar />
      <div className="pt-24 pb-16 content-wrapper">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Platform monitoring — read-only, no control over funds</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Content', value: demoStats.totalContent, Icon: Folder, color: 'text-primary-500', bg: 'bg-primary-50 dark:bg-primary-500/10' },
            { label: 'Total Users', value: demoStats.totalUsers, Icon: Users, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-500/10' },
            { label: 'Total Licenses', value: demoStats.totalLicenses, Icon: Ticket, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
            { label: 'Total Revenue', value: demoStats.totalRevenue, Icon: DollarSign, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' },
          ].map((s, i) => (
            <div key={i} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center`}>
                  <s.Icon className={`w-4.5 h-4.5 ${s.color}`} />
                </div>
              </div>
              <div className="text-2xl font-semibold text-gray-900 dark:text-white">{s.value}</div>
              <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          {/* Content Status */}
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-4">Content by Status</h3>
            <div className="space-y-3">
              {Object.entries(demoStats.contentByStatus).map(([status, count]) => {
                const total = Object.values(demoStats.contentByStatus).reduce((a,b)=>a+b,0);
                const pct = (count/total*100).toFixed(0);
                const colors = { REGISTERED: 'bg-emerald-500', PENDING: 'bg-amber-500', PROCESSING: 'bg-blue-500', REJECTED: 'bg-red-500', FAILED: 'bg-red-800' };
                return (
                  <div key={status}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">{status}</span>
                      <span className="text-gray-400 dark:text-gray-500">{count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${colors[status]||'bg-gray-500'}`} style={{width:`${pct}%`}} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-4">Recent Activity</h3>
            <div className="space-y-1">
              {demoStats.recentActivity.map((a, i) => {
                const ActivityIcon = activityIcons[a.type] || Upload;
                return (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                      <ActivityIcon className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-gray-100"><span className="font-medium">{a.user}</span></p>
                      <p className="text-xs text-gray-400 truncate">{a.action}</p>
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">{a.time}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-8 card p-5 border-amber-200 dark:border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center shrink-0">
              <Shield className="w-4.5 h-4.5 text-amber-500" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white text-sm">Admin Role: Monitoring Only</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">This dashboard provides read-only access. Admins cannot control, modify, or access creator funds. All royalties are managed by smart contracts.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

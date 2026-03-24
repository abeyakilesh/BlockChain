'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';

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

const activityIcons = { upload: '📤', license: '🎫', register: '👤', claim: '💰' };

export default function AdminPage() {
  return (
    <main className="page-container">
      <Navbar />
      <div className="pt-24 pb-16 content-wrapper">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-white/40 mt-1">Platform monitoring — read-only, no control over funds</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Content', value: demoStats.totalContent, icon: '📁', color: 'from-cyan-500 to-blue-500' },
            { label: 'Total Users', value: demoStats.totalUsers, icon: '👥', color: 'from-purple-500 to-pink-500' },
            { label: 'Total Licenses', value: demoStats.totalLicenses, icon: '🎫', color: 'from-emerald-500 to-teal-500' },
            { label: 'Total Revenue', value: demoStats.totalRevenue, icon: '💰', color: 'from-amber-500 to-orange-500' },
          ].map((s, i) => (
            <div key={i} className="glass-card p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{s.icon}</span>
                <div className={`w-8 h-1 rounded-full bg-gradient-to-r ${s.color}`} />
              </div>
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-white/40 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Content Status */}
          <div className="glass-card p-6">
            <h3 className="font-semibold text-white mb-4">Content by Status</h3>
            <div className="space-y-3">
              {Object.entries(demoStats.contentByStatus).map(([status, count]) => {
                const total = Object.values(demoStats.contentByStatus).reduce((a,b)=>a+b,0);
                const pct = (count/total*100).toFixed(0);
                const colors = { REGISTERED: 'bg-emerald-500', PENDING: 'bg-amber-500', PROCESSING: 'bg-blue-500', REJECTED: 'bg-red-500', FAILED: 'bg-red-800' };
                return (
                  <div key={status}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-white/60">{status}</span>
                      <span className="text-white/40">{count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-2">
                      <div className={`h-2 rounded-full ${colors[status]||'bg-gray-500'}`} style={{width:`${pct}%`}} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="glass-card p-6">
            <h3 className="font-semibold text-white mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {demoStats.recentActivity.map((a, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/[0.02] transition-colors">
                  <span className="text-xl">{activityIcons[a.type]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white"><span className="font-medium">{a.user}</span></p>
                    <p className="text-xs text-white/40 truncate">{a.action}</p>
                  </div>
                  <span className="text-xs text-white/30 shrink-0">{a.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-8 glass-card p-6 border border-amber-500/20">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔒</span>
            <div>
              <p className="font-medium text-amber-400">Admin Role: Monitoring Only</p>
              <p className="text-sm text-white/40">This dashboard provides read-only access. Admins cannot control, modify, or access creator funds. All royalties are managed by smart contracts.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

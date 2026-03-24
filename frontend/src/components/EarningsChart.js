'use client';

import { useEffect, useRef } from 'react';

export default function EarningsChart({ dailyEarnings = [] }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || dailyEarnings.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const padding = { top: 20, right: 20, bottom: 40, left: 50 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const amounts = dailyEarnings.map(d => parseFloat(d.daily_amount));
    const maxAmount = Math.max(...amounts, 0.01);

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      // Y-axis labels
      const val = (maxAmount - (maxAmount / 4) * i).toFixed(3);
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(val, padding.left - 8, y + 4);
    }

    // Gradient fill
    const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
    gradient.addColorStop(0, 'rgba(0, 212, 255, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 212, 255, 0.0)');

    // Area path
    ctx.beginPath();
    dailyEarnings.forEach((d, i) => {
      const x = padding.left + (i / (dailyEarnings.length - 1 || 1)) * chartW;
      const y = padding.top + chartH - (parseFloat(d.daily_amount) / maxAmount) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    // Close area
    const lastX = padding.left + chartW;
    ctx.lineTo(lastX, padding.top + chartH);
    ctx.lineTo(padding.left, padding.top + chartH);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Line path
    ctx.beginPath();
    dailyEarnings.forEach((d, i) => {
      const x = padding.left + (i / (dailyEarnings.length - 1 || 1)) * chartW;
      const y = padding.top + chartH - (parseFloat(d.daily_amount) / maxAmount) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = '#00d4ff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Data points
    dailyEarnings.forEach((d, i) => {
      const x = padding.left + (i / (dailyEarnings.length - 1 || 1)) * chartW;
      const y = padding.top + chartH - (parseFloat(d.daily_amount) / maxAmount) * chartH;

      // Glow
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 212, 255, 0.2)';
      ctx.fill();

      // Dot
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#00d4ff';
      ctx.fill();

      // X-axis labels
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'center';
      const dateLabel = new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      ctx.fillText(dateLabel, x, height - padding.bottom + 20);
    });

  }, [dailyEarnings]);

  if (dailyEarnings.length === 0) {
    return (
      <div className="glass-card p-6 text-center">
        <span className="text-3xl mb-2 block">📊</span>
        <p className="text-white/40 text-sm">No earnings data yet</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white">Earnings Overview</h3>
        <span className="text-xs text-white/30">MATIC</span>
      </div>
      <canvas
        ref={canvasRef}
        className="w-full"
        style={{ height: '200px' }}
      />
    </div>
  );
}

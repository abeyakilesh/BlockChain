'use client';

import { useEffect, useRef } from 'react';
import { BarChart3 } from 'lucide-react';

export default function EarningsChart({ dailyEarnings = [] }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || dailyEarnings.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

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

    ctx.clearRect(0, 0, width, height);

    // Detect dark mode
    const isDark = document.documentElement.classList.contains('dark');
    const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
    const labelColor = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)';
    const lineColor = '#6366F1';
    const fillStart = isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.15)';
    const fillEnd = 'rgba(99,102,241,0.0)';

    // Grid lines
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      const val = (maxAmount - (maxAmount / 4) * i).toFixed(3);
      ctx.fillStyle = labelColor;
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(val, padding.left - 8, y + 4);
    }

    // Area fill
    const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
    gradient.addColorStop(0, fillStart);
    gradient.addColorStop(1, fillEnd);

    ctx.beginPath();
    dailyEarnings.forEach((d, i) => {
      const x = padding.left + (i / (dailyEarnings.length - 1 || 1)) * chartW;
      const y = padding.top + chartH - (parseFloat(d.daily_amount) / maxAmount) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    const lastX = padding.left + chartW;
    ctx.lineTo(lastX, padding.top + chartH);
    ctx.lineTo(padding.left, padding.top + chartH);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Line
    ctx.beginPath();
    dailyEarnings.forEach((d, i) => {
      const x = padding.left + (i / (dailyEarnings.length - 1 || 1)) * chartW;
      const y = padding.top + chartH - (parseFloat(d.daily_amount) / maxAmount) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Dots
    dailyEarnings.forEach((d, i) => {
      const x = padding.left + (i / (dailyEarnings.length - 1 || 1)) * chartW;
      const y = padding.top + chartH - (parseFloat(d.daily_amount) / maxAmount) * chartH;

      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = lineColor;
      ctx.fill();

      // X-labels
      ctx.fillStyle = labelColor;
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'center';
      const dateLabel = new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      ctx.fillText(dateLabel, x, height - padding.bottom + 20);
    });

  }, [dailyEarnings]);

  if (dailyEarnings.length === 0) {
    return (
      <div className="card p-8 text-center">
        <BarChart3 className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
        <p className="text-gray-400 dark:text-gray-500 text-sm">No earnings data yet</p>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Earnings Overview</h3>
        <span className="text-xs text-gray-400">MATIC</span>
      </div>
      <canvas
        ref={canvasRef}
        className="w-full"
        style={{ height: '200px' }}
      />
    </div>
  );
}

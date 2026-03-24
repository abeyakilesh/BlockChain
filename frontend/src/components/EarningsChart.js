'use client';

import { useState, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';
import { TrendingUp, ArrowUpRight, Activity, Upload } from 'lucide-react';

// ─── Data Processing ──────────────────────────────────────
function generateTimeSeriesData(transactions = [], range) {
  const now = new Date();
  
  // Create an array of buckets depending on the range
  const buckets = [];
  let formatLabel, timeThreshold, numBuckets, stepMs;

  if (range === '24H') {
    numBuckets = 24;
    stepMs = 60 * 60 * 1000; // 1 hour
    timeThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    formatLabel = (date) => date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
  } else if (range === '7D') {
    numBuckets = 7;
    stepMs = 24 * 60 * 60 * 1000; // 1 day
    timeThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    formatLabel = (date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } else { // 30D
    numBuckets = 30;
    stepMs = 24 * 60 * 60 * 1000; // 1 day
    timeThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    formatLabel = (date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  // Initialize empty buckets
  let currentStart = new Date(timeThreshold);
  for (let i = 0; i < numBuckets; i++) {
    currentStart = new Date(currentStart.getTime() + stepMs);
    buckets.push({
      timestamp: currentStart.getTime(),
      label: formatLabel(currentStart),
      amount: 0,
      transactions: 0
    });
  }

  // Aggregate genuine backend transactions into buckets
  if (transactions && transactions.length > 0) {
    transactions.forEach(tx => {
      const txDate = new Date(tx.timestamp);
      if (txDate > timeThreshold) {
        // Find the closest bucket
        const bucketIndex = buckets.findIndex(b => b.timestamp >= txDate.getTime());
        if (bucketIndex !== -1) {
          buckets[bucketIndex].amount += parseFloat(tx.amount || 0);
          buckets[bucketIndex].transactions += 1;
        } else if (buckets.length > 0) {
          // If perfectly matching now, add to last bucket
          buckets[buckets.length - 1].amount += parseFloat(tx.amount || 0);
          buckets[buckets.length - 1].transactions += 1;
        }
      }
    });
  }

  // Fix precision
  return buckets.map(b => ({
    ...b,
    amount: parseFloat(b.amount.toFixed(4))
  }));
}

// ─── Custom Tooltip ───────────────────────────────────────
function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const dateStr = new Date(d.timestamp).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });
  const timeStr = new Date(d.timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit'
  });

  return (
    <div className="bg-gray-900 dark:bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 shadow-2xl">
      <p className="text-[11px] text-gray-400 mb-1.5">{dateStr}, {timeStr}</p>
      <div className="flex items-baseline gap-1.5">
        <span className="text-lg font-bold text-white">{d.amount.toFixed(4)}</span>
        <span className="text-xs text-gray-400">MATIC</span>
      </div>
      <div className="flex items-center gap-1 mt-1.5 text-[11px] text-gray-500">
        <Activity className="w-3 h-3" /> {d.transactions} transaction{d.transactions !== 1 ? 's' : ''}
      </div>
    </div>
  );
}

// ─── Custom Active Dot (glowing) ──────────────────────────
function GlowDot(props) {
  const { cx, cy } = props;
  return (
    <g>
      <circle cx={cx} cy={cy} r={10} fill="rgba(59,130,246,0.2)" />
      <circle cx={cx} cy={cy} r={6} fill="rgba(59,130,246,0.3)" />
      <circle cx={cx} cy={cy} r={3.5} fill="#3B82F6" stroke="#fff" strokeWidth={2} />
    </g>
  );
}

// ─── Main Component ───────────────────────────────────────
export default function EarningsChart({ transactions = [] }) {
  const [range, setRange] = useState('7D');
  const ranges = ['24H', '7D', '30D'];

  // Process ONLY REAL backend transactions based on selected range
  const chartData = useMemo(() => generateTimeSeriesData(transactions, range), [transactions, range]);

  // Total metric calculations
  const totalEarnings = chartData.reduce((s, d) => s + d.amount, 0);
  const totalTx = chartData.reduce((s, d) => s + d.transactions, 0);
  const avgPrice = totalTx > 0 ? totalEarnings / totalTx : 0;
  
  // Strict rule: If ZERO real transactions from backend globally, show empty state
  const isEmpty = !transactions || transactions.length === 0;

  // ─── Empty State (No Mock Data Ever) ──────────────────
  if (isEmpty) {
    return (
      <div className="card p-10 text-center flex flex-col items-center justify-center min-h-[350px]">
        <div className="w-14 h-14 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-5">
          <Upload className="w-7 h-7 text-gray-400 dark:text-gray-500" strokeWidth={1.5} />
        </div>
        <p className="text-gray-900 dark:text-white font-semibold text-lg mb-2">No earnings data yet</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
          Upload and verify your content on the blockchain to start selling commercial licenses and earning MATIC.
        </p>
      </div>
    );
  }

  return (
    <div className="card p-6">
      {/* ─── Header: Metrics + Range Filters ────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary-500" /> Earnings Analytics
          </h3>
          {/* Secondary Metrics */}
          <div className="flex items-center gap-5 mt-3">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalEarnings.toFixed(4)}
                <span className="text-sm font-normal text-gray-400 ml-1">MATIC</span>
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3 text-green-500" /> Earnings ({range})
              </p>
            </div>
            <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />
            <div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{totalTx}</p>
              <p className="text-[11px] text-gray-400">Transactions</p>
            </div>
            <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block" />
            <div className="hidden sm:block">
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{avgPrice.toFixed(4)}</p>
              <p className="text-[11px] text-gray-400">Avg per sale</p>
            </div>
          </div>
        </div>

        {/* Range Filters */}
        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg self-start">
          {ranges.map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                range === r
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Chart ───────────────────────────────────────── */}
      <div className="h-[280px] -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.25} />
                <stop offset="50%" stopColor="#3B82F6" stopOpacity={0.08} />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="currentColor"
              className="text-gray-100 dark:text-gray-800"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#9CA3AF' }}
              interval="preserveStartEnd"
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#9CA3AF' }}
              tickFormatter={v => v.toFixed(2)}
              width={50}
            />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ stroke: '#3B82F6', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="url(#lineGradient)"
              strokeWidth={2.5}
              fill="url(#earningsGradient)"
              activeDot={<GlowDot />}
              dot={false}
              animationDuration={1200}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

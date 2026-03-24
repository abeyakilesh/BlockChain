'use client';

import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';

const stageLabels = {
  PENDING: { label: 'Queued', pct: 5, icon: '⏳' },
  PROCESSING: { label: 'Processing', pct: 15, icon: '⚙️' },
  FINGERPRINTING: { label: 'AI Fingerprinting', pct: 30, icon: '🧠' },
  CHECKING_SIMILARITY: { label: 'Checking Duplicates', pct: 45, icon: '🔍' },
  UPLOADING_IPFS: { label: 'Uploading to IPFS', pct: 60, icon: '📦' },
  REGISTERING_BLOCKCHAIN: { label: 'Blockchain Registration', pct: 75, icon: '🔗' },
  GENERATING_CERTIFICATE: { label: 'Generating Certificate', pct: 90, icon: '📜' },
  REGISTERED: { label: 'Complete!', pct: 100, icon: '✅' },
  REJECTED: { label: 'Rejected (Duplicate)', pct: 100, icon: '❌' },
  FAILED: { label: 'Processing Failed', pct: 100, icon: '💥' },
};

export default function StatusTracker({ jobId, onComplete }) {
  const [status, setStatus] = useState('PENDING');
  const [details, setDetails] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!jobId) return;

    const pollStatus = async () => {
      try {
        const data = await api.getJobStatus(jobId);
        setStatus(data.status);
        setDetails(data);

        if (['REGISTERED', 'REJECTED', 'FAILED'].includes(data.status)) {
          clearInterval(intervalRef.current);
          if (onComplete) onComplete(data);
        }
      } catch (err) {
        console.error('Poll error:', err);
      }
    };

    pollStatus();
    intervalRef.current = setInterval(pollStatus, 2000);

    return () => clearInterval(intervalRef.current);
  }, [jobId, onComplete]);

  const stage = stageLabels[status] || stageLabels.PENDING;
  const isError = ['REJECTED', 'FAILED'].includes(status);
  const isDone = status === 'REGISTERED';

  return (
    <div className={`glass-card p-6 border ${
      isError ? 'border-red-500/30' : isDone ? 'border-emerald-500/30' : 'border-neon-cyan/20'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{stage.icon}</span>
          <span className={`font-semibold text-sm ${
            isError ? 'text-red-400' : isDone ? 'text-emerald-400' : 'text-white'
          }`}>
            {stage.label}
          </span>
        </div>
        <span className="text-xs text-white/30 font-mono">Job: {jobId?.slice(0, 8)}...</span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-white/5 rounded-full h-2 mb-3">
        <div
          className={`h-2 rounded-full transition-all duration-700 ease-out ${
            isError ? 'bg-red-500' : isDone ? 'bg-emerald-500' : 'bg-gradient-to-r from-neon-cyan to-neon-purple'
          }`}
          style={{ width: `${stage.pct}%` }}
        />
      </div>

      {/* Pipeline stages */}
      <div className="flex justify-between">
        {['FINGERPRINTING', 'UPLOADING_IPFS', 'REGISTERING_BLOCKCHAIN', 'REGISTERED'].map((s, i) => {
          const stageInfo = stageLabels[s];
          const active = stage.pct >= stageInfo.pct;
          return (
            <div key={s} className="flex flex-col items-center gap-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all ${
                active ? 'bg-neon-cyan/20 text-neon-cyan' : 'bg-white/5 text-white/20'
              }`}>
                {stageInfo.icon}
              </div>
              <span className={`text-[10px] ${active ? 'text-white/60' : 'text-white/20'}`}>
                {['AI', 'IPFS', 'Chain', 'Done'][i]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Result details */}
      {isDone && details?.txHash && (
        <div className="mt-4 pt-3 border-t border-white/5 space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-white/30">TX Hash</span>
            <span className="text-white/50 font-mono">{details.txHash?.slice(0, 20)}...</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-white/30">IPFS CID</span>
            <span className="text-white/50 font-mono">{details.ipfsCid?.slice(0, 20)}...</span>
          </div>
        </div>
      )}

      {isError && details?.error && (
        <p className="mt-3 text-xs text-red-400/70">{details.error}</p>
      )}
    </div>
  );
}

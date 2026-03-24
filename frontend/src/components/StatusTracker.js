'use client';

import { useState, useEffect, useRef } from 'react';
import { Clock, Cog, Brain, Search, HardDrive, Link2, FileCheck, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import api from '@/lib/api';

const stageLabels = {
  PENDING:                  { label: 'Queued',                  pct: 5,   Icon: Clock },
  PROCESSING:               { label: 'Processing',              pct: 15,  Icon: Cog },
  FINGERPRINTING:           { label: 'AI Fingerprinting',       pct: 30,  Icon: Brain },
  CHECKING_SIMILARITY:      { label: 'Checking Duplicates',     pct: 45,  Icon: Search },
  UPLOADING_IPFS:           { label: 'Uploading to IPFS',       pct: 60,  Icon: HardDrive },
  REGISTERING_BLOCKCHAIN:   { label: 'Blockchain Registration', pct: 75,  Icon: Link2 },
  GENERATING_CERTIFICATE:   { label: 'Generating Certificate',  pct: 90,  Icon: FileCheck },
  REGISTERED:               { label: 'Complete',                pct: 100, Icon: CheckCircle },
  REJECTED:                 { label: 'Rejected (Duplicate)',     pct: 100, Icon: XCircle },
  FAILED:                   { label: 'Processing Failed',       pct: 100, Icon: AlertTriangle },
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
  const StageIcon = stage.Icon;
  const isError = ['REJECTED', 'FAILED'].includes(status);
  const isDone = status === 'REGISTERED';

  return (
    <div className={`card p-5 border ${
      isError ? 'border-red-300 dark:border-red-500/30' : isDone ? 'border-emerald-300 dark:border-emerald-500/30' : 'border-gray-200 dark:border-gray-700'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <StageIcon className={`w-4 h-4 ${
            isError ? 'text-red-500' : isDone ? 'text-emerald-500' : 'text-primary-500'
          }`} />
          <span className={`font-medium text-sm ${
            isError ? 'text-red-600 dark:text-red-400' : isDone ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-gray-100'
          }`}>
            {stage.label}
          </span>
        </div>
        <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">Job: {jobId?.slice(0, 8)}...</span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 mb-3">
        <div
          className={`h-1.5 rounded-full transition-all duration-500 ease-out ${
            isError ? 'bg-red-500' : isDone ? 'bg-emerald-500' : 'bg-primary-500'
          }`}
          style={{ width: `${stage.pct}%` }}
        />
      </div>

      {/* Pipeline stages */}
      <div className="flex justify-between">
        {[
          { key: 'FINGERPRINTING', label: 'AI', Icon: Brain },
          { key: 'UPLOADING_IPFS', label: 'IPFS', Icon: HardDrive },
          { key: 'REGISTERING_BLOCKCHAIN', label: 'Chain', Icon: Link2 },
          { key: 'REGISTERED', label: 'Done', Icon: CheckCircle },
        ].map((s) => {
          const active = stage.pct >= stageLabels[s.key].pct;
          return (
            <div key={s.key} className="flex flex-col items-center gap-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                active ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600'
              }`}>
                <s.Icon className="w-3 h-3" />
              </div>
              <span className={`text-[10px] ${active ? 'text-gray-600 dark:text-gray-400' : 'text-gray-300 dark:text-gray-600'}`}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Result details */}
      {isDone && details?.txHash && (
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">TX Hash</span>
            <span className="text-gray-500 font-mono">{details.txHash?.slice(0, 20)}...</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">IPFS CID</span>
            <span className="text-gray-500 font-mono">{details.ipfsCid?.slice(0, 20)}...</span>
          </div>
        </div>
      )}

      {isError && details?.error && (
        <p className="mt-3 text-xs text-red-500">{details.error}</p>
      )}
    </div>
  );
}

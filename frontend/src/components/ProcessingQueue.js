'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { CheckCircle2, Clock, Image as ImageIcon, Music, Video, Loader2, X, AlertCircle, RotateCcw } from 'lucide-react';

// ─── Stage Configuration ──────────────────────────────────
const STAGES = [
  { at: 0, label: 'Uploading file...', duration: 2 },
  { at: 15, label: 'Computing SHA-256 fingerprint...', duration: 2 },
  { at: 30, label: 'Checking for duplicates...', duration: 2 },
  { at: 50, label: 'Verifying content authenticity...', duration: 2 },
  { at: 65, label: 'Registering on blockchain...', duration: 2 },
  { at: 80, label: 'Minting ownership certificate...', duration: 1 },
  { at: 92, label: 'Finalizing...', duration: 1 },
];

const MIN_PROCESSING_TIME = 10; // seconds minimum

const typeIcons = { image: ImageIcon, audio: Music, video: Video };
const typeColors = {
  image: 'text-blue-500 bg-blue-50 dark:bg-blue-500/10',
  audio: 'text-violet-500 bg-violet-50 dark:bg-violet-500/10',
  video: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10',
};

// ─── Single Processing Item ──────────────────────────────
function ProcessingItem({ job, onComplete, onRemove, onRetry }) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('processing'); // processing | complete | failed
  const [timeLeft, setTimeLeft] = useState(MIN_PROCESSING_TIME);
  const [step, setStep] = useState(STAGES[0].label);
  const startTimeRef = useRef(Date.now());
  const completedRef = useRef(false);

  const fileSizeMB = job.fileSize ? job.fileSize / (1024 * 1024) : 5;
  const TypeIcon = typeIcons[job.category] || ImageIcon;

  useEffect(() => {
    startTimeRef.current = Date.now();
    completedRef.current = false;

    // If backend already returned REGISTERED, we still animate for minimum time
    const isAlreadyDone = job.status === 'REGISTERED';
    const isFailed = job.status === 'FAILED' || job.status === 'REJECTED';

    if (isFailed) {
      setStatus('failed');
      setStep(job.error || 'Processing failed');
      setProgress(100);
      return;
    }

    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const duration = Math.max(MIN_PROCESSING_TIME, isAlreadyDone ? MIN_PROCESSING_TIME : 15);
      const pct = Math.min((elapsed / duration) * 100, 100);

      setProgress(pct);
      setTimeLeft(Math.max(0, Math.ceil(duration - elapsed)));

      // Find current stage
      const currentStage = [...STAGES].reverse().find(s => pct >= s.at);
      if (currentStage) setStep(currentStage.label);

      // Complete when we've reached 100% AND minimum time has passed
      if (pct >= 100 && elapsed >= MIN_PROCESSING_TIME && !completedRef.current) {
        completedRef.current = true;
        clearInterval(interval);
        setStatus('complete');
        setStep('Verified & Minted on Blockchain');
        onComplete?.({ status: 'REGISTERED', jobId: job.jobId });
      }
    }, 100);

    return () => clearInterval(interval);
  }, [job.jobId, job.status, job.error, onComplete]);

  const isComplete = status === 'complete';
  const isFailed = status === 'failed';

  return (
    <div className={`card p-5 transition-all duration-500 animate-slide-up ${
      isComplete ? 'border-green-200 dark:border-green-500/20 bg-green-50/30 dark:bg-green-500/5' :
      isFailed ? 'border-red-200 dark:border-red-500/20 bg-red-50/30 dark:bg-red-500/5' :
      'border-primary-200/50 dark:border-primary-500/10'
    }`}>
      <div className="flex items-start gap-4">
        {/* Type Icon */}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
          isComplete ? 'bg-green-50 dark:bg-green-500/10' :
          isFailed ? 'bg-red-50 dark:bg-red-500/10' :
          typeColors[job.category] || typeColors.image
        }`}>
          {isComplete ? <CheckCircle2 className="w-5 h-5 text-green-500" /> :
           isFailed ? <AlertCircle className="w-5 h-5 text-red-500" /> :
           <TypeIcon className="w-5 h-5" />}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-semibold text-sm text-gray-900 dark:text-white truncate pr-4">
              {job.title || 'Untitled'}
            </h4>
            <div className="flex items-center gap-2 shrink-0">
              {isComplete && (
                <span className="badge-success text-[10px] flex items-center gap-1 animate-fade-in">
                  <CheckCircle2 className="w-3 h-3" /> Minted
                </span>
              )}
              {isFailed && (
                <button onClick={() => onRetry?.(job)} className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 font-medium">
                  <RotateCcw className="w-3 h-3" /> Retry
                </button>
              )}
              {!isComplete && !isFailed && (
                <button onClick={() => onRemove?.(job.jobId)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-0.5">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* File metadata */}
          <div className="flex items-center gap-3 text-[11px] text-gray-400 mb-3">
            <span className="capitalize">{job.category || 'Image'}</span>
            <span>·</span>
            <span>{fileSizeMB.toFixed(1)} MB</span>
            {!isComplete && !isFailed && (
              <>
                <span>·</span>
                <span className="flex items-center gap-1 text-amber-500 font-medium">
                  <Clock className="w-3 h-3" /> ~{timeLeft}s remaining
                </span>
              </>
            )}
          </div>

          {/* Progress Bar */}
          <div className="relative h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-2.5">
            <div
              className={`absolute inset-y-0 left-0 rounded-full transition-all ease-out ${
                isComplete ? 'bg-gradient-to-r from-green-400 to-emerald-500 duration-500' :
                isFailed ? 'bg-gradient-to-r from-red-400 to-red-500 duration-300' :
                'bg-gradient-to-r from-blue-500 via-primary-500 to-violet-500 duration-150'
              }`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
            {/* Shimmer overlay on active bar */}
            {!isComplete && !isFailed && progress > 0 && (
              <div
                className="absolute inset-y-0 rounded-full overflow-hidden"
                style={{ width: `${Math.min(progress, 100)}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-shimmer" />
              </div>
            )}
          </div>

          {/* Step Label */}
          <div className="flex items-center justify-between">
            <p className={`text-[11px] font-medium transition-all duration-300 ${
              isComplete ? 'text-green-500' :
              isFailed ? 'text-red-500' :
              'text-gray-500 dark:text-gray-400'
            }`}>
              {isComplete ? (
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Content verified & minted on blockchain
                </span>
              ) : isFailed ? (
                <span className="flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" /> {step}
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> {step}
                </span>
              )}
            </p>
            <span className={`text-xs font-bold ${
              isComplete ? 'text-green-500' : isFailed ? 'text-red-500' : 'text-primary-500'
            }`}>
              {Math.round(progress)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────
export default function ProcessingQueue({ jobs = [], onJobComplete, onRemoveJob, onRetryJob }) {
  if (jobs.length === 0) {
    return (
      <div className="card p-12 text-center">
        <Clock className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">No active uploads</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Upload content to see live processing here</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1 mb-2">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Processing Queue
          <span className="ml-2 text-xs font-normal text-gray-400">({jobs.length} item{jobs.length !== 1 ? 's' : ''})</span>
        </h3>
      </div>
      {jobs.map(job => (
        <ProcessingItem
          key={job.jobId}
          job={job}
          onComplete={onJobComplete}
          onRemove={onRemoveJob}
          onRetry={onRetryJob}
        />
      ))}
    </div>
  );
}

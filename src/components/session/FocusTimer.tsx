import React, { useState, useEffect } from 'react';
import { Play, Square, Pause, ShieldCheck, AlertCircle } from 'lucide-react';
import { formatDuration } from '../../utils/formatters';

interface FocusTimerProps {
  isFocusing: boolean;
  initialSeconds?: number;
  onStartFocus: () => void;
  onEndFocus: (elapsedSeconds: number) => void;
  disabled?: boolean;
}

export const FocusTimer: React.FC<FocusTimerProps> = ({
  isFocusing,
  initialSeconds = 0,
  onStartFocus,
  onEndFocus,
  disabled = false,
}) => {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    let interval: any = null;
    if (isFocusing) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isFocusing]);

  const handleEnd = () => {
    onEndFocus(seconds);
  };

  const minutes = Math.floor(seconds / 60);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col items-center text-center">
      {/* Privacy note */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium mb-6">
        <ShieldCheck className="w-4 h-4 text-teal-600" />
        <span>Privacy-Protected Focus Stopwatch</span>
      </div>

      {/* Big Circular Counter */}
      <div className="relative w-52 h-52 sm:w-60 sm:h-60 rounded-full bg-slate-50 border-8 border-slate-100 flex flex-col items-center justify-center shadow-inner">
        {/* Animated pulsating outer ring when focusing */}
        {isFocusing && (
          <div className="absolute inset-0 rounded-full border-4 border-teal-500/40 animate-ping" />
        )}
        
        <div className={`text-4xl sm:text-5xl font-mono font-black tracking-tight ${isFocusing ? 'text-teal-600' : 'text-slate-700'}`}>
          {formatDuration(seconds)}
        </div>
        
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-2">
          {isFocusing ? 'Active Focus Time' : 'Session Stopwatch'}
        </div>

        {isFocusing && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Focus Mode ON
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full max-w-sm">
        {!isFocusing ? (
          <button
            onClick={onStartFocus}
            disabled={disabled}
            className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white font-bold text-sm shadow-md shadow-teal-600/30 transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            <Play className="w-5 h-5 fill-current" />
            START FOCUS SESSION
          </button>
        ) : (
          <button
            onClick={handleEnd}
            disabled={disabled}
            className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white font-bold text-sm shadow-md shadow-rose-600/30 transition-all"
          >
            <Square className="w-4 h-4 fill-current" />
            END FOCUS SESSION
          </button>
        )}
      </div>

      {/* Context disclaimer */}
      <p className="text-[11px] text-slate-400 mt-4 max-w-xs leading-relaxed">
        Starting focus marks your session engagement. No camera or invasive device tracking is utilized.
      </p>
    </div>
  );
};

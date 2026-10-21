import React, { useState, useEffect, useRef } from 'react';
import { useSession } from '../../contexts/SessionContext';
import { useAuth } from '../../contexts/AuthContext';
import { FocusTimer } from '../../components/session/FocusTimer';
import { EventSimulator } from '../../components/session/EventSimulator';
import { calculateStudentEngagementScore } from '../../services/analyticsService';
import { 
  Compass, 
  BookOpen, 
  User, 
  LogOut, 
  ShieldCheck, 
  ShieldAlert,
  Clock, 
  Award, 
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  X,
  Sun,
  Smartphone
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';

interface StudentFocusPageProps {
  onNavigate: (route: string) => void;
}

export const StudentFocusPage: React.FC<StudentFocusPageProps> = ({ onNavigate }) => {
  const { 
    activeSession, 
    currentParticipant, 
    startFocus, 
    endFocus, 
    leaveSession, 
    events,
    reportAbnormalActivity 
  } = useSession();
  const { user } = useAuth();
  const [isEnding, setIsEnding] = useState(false);
  const [lastInfractionNotice, setLastInfractionNotice] = useState<{
    time: string;
    label: string;
    details: string;
  } | null>(null);
  const [autoSleepNotice, setAutoSleepNotice] = useState<{
    time: string;
    details: string;
  } | null>(null);

  // Screen Wake Lock & Interaction Tracking
  const [wakeLockEnabled, setWakeLockEnabled] = useState(true);
  const [isWakeLockActive, setIsWakeLockActive] = useState(false);
  const wakeLockRef = useRef<any>(null);
  const hiddenStartRef = useRef<number | null>(null);
  const lastTouchRef = useRef<number>(Date.now());
  const wasAutoSleepRef = useRef<boolean>(false);

  const isFocusing = currentParticipant?.status === 'active';

  // Track user touch/keypress interactions to distinguish between intentional tab switch vs idle screen timeout
  useEffect(() => {
    const handleInteraction = () => {
      lastTouchRef.current = Date.now();
    };

    window.addEventListener('touchstart', handleInteraction, { passive: true });
    window.addEventListener('touchend', handleInteraction, { passive: true });
    window.addEventListener('pointerdown', handleInteraction, { passive: true });
    window.addEventListener('click', handleInteraction, { passive: true });
    window.addEventListener('keydown', handleInteraction, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('touchend', handleInteraction);
      window.removeEventListener('pointerdown', handleInteraction);
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, []);

  // Request & release Screen Wake Lock to prevent phone screen from going dark in 30 seconds
  const requestWakeLock = async () => {
    if ('wakeLock' in navigator && wakeLockEnabled) {
      try {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        setIsWakeLockActive(true);
        wakeLockRef.current.addEventListener?.('release', () => {
          setIsWakeLockActive(false);
        });
      } catch (err) {
        console.warn('Wake Lock request failed or was not allowed:', err);
        setIsWakeLockActive(false);
      }
    }
  };

  const releaseWakeLock = () => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release().catch(() => {});
      wakeLockRef.current = null;
      setIsWakeLockActive(false);
    }
  };

  useEffect(() => {
    if (isFocusing && wakeLockEnabled) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }

    return () => {
      releaseWakeLock();
    };
  }, [isFocusing, wakeLockEnabled]);

  // Automated Real-Time Browser-Level Focus & Tab Loss Detection
  useEffect(() => {
    if (!isFocusing) return;

    const handleVisibility = async () => {
      if (document.hidden) {
        hiddenStartRef.current = Date.now();
        const idleDuration = Date.now() - lastTouchRef.current;

        // If the user hasn't touched the screen for 15+ seconds before screen turned off,
        // it was the phone's automatic screen timeout / idle sleep, NOT an intentional tab switch!
        if (idleDuration >= 15000) {
          wasAutoSleepRef.current = true;
        } else {
          wasAutoSleepRef.current = false;
        }
      } else {
        if (hiddenStartRef.current) {
          const elapsedSec = Math.max(1, Math.round((Date.now() - hiddenStartRef.current) / 1000));
          hiddenStartRef.current = null;
          const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

          if (wasAutoSleepRef.current) {
            // Screen went to sleep naturally while idle on desk — DO NOT flag as abnormal activity!
            wasAutoSleepRef.current = false;
            setAutoSleepNotice({
              time: timeStr,
              details: `Screen auto-slept for ${elapsedSec}s while idle. Maintained active focus without distraction penalty.`
            });
            setTimeout(() => setAutoSleepNotice(null), 8000);
          } else {
            // Intentional tab switch, home screen button, or app switch
            await reportAbnormalActivity({
              eventType: 'tab_switched_background',
              details: `Switched tabs or opened another app for ${elapsedSec}s`,
              severity: 'medium',
              durationSeconds: elapsedSec,
            });

            setLastInfractionNotice({
              time: timeStr,
              label: 'Tab Switch / App Minimization',
              details: `You navigated away from the classroom screen for ${elapsedSec}s. Event logged to instructor.`
            });
          }
        }

        // Re-acquire wake lock on visibility restore
        if (isFocusing && wakeLockEnabled) {
          requestWakeLock();
        }
      }
    };

    const handleBlur = async () => {
      // On mobile touch devices, window blur fires during screen dimming, lock, or status bar pulls.
      // We only flag blur as an infraction on desktop windows where the user actively switched applications.
      const isTouchDevice = 'ontouchstart' in window || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
      const idleDuration = Date.now() - lastTouchRef.current;

      if (!document.hidden && !isTouchDevice && idleDuration < 10000) {
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        await reportAbnormalActivity({
          eventType: 'focus_lost_blur',
          details: 'Window lost focus (switched desktop window)',
          severity: 'low',
        });

        setLastInfractionNotice({
          time: timeStr,
          label: 'Window Focus Lost',
          details: `Screen focus lost at ${timeStr}. Noted on instructor audit timeline.`
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isFocusing, reportAbnormalActivity, wakeLockEnabled]);

  if (!activeSession) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-3xl border border-slate-200 p-8 text-center">
        <Clock className="w-12 h-12 mx-auto text-slate-300 mb-3" />
        <h2 className="text-xl font-bold text-slate-800">No Active Session Joined</h2>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          Join a classroom session with a session code or scan the teacher's QR code.
        </p>
        <button
          onClick={() => onNavigate('student-join')}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-sm hover:bg-indigo-700 transition-all"
        >
          Join Session Now
        </button>
      </div>
    );
  }

  const handleStart = async () => {
    await startFocus();
  };

  const handleEnd = async (elapsedSeconds: number) => {
    if (!currentParticipant) return;
    setIsEnding(true);

    const { score, summary } = calculateStudentEngagementScore(
      { ...currentParticipant, focusDurationSeconds: elapsedSeconds, status: 'completed' },
      activeSession.duration,
      events
    );

    await endFocus(elapsedSeconds, score);
    setIsEnding(false);
    onNavigate('student-report');
  };

  const handleLeave = async () => {
    await leaveSession();
    onNavigate('student-dashboard');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Session Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              You joined:
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              {activeSession.subject}
            </h1>
            <p className="text-sm font-semibold text-teal-700 mt-0.5">
              {activeSession.className}
            </p>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-2">
            <span className="text-xs text-slate-500">
              Session Code: <strong className="font-mono text-slate-900">{activeSession.sessionCode}</strong>
            </span>
            <div className="flex items-center gap-2">
              <Badge status={activeSession.status} label={`Session: ${activeSession.status.toUpperCase()}`} />
              <Badge status={currentParticipant?.status || 'joined'} label={`Participation: ${(currentParticipant?.status || 'joined').toUpperCase()}`} />
            </div>
          </div>
        </div>

        {/* Instructor & Context Info */}
        <div className="pt-4 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-slate-400" />
            <span>Teacher: <strong className="text-slate-900">{activeSession.teacherName}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>Lecture Duration: <strong className="text-slate-900">{activeSession.duration} mins</strong></span>
          </div>

          <button
            onClick={handleLeave}
            className="text-xs text-slate-400 hover:text-rose-600 font-medium transition-colors"
          >
            Leave Session
          </button>
        </div>
      </div>

      {/* Real-Time Distraction Warning Banner */}
      {lastInfractionNotice && (
        <div className="bg-rose-50 border border-rose-300 rounded-2xl p-4 text-xs text-rose-900 shadow-sm flex items-start justify-between gap-3 animate-fade-in">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-rose-950 uppercase tracking-wider text-[11px]">
                  {lastInfractionNotice.label}
                </span>
                <span className="font-mono text-[10px] bg-rose-200/80 text-rose-950 px-1.5 py-0.5 rounded font-bold">
                  {lastInfractionNotice.time}
                </span>
              </div>
              <p className="mt-1 text-rose-800/90 leading-relaxed font-medium">
                {lastInfractionNotice.details}
              </p>
            </div>
          </div>

          <button
            onClick={() => setLastInfractionNotice(null)}
            className="text-rose-400 hover:text-rose-700 p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Screen Auto-Sleep Confirmation (Zero Penalty) */}
      {autoSleepNotice && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 text-xs text-emerald-900 shadow-sm flex items-start justify-between gap-3 animate-fade-in">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-emerald-950 uppercase tracking-wider text-[11px]">
                  Idle Screen Auto-Sleep Detected
                </span>
                <span className="font-mono text-[10px] bg-emerald-200/80 text-emerald-950 px-1.5 py-0.5 rounded font-bold">
                  {autoSleepNotice.time}
                </span>
              </div>
              <p className="mt-1 text-emerald-800/90 leading-relaxed font-medium">
                {autoSleepNotice.details}
              </p>
            </div>
          </div>

          <button
            onClick={() => setAutoSleepNotice(null)}
            className="text-emerald-400 hover:text-emerald-700 p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Screen Keep-Awake Status & Control */}
      <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-3.5 px-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-indigo-900">
          <Sun className={`w-4 h-4 ${isWakeLockActive ? 'text-amber-500 animate-pulse' : 'text-indigo-400'}`} />
          <div>
            <span className="font-bold">Keep Mobile Screen Awake: </span>
            <span className="text-indigo-700 font-medium">
              {isWakeLockActive 
                ? 'Active (Phone will not turn off in 30s during focus)' 
                : wakeLockEnabled 
                  ? 'Ready (Activates when you start focus)' 
                  : 'Disabled'}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setWakeLockEnabled(!wakeLockEnabled)}
          className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all border ${
            wakeLockEnabled
              ? 'bg-indigo-600 text-white border-indigo-700 hover:bg-indigo-700'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          {wakeLockEnabled ? 'Keep Awake: ON' : 'Keep Awake: OFF'}
        </button>
      </div>

      {/* Main Focus Stopwatch Timer */}
      <FocusTimer
        isFocusing={isFocusing}
        initialSeconds={currentParticipant?.focusDurationSeconds || 0}
        onStartFocus={handleStart}
        onEndFocus={handleEnd}
        disabled={isEnding}
      />

      {/* Demo Mode Event Simulator */}
      <EventSimulator />
    </div>
  );
};

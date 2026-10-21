import React, { useState } from 'react';
import { 
  Smartphone, 
  BellRing, 
  MonitorSmartphone, 
  CheckCircle2, 
  AlertTriangle, 
  LogIn, 
  ShieldAlert,
  Layers,
  Clock
} from 'lucide-react';
import { useSession } from '../../contexts/SessionContext';

export const EventSimulator: React.FC = () => {
  const { reportAbnormalActivity, activeSession } = useSession();
  const [lastLogged, setLastLogged] = useState<{ label: string; time: string; severity: string } | null>(null);

  const handleSimulate = async (
    eventType: 'tab_switched_background' | 'focus_lost_blur' | 'unauthorized_login_attempt' | 'abnormal_phone_activity',
    label: string,
    details: string,
    severity: 'high' | 'medium' | 'low'
  ) => {
    try {
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      await reportAbnormalActivity({
        eventType,
        details,
        severity,
        isSimulated: true,
      });

      setLastLogged({ label, time: timeStr, severity });
      setTimeout(() => setLastLogged(null), 4500);
    } catch (e: any) {
      console.error(e);
    }
  };

  if (!activeSession) return null;

  return (
    <div className="bg-gradient-to-br from-amber-50 to-rose-50/40 border border-amber-200/90 rounded-2xl p-5 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            Abnormal Activity & Unauthorized Login Simulator
          </span>
        </div>
        <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded">
          Presentation / Demo Controls
        </span>
      </div>

      <p className="text-xs text-slate-600 mb-4 leading-relaxed">
        Test the teacher detection and timestamping engine during your college review. Clicking below will instantly record an infraction with the <strong>exact current timestamp</strong> and alert the teacher.
      </p>

      {/* Buttons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <button
          onClick={() => handleSimulate(
            'unauthorized_login_attempt',
            'Unauthorized Login Attempt',
            'Detected login to unauthorized external service (Instagram / Gaming portal)',
            'high'
          )}
          className="flex items-center justify-center gap-2 px-3.5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all hover:scale-[1.01]"
        >
          <LogIn className="w-4 h-4" />
          Simulate Unauthorized Login
        </button>

        <button
          onClick={() => handleSimulate(
            'tab_switched_background',
            'Tab Switched to Background',
            'Student switched away from classroom session to another tab',
            'medium'
          )}
          className="flex items-center justify-center gap-2 px-3.5 py-2.5 bg-white hover:bg-amber-100/60 text-slate-800 rounded-xl border border-amber-300 text-xs font-bold shadow-xs transition-all"
        >
          <Layers className="w-4 h-4 text-amber-600" />
          Simulate Tab Switch
        </button>

        <button
          onClick={() => handleSimulate(
            'abnormal_phone_activity',
            'Abnormal Phone Screen Usage',
            'Student unlocked device and maintained active phone usage during lecture',
            'medium'
          )}
          className="flex items-center justify-center gap-2 px-3.5 py-2.5 bg-white hover:bg-amber-100/60 text-slate-800 rounded-xl border border-amber-300 text-xs font-bold shadow-xs transition-all"
        >
          <Smartphone className="w-4 h-4 text-amber-600" />
          Simulate Phone Unlock
        </button>
      </div>

      {lastLogged && (
        <div className="mt-3.5 flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold bg-rose-100/80 border border-rose-200 text-rose-900 animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              Flagged <strong>{lastLogged.label}</strong> to Instructor.
            </span>
          </div>
          <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded shadow-xs text-slate-700">
            {lastLogged.time}
          </span>
        </div>
      )}
    </div>
  );
};

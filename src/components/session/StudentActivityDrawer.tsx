import React, { useState } from 'react';
import { 
  X, 
  Clock, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Smartphone, 
  LogIn, 
  Layers
} from 'lucide-react';
import { formatDuration } from '../../utils/formatters';
import { Badge } from '../common/Badge';
import type { Participant, SessionEvent } from '../../types';

interface StudentActivityDrawerProps {
  student: Participant | null;
  events: SessionEvent[];
  sessionDurationMinutes: number;
  onClose: () => void;
}

export const StudentActivityDrawer: React.FC<StudentActivityDrawerProps> = ({
  student,
  events,
  sessionDurationMinutes,
  onClose
}) => {
  const [filterType, setFilterType] = useState<'all' | 'abnormal'>('all');

  if (!student) return null;

  // Filter events belonging to this student
  const studentEvents = events
    .filter((e) => e.studentId === student.studentId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const abnormalEvents = studentEvents.filter((e) =>
    ['tab_switched_background', 'focus_lost_blur', 'unauthorized_login_attempt', 'abnormal_phone_activity'].includes(e.eventType) ||
    e.eventType.startsWith('simulated_')
  );

  const displayedEvents = filterType === 'abnormal' ? abnormalEvents : studentEvents;

  const getEventBadge = (event: SessionEvent) => {
    switch (event.eventType) {
      case 'unauthorized_login_attempt':
        return {
          icon: LogIn,
          color: 'bg-rose-100 text-rose-800 border-rose-200',
          dot: 'bg-rose-500',
          label: 'Unauthorized Login',
          severity: 'HIGH SEVERITY'
        };
      case 'tab_switched_background':
        return {
          icon: Layers,
          color: 'bg-amber-100 text-amber-800 border-amber-200',
          dot: 'bg-amber-500',
          label: 'Tab Switched / Backgrounded',
          severity: 'MEDIUM'
        };
      case 'focus_lost_blur':
        return {
          icon: AlertTriangle,
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          dot: 'bg-yellow-500',
          label: 'Focus Lost (Window Blur)',
          severity: 'LOW'
        };
      case 'abnormal_phone_activity':
      case 'simulated_phone_unlock':
        return {
          icon: Smartphone,
          color: 'bg-orange-100 text-orange-800 border-orange-200',
          dot: 'bg-orange-500',
          label: 'Abnormal Phone Usage',
          severity: 'MEDIUM'
        };
      case 'focus_started':
        return {
          icon: Clock,
          color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-500',
          label: 'Focus Started',
          severity: 'NORMAL'
        };
      case 'focus_ended':
        return {
          icon: CheckCircle2,
          color: 'bg-teal-100 text-teal-800 border-teal-200',
          dot: 'bg-teal-500',
          label: 'Focus Completed',
          severity: 'NORMAL'
        };
      default:
        return {
          icon: CheckCircle2,
          color: 'bg-slate-100 text-slate-800 border-slate-200',
          dot: 'bg-slate-400',
          label: event.eventType.replace(/_/g, ' ').toUpperCase(),
          severity: 'INFO'
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-slate-950/40 backdrop-blur-xs animate-fade-in">
      {/* Click outside backdrop */}
      <div className="flex-1" onClick={onClose} />

      {/* Slide-over Drawer */}
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 z-10 animate-slide-left">
        {/* Top Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-black text-sm uppercase shadow-sm">
              {student.studentName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-slate-900 text-lg">
                  {student.studentName}
                </h2>
                <Badge status={student.status} />
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                ID: {student.studentId}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="p-5 grid grid-cols-3 gap-3 bg-slate-50/50 border-b border-slate-100">
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Focus Time
            </span>
            <span className="text-base font-black text-teal-700 font-mono mt-0.5 block">
              {formatDuration(student.focusDurationSeconds)}
            </span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Engagement
            </span>
            <span className="text-base font-black text-slate-900 font-mono mt-0.5 block">
              {student.engagementScore || 80}/100
            </span>
          </div>

          <div className={`p-3 rounded-xl border shadow-xs ${
            (student.infractionCount || abnormalEvents.length) > 0
              ? 'bg-rose-50/70 border-rose-200 text-rose-900'
              : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">
              Abnormal Activity
            </span>
            <span className="text-base font-black font-mono mt-0.5 flex items-center gap-1">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              {student.infractionCount || abnormalEvents.length} flags
            </span>
          </div>
        </div>

        {/* Filter Toggle */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between text-xs">
          <span className="font-bold text-slate-700 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-teal-600" />
            Chronological Activity Log
          </span>

          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                filterType === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All ({studentEvents.length})
            </button>
            <button
              onClick={() => setFilterType('abnormal')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 ${
                filterType === 'abnormal'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rose-600 hover:text-rose-800'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              Abnormal ({abnormalEvents.length})
            </button>
          </div>
        </div>

        {/* Chronological Event Timeline */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {displayedEvents.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400 mb-2 opacity-80" />
              <p className="text-sm font-semibold text-slate-700">No abnormal activities detected</p>
              <p className="text-xs text-slate-400 mt-1">
                This student has sustained clean lecture focus throughout the session.
              </p>
            </div>
          ) : (
            displayedEvents.map((evt, idx) => {
              const meta = getEventBadge(evt);
              const EventIcon = meta.icon;
              const timeFormatted = new Date(evt.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              });

              return (
                <div 
                  key={evt.eventId || idx}
                  className="relative pl-6 pb-4 border-l-2 border-slate-200 last:border-l-transparent last:pb-0"
                >
                  {/* Timeline Dot */}
                  <span className={`absolute -left-[7px] top-1 w-3 h-3 rounded-full border-2 border-white shadow-xs ${meta.dot}`} />

                  {/* Event Card */}
                  <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs hover:border-slate-300 transition-all">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${meta.color}`}>
                        <EventIcon className="w-3 h-3 shrink-0" />
                        {meta.label}
                      </span>

                      {/* Exact Timestamp Badge */}
                      <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {timeFormatted}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 font-medium mt-1">
                      {evt.metadata?.details || evt.metadata?.label || meta.label}
                    </p>

                    {evt.metadata?.durationSeconds && (
                      <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded inline-flex font-semibold">
                        <Clock className="w-3 h-3" />
                        <span>Distraction duration: {evt.metadata.durationSeconds}s</span>
                      </div>
                    )}

                    {evt.metadata?.severity && (
                      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100 pt-1.5">
                        <span className="font-semibold uppercase tracking-wider">
                          Severity: <strong className={
                            evt.metadata.severity === 'high' ? 'text-rose-600' :
                            evt.metadata.severity === 'medium' ? 'text-amber-600' : 'text-blue-600'
                          }>{evt.metadata.severity.toUpperCase()}</strong>
                        </span>
                        {evt.isSimulated && (
                          <span className="italic text-slate-400">
                            Demonstration Telemetry
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Session Duration: {sessionDurationMinutes}m</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
          >
            Close Audit
          </button>
        </div>
      </div>
    </div>
  );
};

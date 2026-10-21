import React, { useState } from 'react';
import { useSession } from '../../contexts/SessionContext';
import { QRCodeDisplay } from '../../components/session/QRCodeDisplay';
import { ParticipantList } from '../../components/session/ParticipantList';
import { StudentActivityDrawer } from '../../components/session/StudentActivityDrawer';
import { Badge } from '../../components/common/Badge';
import { 
  Radio, 
  BarChart3, 
  Square, 
  Users, 
  Clock, 
  Sparkles, 
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  LogIn,
  Layers,
  Smartphone
} from 'lucide-react';

interface ActiveSessionViewProps {
  onNavigate: (route: string) => void;
}

export const ActiveSessionView: React.FC<ActiveSessionViewProps> = ({ onNavigate }) => {
  const { activeSession, participants, events, endSession } = useSession();
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const selectedStudent = selectedStudentId 
    ? participants.find((p) => p.studentId === selectedStudentId) || null 
    : null;

  const abnormalEvents = events.filter((e) =>
    ['tab_switched_background', 'focus_lost_blur', 'unauthorized_login_attempt', 'abnormal_phone_activity'].includes(e.eventType)
  ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (!activeSession) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto my-12">
        <Radio className="w-12 h-12 mx-auto text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-800">No Active Session Selected</h2>
        <p className="text-xs text-slate-500 mt-2 mb-6">
          Create a new classroom session or pick one from your dashboard.
        </p>
        <button
          onClick={() => onNavigate('teacher-create')}
          className="px-5 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold shadow-sm hover:bg-teal-700 transition-all cursor-pointer"
        >
          Create Session Now
        </button>
      </div>
    );
  }

  const handleEndSession = async () => {
    await endSession();
    setConfirmEnd(false);
    onNavigate('teacher-analytics');
  };

  return (
    <div className="space-y-6">
      {/* Top Session Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Session Status: {activeSession.status.toUpperCase()}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500 font-medium">
                Started {new Date(activeSession.startTime || activeSession.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {activeSession.subject}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 mt-2">
              <span>Class / Division: <strong className="text-slate-900">{activeSession.className}</strong></span>
              <span>•</span>
              <span>Instructor: <strong className="text-slate-900">{activeSession.teacherName}</strong></span>
              <span>•</span>
              <span>Duration: <strong className="text-slate-900">{activeSession.duration} minutes</strong></span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('teacher-analytics')}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4 text-teal-400" />
              Live Analytics
            </button>

            <button
              onClick={() => onNavigate('teacher-ai')}
              className="px-4 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              AI Insights
            </button>

            {!confirmEnd ? (
              <button
                onClick={() => setConfirmEnd(true)}
                className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-all flex items-center gap-1.5"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                End Session
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-rose-50 p-1.5 rounded-xl border border-rose-200">
                <span className="text-xs font-semibold text-rose-800 px-2">End now?</span>
                <button
                  onClick={handleEndSession}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  Yes, End
                </button>
                <button
                  onClick={() => setConfirmEnd(false)}
                  className="px-2 py-1.5 text-slate-500 hover:text-slate-800 text-xs font-medium"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Classroom Grid: QR Display (Left) + Real-Time Participants (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: QR & Session Code */}
        <div className="lg:col-span-5 space-y-4">
          <QRCodeDisplay
            sessionCode={activeSession.sessionCode}
            subject={activeSession.subject}
            className={activeSession.className}
          />

          {/* Real Classroom Connection Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-teal-600" />
                Live Student Devices
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] bg-emerald-50 font-bold text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Real-Time Sync Active
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                <div className="text-2xl font-black text-slate-900">{participants.length}</div>
                <div className="text-[11px] font-semibold text-slate-500">Connected Students</div>
              </div>
              <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100 text-center">
                <div className="text-2xl font-black text-teal-700">
                  {participants.filter(p => p.status === 'active').length}
                </div>
                <div className="text-[11px] font-semibold text-teal-700">In Focus Mode</div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Students can join using any smartphone on the classroom Wi-Fi or internet. When students join and start focusing, their devices sync here immediately.
            </p>
          </div>
        </div>

        {/* Right Column: Real-Time Participants Table & Live Abnormal Activity Feed */}
        <div className="lg:col-span-7 space-y-6">
          <ParticipantList
            participants={participants}
            onSelectStudent={(id) => setSelectedStudentId(id)}
          />

          {/* Real-Time Abnormal Activity & Phone/Login Detection Feed */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Live Classroom Telemetry & Infraction Audit
                </h3>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                {abnormalEvents.length} {abnormalEvents.length === 1 ? 'event' : 'events'} logged
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Real-time audit log tracking unauthorized logins, tab switching, and abnormal phone usage. Click on any student or event to inspect full chronology.
            </p>

            {abnormalEvents.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400 mb-1" />
                <span>All active students are currently in clean focus mode.</span>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto">
                {abnormalEvents.slice(0, 8).map((evt) => {
                  const isHigh = evt.eventType === 'unauthorized_login_attempt';
                  const timeFormatted = new Date(evt.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  });

                  return (
                    <div
                      key={evt.eventId}
                      onClick={() => setSelectedStudentId(evt.studentId)}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all hover:shadow-xs ${
                        isHigh
                          ? 'bg-rose-50/60 border-rose-200 hover:bg-rose-100/60'
                          : 'bg-amber-50/50 border-amber-200 hover:bg-amber-100/50'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isHigh ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'
                        }`}>
                          {isHigh ? <LogIn className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900 truncate">
                              {evt.studentName}
                            </span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                              isHigh ? 'bg-rose-200 text-rose-900' : 'bg-amber-200 text-amber-900'
                            }`}>
                              {isHigh ? 'Unauthorized Login' : 'Tab/App Switch'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 truncate mt-0.5">
                            {evt.metadata?.details || evt.metadata?.label || evt.eventType}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-mono font-bold text-slate-700 bg-white px-2 py-1 rounded border border-slate-200 shadow-xs block">
                          {timeFormatted}
                        </span>
                        <span className="text-[10px] text-teal-700 font-semibold hover:underline mt-0.5 block">
                          Audit History →
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Slide-over Student Detail Audit Drawer */}
      <StudentActivityDrawer
        student={selectedStudent}
        events={events}
        sessionDurationMinutes={activeSession.duration}
        onClose={() => setSelectedStudentId(null)}
      />
    </div>
  );
};

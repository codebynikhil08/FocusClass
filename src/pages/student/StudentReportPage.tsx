import React from 'react';
import { useSession } from '../../contexts/SessionContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Award, 
  Clock, 
  CheckCircle2, 
  Info, 
  ArrowLeft, 
  BookOpen, 
  User, 
  Download,
  Share2,
  ShieldCheck
} from 'lucide-react';
import { formatMinutesHuman } from '../../utils/formatters';

interface StudentReportPageProps {
  onNavigate: (route: string) => void;
}

export const StudentReportPage: React.FC<StudentReportPageProps> = ({ onNavigate }) => {
  const { activeSession, currentParticipant } = useSession();
  const { user } = useAuth();

  const subject = activeSession?.subject || 'Data Structures & Algorithms';
  const durationMins = activeSession?.duration || 50;
  const focusSec = currentParticipant?.focusDurationSeconds || 2580; // default ~43m for demo if zero
  const focusMins = Math.max(1, Math.round(focusSec / 60));
  const score = currentParticipant?.engagementScore || 84;
  const participationStatus = (currentParticipant?.status === 'completed' || currentParticipant?.status === 'active') ? 'Completed' : 'Completed';

  let summary = 'Good session participation and consistent attention maintained.';
  if (score >= 88) {
    summary = 'Outstanding session focus! You sustained deep focus for the vast majority of the classroom duration.';
  } else if (score < 65) {
    summary = 'Moderate focus session. Consider minimizing device glances during core concept discussions.';
  }

  return (
    <div className="max-w-2xl mx-auto my-6 space-y-6">
      <button
        onClick={() => onNavigate('student-dashboard')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
      </button>

      {/* Main Report Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm relative overflow-hidden">
        {/* Decorative Top Pill */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold uppercase tracking-wider mb-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
              Focus Session Completed
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              SESSION REPORT
            </h1>
            <p className="text-sm font-semibold text-teal-700 mt-0.5">
              {subject}
            </p>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-mono text-slate-400 block">
              Student: {user?.name || 'Rahul Verma'}
            </span>
            <span className="text-[11px] text-slate-400">
              {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Core Metric Rows */}
        <div className="py-6 space-y-5 border-b border-slate-100 text-sm">
          {/* Duration */}
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Lecture Duration:</span>
            <span className="font-bold text-slate-900 font-mono text-base">
              {durationMins} minutes
            </span>
          </div>

          {/* Participation */}
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Participation:</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {participationStatus}
            </span>
          </div>

          {/* Focus Session */}
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Focus Session:</span>
            <span className="font-bold text-teal-600 font-mono text-base">
              {focusMins} minutes
            </span>
          </div>

          {/* Prototype Engagement Indicator */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Prototype Engagement Indicator:
              </span>
              <span className="text-[11px] text-slate-400">
                Rule-based participation & focus metric
              </span>
            </div>
            <div className="text-right">
              <span className="text-2xl sm:text-3xl font-black text-teal-600 font-mono">
                {score}
              </span>
              <span className="text-sm font-semibold text-slate-400 font-mono">/100</span>
            </div>
          </div>

          {/* Session Summary */}
          <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-100">
            <span className="text-xs font-bold text-teal-900 uppercase tracking-wider block mb-1">
              Session Summary:
            </span>
            <p className="text-xs text-slate-700 leading-relaxed">
              {summary}
            </p>
          </div>
        </div>

        {/* Mandatory Transparency Note */}
        <div className="mt-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-amber-950 uppercase tracking-wider text-[11px]">
            <Info className="w-3.5 h-3.5 text-amber-600" />
            NOTE:
          </div>
          <p className="leading-relaxed">
            This indicator is a prototype metric and should not be interpreted as a scientific measurement of attention. It simply reflects voluntary focus stopwatch continuity.
          </p>
        </div>

        {/* Bottom Actions */}
        <div className="mt-8 flex items-center justify-between gap-3">
          <button
            onClick={() => onNavigate('student-dashboard')}
            className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-colors"
          >
            Done & Return to Hub
          </button>
        </div>
      </div>
    </div>
  );
};

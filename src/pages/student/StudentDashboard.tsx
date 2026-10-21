import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSession } from '../../contexts/SessionContext';
import { mockStore } from '../../firebase/mockStore';
import { 
  KeyRound, 
  Clock, 
  Award, 
  Radio, 
  ArrowRight, 
  BookOpen, 
  CheckCircle2, 
  ChevronRight,
  GraduationCap
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { formatTimeAgo } from '../../utils/formatters';

interface StudentDashboardProps {
  onNavigate: (route: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { activeSession, currentParticipant } = useSession();
  const joinedSessions = user ? mockStore.getStudentSessions(user.uid) : [];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Student Wellbeing Hub
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Welcome back, {user?.name || 'Student'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Participate in active lectures, track personal focus duration, and inspect digital engagement.
          </p>
        </div>

        <button
          onClick={() => onNavigate('student-join')}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02] shrink-0"
        >
          <KeyRound className="w-4 h-4" />
          Enter Session Code
        </button>
      </div>

      {/* Active Enrolled Session Card */}
      {activeSession && activeSession.status === 'active' && (
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-indigo-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                Live Classroom Session Joined
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-xs font-mono text-indigo-200">
                Code: {activeSession.sessionCode}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white">
              {activeSession.subject}
            </h2>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
              <span>Teacher: <strong className="text-white">{activeSession.teacherName}</strong></span>
              <span>•</span>
              <span>Class: <strong className="text-white">{activeSession.className}</strong></span>
              <span>•</span>
              <span>Your Status: <strong className="text-emerald-400 capitalize">{currentParticipant?.status || 'Joined'}</strong></span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('student-focus')}
            className="px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 shrink-0"
          >
            <Clock className="w-4 h-4" />
            Open Focus Screen
          </button>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Lectures Attended</span>
            <BookOpen className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono">
            {Math.max(1, joinedSessions.length)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Classroom sessions joined</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Focus Score</span>
            <Award className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-black text-indigo-600 font-mono">
            86<span className="text-lg text-slate-400 font-medium">/100</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Prototype engagement rating</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Privacy Rating</span>
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-3xl font-black text-teal-600 font-mono">
            100%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Zero cameras or microphone access</p>
        </div>
      </div>

      {/* Joined Lectures History */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Joined Sessions</h3>
            <p className="text-xs text-slate-500">Your lecture participation records</p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {joinedSessions.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <KeyRound className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-medium text-slate-600">No sessions joined yet</p>
              <button
                onClick={() => onNavigate('student-join')}
                className="mt-3 text-xs text-indigo-600 font-bold hover:underline"
              >
                Join a session with code
              </button>
            </div>
          ) : (
            joinedSessions.map((s) => (
              <div
                key={s.sessionId}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {s.sessionCode}
                    </span>
                    <Badge status={s.status} />
                  </div>
                  <h4 className="font-bold text-slate-900 text-base">{s.subject}</h4>
                  <p className="text-xs text-slate-500">
                    Instructor: <strong className="text-slate-700">{s.teacherName}</strong> • Class: <strong className="text-slate-700">{s.className}</strong> • Duration: <strong className="text-slate-700">{s.duration} mins</strong>
                  </p>
                </div>

                <button
                  onClick={() => onNavigate('student-report')}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1 self-end sm:self-center"
                >
                  <span>View Report</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSession } from '../../contexts/SessionContext';
import { getTeacherSessions } from '../../services/sessionService';
import { 
  PlusCircle, 
  Radio, 
  Users, 
  Award, 
  Clock, 
  ChevronRight, 
  BarChart2, 
  Layers, 
  Sparkles,
  BookOpen
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { formatTimeAgo } from '../../utils/formatters';
import type { ClassroomSession } from '../../types';

interface TeacherDashboardProps {
  onNavigate: (route: string) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { activeSession, setActiveSessionId } = useSession();
  const sessions = user ? getTeacherSessions(user.uid) : [];

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
            Instructor Portal
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Welcome, {user?.name || 'Professor'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitor real-time student presence, digital interaction patterns, and engagement telemetry.
          </p>
        </div>
        <button
          onClick={() => onNavigate('teacher-create')}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md shadow-teal-600/20 transition-all hover:scale-[1.02] shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Create Classroom Session
        </button>
      </div>

      {/* Active Session Spotlight Banner */}
      {activeSession && activeSession.status === 'active' && (
        <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-slate-900 text-white rounded-2xl p-6 border border-teal-500/30 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
                Live Active Lecture
              </span>
              <span className="text-slate-400">•</span>
              <span className="font-mono text-xs text-teal-200">
                Code: {activeSession.sessionCode}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {activeSession.subject}
            </h2>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <span>Class: <strong>{activeSession.className}</strong></span>
              <span>•</span>
              <span>Target: <strong>{activeSession.duration} mins</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('teacher-active')}
              className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-2"
            >
              <Radio className="w-4 h-4" />
              Open Live Classroom View
            </button>
            <button
              onClick={() => onNavigate('teacher-analytics')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all flex items-center gap-1.5"
            >
              <BarChart2 className="w-4 h-4" />
              Analytics
            </button>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Sessions</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono">
            {Math.max(1, sessions.length)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Classroom engagement runs</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Engagement Index</span>
            <Award className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-3xl font-black text-teal-600 font-mono">
            84<span className="text-lg text-slate-400 font-medium">/100</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Prototype heuristic metric</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">AI Insights Generated</span>
            <Sparkles className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-black text-indigo-600 font-mono">
            12
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Pedagogical recommendations</p>
        </div>
      </div>

      {/* Recent Sessions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Classroom Sessions</h3>
            <p className="text-xs text-slate-500">History of your created lectures</p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {sessions.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <BookOpen className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-medium text-slate-600">No sessions created yet</p>
              <button
                onClick={() => onNavigate('teacher-create')}
                className="mt-3 text-xs text-teal-600 font-bold hover:underline"
              >
                Create your first lecture session
              </button>
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.sessionId}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {session.sessionCode}
                    </span>
                    <Badge status={session.status} />
                  </div>
                  <h4 className="font-bold text-slate-900 text-base">
                    {session.subject}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Class: <span className="font-medium text-slate-700">{session.className}</span> • Duration: <span className="font-medium text-slate-700">{session.duration} mins</span> • Created {formatTimeAgo(session.createdAt)}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => {
                      setActiveSessionId(session.sessionId);
                      onNavigate(session.status === 'active' ? 'teacher-active' : 'teacher-analytics');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold transition-colors flex items-center gap-1"
                  >
                    <span>{session.status === 'active' ? 'Open Live Session' : 'View Analytics'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

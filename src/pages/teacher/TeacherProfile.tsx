import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSession } from '../../contexts/SessionContext';
import { getTeacherSessions } from '../../services/sessionService';
import { UserCheck, Mail, ShieldCheck, BookOpen, Layers, Award, Radio } from 'lucide-react';

interface TeacherProfileProps {
  onNavigate: (route: string) => void;
}

export const TeacherProfile: React.FC<TeacherProfileProps> = ({ onNavigate }) => {
  const { user, logout } = useAuth();
  const sessions = user ? getTeacherSessions(user.uid) : [];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6 pb-6 border-b border-slate-100">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white flex items-center justify-center font-bold text-2xl shadow-md">
            {user?.name?.charAt(0) || 'P'}
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold uppercase tracking-wider mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              Teacher / Instructor
            </div>
            <h1 className="text-2xl font-black text-slate-900">{user?.name || 'Instructor'}</h1>
            <p className="text-xs text-slate-500 flex items-center gap-2 mt-1">
              <Mail className="w-3.5 h-3.5" />
              {user?.email || 'teacher@focusclass.edu'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-6 border-b border-slate-100">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Created Sessions
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">{sessions.length}</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Privacy Standard
            </span>
            <div className="text-sm font-bold text-emerald-700 mt-1 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Compliant
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Engagement Metric
            </span>
            <div className="text-sm font-bold text-teal-700 mt-1 flex items-center gap-1">
              <Award className="w-4 h-4 text-teal-600" /> Prototype Rule-Based
            </div>
          </div>
        </div>

        <div className="pt-6 flex justify-end gap-3">
          <button
            onClick={() => onNavigate('teacher-dashboard')}
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

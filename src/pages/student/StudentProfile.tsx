import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSession } from '../../contexts/SessionContext';
import { mockStore } from '../../firebase/mockStore';
import { User, Mail, ShieldCheck, Award, BookOpen, Clock } from 'lucide-react';

interface StudentProfileProps {
  onNavigate: (route: string) => void;
}

export const StudentProfile: React.FC<StudentProfileProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const joinedSessions = user ? mockStore.getStudentSessions(user.uid) : [];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6 pb-6 border-b border-slate-100">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-500 text-white flex items-center justify-center font-bold text-2xl shadow-md">
            {user?.name?.charAt(0) || 'S'}
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-bold uppercase tracking-wider mb-2">
              <User className="w-3.5 h-3.5" />
              Student Profile
            </div>
            <h1 className="text-2xl font-black text-slate-900">{user?.name || 'Student'}</h1>
            <p className="text-xs text-slate-500 flex items-center gap-2 mt-1">
              <Mail className="w-3.5 h-3.5" />
              {user?.email || 'student@focusclass.edu'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-6 border-b border-slate-100">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Joined Lectures
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">{joinedSessions.length}</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Privacy Status
            </span>
            <div className="text-sm font-bold text-emerald-700 mt-1 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Protected
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Avg Attention Indicator
            </span>
            <div className="text-sm font-bold text-indigo-700 mt-1 flex items-center gap-1">
              <Award className="w-4 h-4 text-indigo-600" /> 86/100 (Prototype)
            </div>
          </div>
        </div>

        <div className="pt-6 flex justify-end">
          <button
            onClick={() => onNavigate('student-dashboard')}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            Go to Student Hub
          </button>
        </div>
      </div>
    </div>
  );
};

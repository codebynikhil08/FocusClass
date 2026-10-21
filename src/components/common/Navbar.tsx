import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSession } from '../../contexts/SessionContext';
import { 
  Compass, 
  LogOut, 
  User, 
  Sparkles, 
  GraduationCap, 
  BookOpen, 
  Layers
} from 'lucide-react';

interface NavbarProps {
  onNavigate?: (route: string) => void;
  currentRoute?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentRoute }) => {
  const { user, logout, quickLoginAsTeacher, quickLoginAsStudent } = useAuth();
  const { activeSession } = useSession();

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div 
          onClick={() => onNavigate && onNavigate(user ? (user.role === 'teacher' ? 'teacher-dashboard' : 'student-dashboard') : 'landing')}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
              FOCUS<span className="text-teal-600">CLASS</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-teal-100 text-teal-800">MVP</span>
            </span>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block -mt-1">
              Classroom Digital-Wellbeing & Engagement
            </p>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Active session quick link */}
              {activeSession && activeSession.status === 'active' && (
                <button
                  onClick={() => onNavigate && onNavigate(user.role === 'teacher' ? 'teacher-active' : 'student-focus')}
                  className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
                  Live Session: {activeSession.sessionCode}
                </button>
              )}

              {/* Role badge */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs">
                {user.role === 'teacher' ? (
                  <BookOpen className="w-3.5 h-3.5 text-teal-600" />
                ) : (
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                )}
                <span className="font-semibold text-slate-700 capitalize">{user.role}</span>
                <span className="text-slate-400">|</span>
                <span className="text-slate-900 font-medium truncate max-w-[120px]">{user.name}</span>
              </div>

              {/* Fast role switcher for college presentation */}
              <div className="hidden lg:flex items-center gap-1 text-xs">
                <button
                  onClick={async () => {
                    await (user.role === 'teacher' ? quickLoginAsStudent() : quickLoginAsTeacher());
                    if (onNavigate) {
                      onNavigate(user.role === 'teacher' ? 'student-dashboard' : 'teacher-dashboard');
                    }
                  }}
                  title="Quick toggle between Teacher and Student roles for live demonstration"
                  className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors flex items-center gap-1 font-medium"
                >
                  <Layers className="w-3 h-3 text-slate-500" />
                  Switch to {user.role === 'teacher' ? 'Student' : 'Teacher'}
                </button>
              </div>

              {/* Sign out */}
              <button
                onClick={async () => {
                  await logout();
                  if (onNavigate) onNavigate('landing');
                }}
                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate && onNavigate('login')}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Log In
              </button>
              <button
                onClick={() => onNavigate && onNavigate('register')}
                className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition-colors"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

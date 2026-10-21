import React from 'react';
import { 
  LayoutDashboard, 
  Layers, 
  Radio, 
  BarChart3, 
  Sparkles, 
  UserCheck, 
  PlusCircle 
} from 'lucide-react';
import { useSession } from '../../contexts/SessionContext';

interface SidebarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentRoute, onNavigate }) => {
  const { activeSession, participants } = useSession();

  const navItems = [
    { id: 'teacher-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'teacher-sessions', label: 'All Sessions', icon: Layers },
    { 
      id: 'teacher-active', 
      label: 'Active Classroom', 
      icon: Radio,
      badge: activeSession && activeSession.status === 'active' ? 'LIVE' : undefined,
      badgeColor: 'bg-emerald-500 text-white'
    },
    { id: 'teacher-analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'teacher-ai', label: 'Observations', icon: Sparkles },
    { id: 'teacher-profile', label: 'Teacher Profile', icon: UserCheck },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Quick Action */}
      <div className="p-4 border-b border-slate-100">
        <button
          onClick={() => onNavigate('teacher-create')}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-sm shadow-teal-600/20 transition-all hover:shadow-md"
        >
          <PlusCircle className="w-4 h-4" />
          Create New Session
        </button>
      </div>

      {/* Nav List */}
      <nav className="p-3 space-y-1 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentRoute === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-teal-50 text-teal-900 font-semibold' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Active Session Mini Card */}
      {activeSession && activeSession.status === 'active' && (
        <div className="p-4 m-3 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-teal-400">Current Session</span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
            </span>
          </div>
          <div>
            <div className="font-bold text-sm truncate">{activeSession.subject}</div>
            <div className="text-slate-300 text-[11px] truncate">{activeSession.className}</div>
          </div>
          <div className="pt-2 border-t border-slate-700 flex items-center justify-between text-slate-400">
            <span>Code: <strong className="text-white">{activeSession.sessionCode}</strong></span>
            <span>{participants.length} students</span>
          </div>
        </div>
      )}
    </aside>
  );
};

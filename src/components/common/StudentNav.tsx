import React from 'react';
import { 
  LayoutDashboard, 
  KeyRound, 
  Clock, 
  FileText, 
  UserCheck 
} from 'lucide-react';
import { useSession } from '../../contexts/SessionContext';

interface StudentNavProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
}

export const StudentNav: React.FC<StudentNavProps> = ({ currentRoute, onNavigate }) => {
  const { activeSession, currentParticipant } = useSession();

  const tabs = [
    { id: 'student-dashboard', label: 'My Hub', icon: LayoutDashboard },
    { id: 'student-join', label: 'Join Session', icon: KeyRound },
    { 
      id: 'student-focus', 
      label: 'Focus Mode', 
      icon: Clock,
      badge: currentParticipant?.status === 'active' ? 'FOCUSING' : (activeSession ? 'READY' : undefined),
      badgeColor: currentParticipant?.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-teal-100 text-teal-800'
    },
    { id: 'student-reports', label: 'Session Reports', icon: FileText },
    { id: 'student-profile', label: 'Profile', icon: UserCheck },
  ];

  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto py-2.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentRoute === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onNavigate(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  isActive 
                    ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/20' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : tab.badgeColor}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

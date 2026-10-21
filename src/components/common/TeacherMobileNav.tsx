import React from 'react';
import { 
  LayoutDashboard, 
  Radio, 
  PlusCircle, 
  BarChart3, 
  UserCheck 
} from 'lucide-react';
import { useSession } from '../../contexts/SessionContext';

interface TeacherMobileNavProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
}

export const TeacherMobileNav: React.FC<TeacherMobileNavProps> = ({ currentRoute, onNavigate }) => {
  const { activeSession } = useSession();

  const navItems = [
    { id: 'teacher-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { 
      id: 'teacher-active', 
      label: 'Live Class', 
      icon: Radio,
      isLive: activeSession && activeSession.status === 'active'
    },
    { id: 'teacher-create', label: 'New', icon: PlusCircle, isPrimary: true },
    { id: 'teacher-analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'teacher-profile', label: 'Profile', icon: UserCheck },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 shadow-lg">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentRoute === item.id;

          if (item.isPrimary) {
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="flex flex-col items-center justify-center -mt-5"
              >
                <div className="w-12 h-12 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-lg shadow-teal-600/30 active:scale-95 transition-transform">
                  <PlusCircle className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold text-teal-800 mt-1">New Class</span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative ${
                isActive 
                  ? 'text-teal-700 font-bold' 
                  : 'text-slate-500 hover:text-slate-900 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-teal-600' : ''}`} />
                {item.isLive && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                )}
              </div>
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

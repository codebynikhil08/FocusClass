import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SessionProvider, useSession } from './contexts/SessionContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { TeacherMobileNav } from './components/common/TeacherMobileNav';
import { StudentNav } from './components/common/StudentNav';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';
import { CreateSessionPage } from './pages/teacher/CreateSessionPage';
import { ActiveSessionView } from './pages/teacher/ActiveSessionView';
import { TeacherAnalyticsPage } from './pages/teacher/TeacherAnalyticsPage';
import { TeacherAIInsightsPage } from './pages/teacher/TeacherAIInsightsPage';
import { TeacherProfile } from './pages/teacher/TeacherProfile';

import { StudentDashboard } from './pages/student/StudentDashboard';
import { JoinSessionPage } from './pages/student/JoinSessionPage';
import { StudentFocusPage } from './pages/student/StudentFocusPage';
import { StudentReportPage } from './pages/student/StudentReportPage';
import { StudentProfile } from './pages/student/StudentProfile';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentRoute, setCurrentRoute] = useState<string>('landing');

  // Sync initial route based on URL query param (e.g. ?join=FC-XXXX) or user login status
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.has('join')) {
        setCurrentRoute('student-join');
        return;
      }
    }

    if (!loading) {
      if (user) {
        if (currentRoute === 'landing' || currentRoute === 'login' || currentRoute === 'register') {
          setCurrentRoute(user.role === 'teacher' ? 'teacher-dashboard' : 'student-dashboard');
        }
      } else {
        if (currentRoute.startsWith('teacher-') || (currentRoute.startsWith('student-') && currentRoute !== 'student-join')) {
          setCurrentRoute('landing');
        }
      }
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold uppercase tracking-wider">Loading FocusClass...</span>
        </div>
      </div>
    );
  }

  const renderCurrentPage = () => {
    switch (currentRoute) {
      // Public
      case 'landing':
        return <LandingPage onNavigate={setCurrentRoute} />;
      case 'login':
        return <LoginPage onNavigate={setCurrentRoute} />;
      case 'register':
        return <RegisterPage onNavigate={setCurrentRoute} />;

      // Teacher Flow
      case 'teacher-dashboard':
        return <TeacherDashboard onNavigate={setCurrentRoute} />;
      case 'teacher-create':
        return <CreateSessionPage onNavigate={setCurrentRoute} />;
      case 'teacher-active':
        return <ActiveSessionView onNavigate={setCurrentRoute} />;
      case 'teacher-sessions':
        return <TeacherDashboard onNavigate={setCurrentRoute} />;
      case 'teacher-analytics':
        return <TeacherAnalyticsPage onNavigate={setCurrentRoute} />;
      case 'teacher-ai':
        return <TeacherAIInsightsPage onNavigate={setCurrentRoute} />;
      case 'teacher-profile':
        return <TeacherProfile onNavigate={setCurrentRoute} />;

      // Student Flow
      case 'student-dashboard':
        return <StudentDashboard onNavigate={setCurrentRoute} />;
      case 'student-join':
        return <JoinSessionPage onNavigate={setCurrentRoute} />;
      case 'student-focus':
        return <StudentFocusPage onNavigate={setCurrentRoute} />;
      case 'student-report':
        return <StudentReportPage onNavigate={setCurrentRoute} />;
      case 'student-reports':
        return <StudentReportPage onNavigate={setCurrentRoute} />;
      case 'student-profile':
        return <StudentProfile onNavigate={setCurrentRoute} />;

      default:
        return <LandingPage onNavigate={setCurrentRoute} />;
    }
  };

  const isPublicPage = currentRoute === 'landing' || currentRoute === 'login' || currentRoute === 'register' || currentRoute === 'student-join';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-teal-500 selection:text-white pb-16 md:pb-0">
      {/* Top Navigation */}
      <Navbar onNavigate={setCurrentRoute} currentRoute={currentRoute} />

      {/* Main Container */}
      {isPublicPage ? (
        <main className="flex-1">
          {renderCurrentPage()}
        </main>
      ) : user?.role === 'teacher' ? (
        <>
          <div className="flex-1 flex max-w-7xl w-full mx-auto">
            {/* Desktop Teacher Sidebar */}
            <div className="hidden md:block">
              <Sidebar currentRoute={currentRoute} onNavigate={setCurrentRoute} />
            </div>
            {/* Main Area */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
              {renderCurrentPage()}
            </main>
          </div>
          {/* Mobile Teacher Bottom Navigation */}
          <TeacherMobileNav currentRoute={currentRoute} onNavigate={setCurrentRoute} />
        </>
      ) : (
        <div className="flex-1 flex flex-col">
          {/* Student Subnav */}
          <StudentNav currentRoute={currentRoute} onNavigate={setCurrentRoute} />
          {/* Main Student Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl w-full mx-auto min-w-0">
            {renderCurrentPage()}
          </main>
        </div>
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <SessionProvider>
        <AppContent />
      </SessionProvider>
    </AuthProvider>
  );
};

export default App;

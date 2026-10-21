import React from 'react';
import { 
  Compass, 
  ShieldCheck, 
  BarChart3, 
  Sparkles, 
  Users, 
  QrCode, 
  CheckCircle2, 
  ArrowRight,
  GraduationCap,
  BookOpen,
  Smartphone
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LandingPageProps {
  onNavigate: (route: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { quickLoginAsTeacher, quickLoginAsStudent } = useAuth();

  const handleDemoTeacher = async () => {
    await quickLoginAsTeacher();
    onNavigate('teacher-dashboard');
  };

  const handleDemoStudent = async () => {
    await quickLoginAsStudent();
    onNavigate('student-dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28 bg-gradient-to-b from-white via-slate-50 to-teal-50/30 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Privacy badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold mb-6 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Privacy-Conscious Digital Wellbeing Platform</span>
            <span className="text-teal-400">•</span>
            <span className="text-teal-700">Zero Surveillance</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight">
            Measure. Understand. Improve{' '}
            <span className="bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-800 bg-clip-text text-transparent">
              Classroom Engagement.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            A privacy-conscious platform designed to help students understand digital interaction patterns and help educators improve classroom engagement.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <button
              onClick={() => onNavigate('login')}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-base shadow-lg shadow-teal-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <GraduationCap className="w-5 h-5" />
              I'm a Student
            </button>
            <button
              onClick={() => onNavigate('login')}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-base shadow-lg shadow-slate-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <BookOpen className="w-5 h-5" />
              I'm a Teacher
            </button>
          </div>

          {/* Presentation Quick-Start Box */}
          <div className="mt-12 max-w-xl mx-auto p-4 rounded-2xl bg-white border border-amber-300 shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" /> College Project Guide Demo Mode
              </span>
              <span className="text-[11px] font-semibold text-slate-500">1-Click Sign-in</span>
            </div>
            <p className="text-xs text-slate-600 text-left mb-3">
              Instantly launch pre-configured accounts without registering:
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleDemoTeacher}
                className="px-3 py-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold text-xs border border-teal-200 transition-colors flex items-center justify-center gap-2"
              >
                <BookOpen className="w-4 h-4 text-teal-700" />
                Sign In as Teacher
              </button>
              <button
                onClick={handleDemoStudent}
                className="px-3 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-semibold text-xs border border-indigo-200 transition-colors flex items-center justify-center gap-2"
              >
                <GraduationCap className="w-4 h-4 text-indigo-700" />
                Sign In as Student
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS Section */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
            End-to-End Workflow
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 mt-2">
            HOW IT WORKS
          </h2>
          <p className="text-slate-600 text-sm mt-3">
            Connecting Student → Classroom Session → Digital Interaction → Analytics → Feedback
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {[
            {
              step: '1',
              title: 'Create Session',
              desc: 'Teacher generates a 6-character session code (FC-4821) and projector QR code.',
              icon: QrCode,
              color: 'text-teal-600 bg-teal-50 border-teal-200',
            },
            {
              step: '2',
              title: 'Students Join',
              desc: 'Students scan QR or enter code on mobile/laptop with zero install required.',
              icon: Users,
              color: 'text-blue-600 bg-blue-50 border-blue-200',
            },
            {
              step: '3',
              title: 'Focus Session',
              desc: 'Students activate focus mode; real-time presence syncs to educator dashboard.',
              icon: Smartphone,
              color: 'text-purple-600 bg-purple-50 border-purple-200',
            },
            {
              step: '4',
              title: 'Analyze',
              desc: 'Interactive Recharts timeline visualizes engagement levels & interaction trends.',
              icon: BarChart3,
              color: 'text-amber-600 bg-amber-50 border-amber-200',
            },
            {
              step: '5',
              title: 'Improve',
              desc: 'Rule-based heuristic AI provides transparent pedagogical recommendations.',
              icon: Sparkles,
              color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div 
                key={item.step}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs relative flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-base border mb-4 ${item.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Step {item.step}
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Privacy Pledge Banner */}
      <section className="bg-white border-y border-slate-200 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 text-white rounded-2xl p-8 sm:p-10 shadow-xl flex flex-col md:flex-row items-center gap-8">
            <div className="p-4 rounded-2xl bg-teal-500/20 text-teal-400 shrink-0">
              <ShieldCheck className="w-12 h-12" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                Ethical Architecture
              </span>
              <h3 className="text-2xl font-bold text-white mt-1">
                Privacy-Conscious by Design
              </h3>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                FocusClass rejects invasive student surveillance. No camera recording, no facial recognition, no microphone listening, and no screen capture. The platform measures voluntary session focus and digital wellbeing patterns respectfully.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 bg-slate-100 border-t border-slate-200 text-center text-xs text-slate-500">
        <p>FocusClass — Final Year Undergrad Project Prototype</p>
        <p className="mt-1">Built with React, TypeScript, Vite, Tailwind CSS, Recharts & Firebase</p>
      </footer>
    </div>
  );
};

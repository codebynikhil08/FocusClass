import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSession } from '../../contexts/SessionContext';
import { PlusCircle, ArrowLeft, BookOpen, Clock, Users, Sparkles, CheckCircle2 } from 'lucide-react';

interface CreateSessionPageProps {
  onNavigate: (route: string) => void;
}

export const CreateSessionPage: React.FC<CreateSessionPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { createSession } = useSession();

  const [subject, setSubject] = useState('Data Structures & Algorithms');
  const [className, setClassName] = useState('SE Computer A');
  const [duration, setDuration] = useState('50');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !className.trim()) {
      setError('Please provide subject and class/division.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const session = await createSession({
        subject,
        className,
        duration: Number(duration) || 50,
      });

      // Immediate redirect to active session view
      onNavigate('teacher-active');
    } catch (err: any) {
      setError(err.message || 'Failed to initialize session.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back button */}
      <button
        onClick={() => onNavigate('teacher-dashboard')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
      </button>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
            <PlusCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Create Classroom Session
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Generate a unique session code and live QR code for student check-in
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Subject */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Subject / Course Title *
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Data Structures & Algorithms"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              The subject being taught during this classroom block
            </p>
          </div>

          {/* Class / Division */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Class / Division *
            </label>
            <input
              type="text"
              required
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="e.g. SE Computer A"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Target class, batch, or division of students
            </p>
          </div>

          {/* Teacher Name (Readonly from auth) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Instructor Name
            </label>
            <input
              type="text"
              disabled
              value={user?.name || 'Prof. Anita Sharma'}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-sm cursor-not-allowed"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Lecture Duration (Minutes) *
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['30', '45', '50', '60'].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setDuration(mins)}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    duration === mins
                      ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {mins} mins
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md shadow-teal-600/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              <PlusCircle className="w-5 h-5" />
              {isSubmitting ? 'Initializing Session...' : 'Generate Session Code & Launch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

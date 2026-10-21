import React, { useState, useEffect } from 'react';
import { useSession } from '../../contexts/SessionContext';
import { useAuth } from '../../contexts/AuthContext';
import { KeyRound, ArrowRight, AlertCircle, User, Smartphone, ShieldCheck } from 'lucide-react';

interface JoinSessionPageProps {
  onNavigate: (route: string) => void;
}

export const JoinSessionPage: React.FC<JoinSessionPageProps> = ({ onNavigate }) => {
  const { joinSessionWithCode } = useSession();
  const { user, register } = useAuth();
  const [sessionCode, setSessionCode] = useState('');
  const [studentName, setStudentName] = useState(user?.name || '');
  const [rollNumber, setRollNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  // Auto-fill from URL if student scanned a QR code with `?join=FC-XXXX`
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const codeFromUrl = params.get('join');
      if (codeFromUrl) {
        setSessionCode(codeFromUrl.toUpperCase());
      }
    }
  }, []);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionCode.trim()) {
      setError('Please enter a session code.');
      return;
    }

    if (!user && !studentName.trim()) {
      setError('Please enter your full name to join the classroom.');
      return;
    }

    setIsJoining(true);
    setError(null);

    try {
      if (!user) {
        const cleanName = studentName.trim();
        const cleanRoll = rollNumber.trim();
        const displayName = cleanRoll ? `${cleanName} (${cleanRoll})` : cleanName;
        const autoEmail = `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'student'}_${Date.now()}@student.edu`;
        await register(displayName, autoEmail, 'student');
      }

      await joinSessionWithCode(sessionCode);
      onNavigate('student-focus');
    } catch (err: any) {
      setError(err.message || 'Could not join session. Verify code and try again.');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-6 sm:my-12 px-4">
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center mb-4 shadow-xs">
          <KeyRound className="w-7 h-7" />
        </div>

        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Join Classroom Session
        </h1>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          Connect your device to the active classroom focus session
        </p>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 text-left">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleJoin} className="space-y-4 text-left">
          {!user && (
            <>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-teal-600" />
                  Your Name:
                </label>
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full text-sm font-semibold px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all bg-slate-50 focus:bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-teal-600" />
                  Roll No / Student ID (Optional):
                </label>
                <input
                  type="text"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  placeholder="e.g. 42 or SE-08"
                  className="w-full text-sm font-semibold px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all bg-slate-50 focus:bg-white text-slate-900"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Enter 6-Character Session Code:
            </label>
            <input
              type="text"
              required
              maxLength={10}
              value={sessionCode}
              onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
              placeholder="FC-8921"
              className="w-full text-center text-2xl font-mono font-black tracking-widest px-4 py-3.5 rounded-2xl border-2 border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all uppercase bg-slate-50 focus:bg-white text-slate-900"
            />
          </div>

          <button
            type="submit"
            disabled={isJoining}
            className="w-full py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4 cursor-pointer"
          >
            {isJoining ? 'Connecting to Session...' : 'ENTER CLASSROOM'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-400 text-[11px]">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Real-time presence & privacy-conscious focus monitoring</span>
        </div>
      </div>
    </div>
  );
};

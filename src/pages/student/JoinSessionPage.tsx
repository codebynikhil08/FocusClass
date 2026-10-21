import React, { useState, useEffect } from 'react';
import { useSession } from '../../contexts/SessionContext';
import { KeyRound, ArrowRight, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

interface JoinSessionPageProps {
  onNavigate: (route: string) => void;
}

export const JoinSessionPage: React.FC<JoinSessionPageProps> = ({ onNavigate }) => {
  const { joinSessionWithCode } = useSession();
  const [sessionCode, setSessionCode] = useState('');
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

    setIsJoining(true);
    setError(null);

    try {
      await joinSessionWithCode(sessionCode);
      onNavigate('student-focus');
    } catch (err: any) {
      setError(err.message || 'Could not join session. Verify code and try again.');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-6 sm:my-12">
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mb-4">
          <KeyRound className="w-7 h-7" />
        </div>

        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Join Classroom Session
        </h1>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          Enter the 6-character session code shown on the classroom projector
        </p>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 text-left">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Enter Session Code:
            </label>
            <input
              type="text"
              required
              maxLength={10}
              value={sessionCode}
              onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
              placeholder="FC-4821"
              className="w-full text-center text-2xl font-mono font-black tracking-widest px-4 py-3.5 rounded-2xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all uppercase"
            />
          </div>

          <button
            type="submit"
            disabled={isJoining}
            className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isJoining ? 'Verifying & Joining...' : 'JOIN SESSION'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo fast-fill */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-left">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Sample Active Codes for Testing</span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSessionCode('FC-4821')}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 font-mono text-xs font-bold transition-colors border border-slate-200"
            >
              FC-4821 (Sample Lecture)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useSession } from '../../contexts/SessionContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Users, 
  Smartphone, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp,
  LogIn
} from 'lucide-react';

export const DemoBanner: React.FC = () => {
  const { activeSession, seedDemoStudents, simulateInteraction, reportAbnormalActivity, participants } = useSession();
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleSeedStudents = async () => {
    try {
      await seedDemoStudents();
      showFeedback('Simulated 5 demo students joined with realistic focus telemetry!');
    } catch (e: any) {
      showFeedback(e.message || 'Error injecting demo students');
    }
  };

  const handleSimulateUnlock = async () => {
    try {
      await simulateInteraction('simulated_phone_unlock');
      showFeedback('Simulated phone glance / unlock event registered.');
    } catch (e: any) {
      showFeedback(e.message || 'Error triggering interaction');
    }
  };

  const handleSimulateAppSwitch = async () => {
    try {
      await simulateInteraction('simulated_app_switch');
      showFeedback('Simulated app switch event registered.');
    } catch (e: any) {
      showFeedback(e.message || 'Error triggering interaction');
    }
  };

  const handleSimulateUnauthorizedLogin = async () => {
    try {
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      await reportAbnormalActivity({
        eventType: 'unauthorized_login_attempt',
        details: 'Simulated unauthorized login to external service during lecture',
        severity: 'high',
        isSimulated: true
      });
      showFeedback(`Flagged Unauthorized Login Attempt at ${timeStr}`);
    } catch (e: any) {
      showFeedback(e.message || 'Error triggering infraction');
    }
  };

  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-teal-500/10 border-b border-amber-200/80 px-4 py-2">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 text-xs">
        {/* Left Indicator */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-amber-500 text-white text-[10px]">
            <AlertTriangle className="w-3 h-3" /> Demo Mode
          </span>
          <span className="text-slate-700 font-medium">
            Presentation Controls for College Project Guide Review
          </span>
          <span className="hidden sm:inline text-slate-400">•</span>
          <span className="hidden sm:inline text-slate-500">
            Simulated data is clearly separated from real telemetry
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {feedbackMsg && (
            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-100/90 px-2 py-0.5 rounded text-[11px] animate-fade-in">
              <CheckCircle2 className="w-3 h-3" /> {feedbackMsg}
            </span>
          )}

          {activeSession && activeSession.status === 'active' && (
            <>
              <button
                onClick={handleSeedStudents}
                title="Populate session with 5 simulated student records (Rahul, Priya, Aman, etc.)"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white hover:bg-slate-50 text-slate-700 font-semibold border border-amber-300 shadow-sm transition-all hover:scale-[1.02]"
              >
                <Users className="w-3.5 h-3.5 text-amber-600" />
                Simulate 5 Student Joins
              </button>

              <button
                onClick={handleSimulateUnauthorizedLogin}
                title="Log an unauthorized login event with exact timestamp"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold border border-rose-300 shadow-sm transition-all hover:scale-[1.02]"
              >
                <LogIn className="w-3.5 h-3.5 text-rose-600" />
                Simulate Unauthorized Login
              </button>

              <button
                onClick={handleSimulateUnlock}
                title="Log a simulated phone glance event for analytics test"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white hover:bg-slate-50 text-slate-700 font-semibold border border-slate-300 shadow-sm transition-all"
              >
                <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
                Simulate Device Glance
              </button>
            </>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-slate-500 hover:text-slate-800"
            title="Toggle Demo Details"
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-amber-200/60 text-[11px] text-slate-600 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-white/70 p-2.5 rounded border border-amber-200">
            <strong className="text-slate-800 block mb-1">Active Session State:</strong>
            {activeSession ? (
              <span>Code: <strong>{activeSession.sessionCode}</strong> | {activeSession.subject} ({participants.length} participants)</span>
            ) : (
              <span className="text-slate-400">No active session selected. Create one as Teacher or enter code as Student.</span>
            )}
          </div>
          <div className="bg-white/70 p-2.5 rounded border border-amber-200">
            <strong className="text-slate-800 block mb-1">Privacy Guarantee:</strong>
            <span>Zero camera, screen-capture, or audio permissions required. Only session stopwatch events & clearly labeled demo interactions are stored.</span>
          </div>
          <div className="bg-white/70 p-2.5 rounded border border-amber-200 flex items-center justify-between">
            <div>
              <strong className="text-slate-800 block mb-1">Telemetry Generation:</strong>
              <span>Trigger mock interactions to test AI pedagogical insights.</span>
            </div>
            {activeSession && (
              <button
                onClick={handleSimulateAppSwitch}
                className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded font-medium text-[10px]"
              >
                + App Switch
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

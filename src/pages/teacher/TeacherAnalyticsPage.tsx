import React, { useMemo, useState } from 'react';
import { useSession } from '../../contexts/SessionContext';
import { calculateEngagementMetrics } from '../../services/analyticsService';
import { ScoreCard } from '../../components/analytics/ScoreCard';
import { EngagementChart } from '../../components/analytics/EngagementChart';
import { StudentActivityDrawer } from '../../components/session/StudentActivityDrawer';
import { 
  BarChart3, 
  ArrowLeft, 
  Sparkles, 
  Layers, 
  Info, 
  FileSpreadsheet, 
  Calendar,
  Clock,
  Radio,
  ShieldAlert,
  LogIn,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface TeacherAnalyticsPageProps {
  onNavigate: (route: string) => void;
}

export const TeacherAnalyticsPage: React.FC<TeacherAnalyticsPageProps> = ({ onNavigate }) => {
  const { activeSession, participants, events } = useSession();
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const selectedStudent = selectedStudentId
    ? participants.find((p) => p.studentId === selectedStudentId) || null
    : null;

  const abnormalEvents = events.filter((e) =>
    ['tab_switched_background', 'focus_lost_blur', 'unauthorized_login_attempt', 'abnormal_phone_activity'].includes(e.eventType) ||
    e.eventType.startsWith('simulated_')
  ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const analytics = useMemo(() => {
    if (!activeSession) return null;
    return calculateEngagementMetrics(activeSession, participants, events);
  }, [activeSession, participants, events]);

  if (!activeSession || !analytics) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto my-12">
        <BarChart3 className="w-12 h-12 mx-auto text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-800">No Session Selected for Analytics</h2>
        <p className="text-xs text-slate-500 mt-2 mb-6">
          Please select or create an active classroom session first.
        </p>
        <button
          onClick={() => onNavigate('teacher-dashboard')}
          className="px-5 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold shadow-sm hover:bg-teal-700 transition-all"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('teacher-active')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-800"
            >
              <Radio className="w-3.5 h-3.5" /> Back to Live Classroom
            </button>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Session Code: {activeSession.sessionCode}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Classroom Telemetry & Analytics
          </h1>
          <p className="text-xs text-slate-500">
            {activeSession.subject} • {activeSession.className} • Instructor: {activeSession.teacherName}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('teacher-ai')}
            className="px-4 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            AI Pedagogical Insights
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <ScoreCard
        score={analytics.averageEngagementScore}
        totalStudents={analytics.totalParticipants}
        activeStudents={analytics.activeParticipants}
        completedStudents={analytics.completedParticipants}
        durationMinutes={analytics.sessionDurationMinutes}
      />

      {/* Charts Section */}
      <EngagementChart data={analytics.engagementTimeline} />

      {/* Transparent Calculation Breakdown Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-5 h-5 text-teal-600" />
          <h3 className="font-bold text-slate-900 text-base">
            Transparent Rule-Based Calculation Breakdown
          </h3>
        </div>
        <p className="text-xs text-slate-600 mb-6 leading-relaxed">
          In alignment with our academic ethics and transparency guidelines, the composite <strong>Prototype Engagement Indicator ({analytics.averageEngagementScore}/100)</strong> is computed deterministically using standard classroom factors rather than opaque black-box estimates:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Factor 1: Participation
            </span>
            <div className="text-xl font-bold text-slate-800 font-mono">
              {analytics.calculationBreakdown.participationRatioScore} / 35 pts
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Ratio of students actively checking in to the classroom session.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Factor 2: Focus Duration
            </span>
            <div className="text-xl font-bold text-slate-800 font-mono">
              {analytics.calculationBreakdown.focusDurationScore} / 45 pts
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Accumulated student focus stopwatch minutes vs scheduled lecture duration.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Factor 3: Session Completion
            </span>
            <div className="text-xl font-bold text-slate-800 font-mono">
              {analytics.calculationBreakdown.completionRatioScore} / 20 pts
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Ratio of participants who formally concluded the session.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200">
            <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block mb-1">
              Factor 4: Distractions & Logins
            </span>
            <div className="text-xl font-bold text-rose-900 font-mono">
              -{analytics.calculationBreakdown.interactionDeduction} pts
            </div>
            <p className="text-[11px] text-rose-800/80 mt-1">
              Deductions for tab switches, unauthorized logins, and phone unlocks (capped at -15 pts).
            </p>
          </div>
        </div>
      </div>

      {/* Classroom Infraction & Activity Audit Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <h3 className="font-bold text-slate-900 text-base">
                Classroom Infraction & Activity Audit Trail
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Exact timestamped record of abnormal events detected during this lecture session. Click any row to inspect the student's full timeline.
            </p>
          </div>

          <span className="text-xs font-bold px-3 py-1 rounded-lg bg-slate-100 text-slate-700">
            {abnormalEvents.length} total infractions
          </span>
        </div>

        {abnormalEvents.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
            <p className="font-semibold text-slate-700 text-sm">Clean lecture session</p>
            <p className="text-slate-400 mt-0.5">No unauthorized logins or abnormal app switching occurred.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 overflow-hidden border border-slate-200 rounded-xl">
            {abnormalEvents.map((evt) => {
              const isHigh = evt.eventType === 'unauthorized_login_attempt';
              const timeFormatted = new Date(evt.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              });

              return (
                <div
                  key={evt.eventId}
                  onClick={() => setSelectedStudentId(evt.studentId)}
                  className="p-3.5 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      isHigh ? 'bg-rose-500' : 'bg-amber-500'
                    }`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 hover:text-teal-700">
                          {evt.studentName}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          isHigh ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {isHigh ? 'Unauthorized Login' : 'Tab Switch / Distraction'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {evt.metadata?.details || evt.metadata?.label || evt.eventType}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="text-right">
                      <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded block">
                        {timeFormatted}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-teal-600 hover:underline">
                      Audit →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Slide-over Student Detail Audit Drawer */}
      <StudentActivityDrawer
        student={selectedStudent}
        events={events}
        sessionDurationMinutes={activeSession.duration}
        onClose={() => setSelectedStudentId(null)}
      />
    </div>
  );
};

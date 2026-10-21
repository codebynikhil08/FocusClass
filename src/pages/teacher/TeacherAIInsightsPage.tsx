import React, { useEffect, useState, useMemo } from 'react';
import { useSession } from '../../contexts/SessionContext';
import { calculateEngagementMetrics } from '../../services/analyticsService';
import { generateSessionInsights, type AIInsightResponse } from '../../services/aiService';
import { InsightCard } from '../../components/analytics/InsightCard';
import { BarChart3, Lightbulb, Radio, RefreshCw, Cpu, Activity, CheckCircle2 } from 'lucide-react';

interface TeacherAIInsightsPageProps {
  onNavigate: (route: string) => void;
}

export const TeacherAIInsightsPage: React.FC<TeacherAIInsightsPageProps> = ({ onNavigate }) => {
  const { activeSession, participants, events } = useSession();
  const [insightResponse, setInsightResponse] = useState<AIInsightResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analytics = useMemo(() => {
    if (!activeSession) return null;
    return calculateEngagementMetrics(activeSession, participants, events);
  }, [activeSession, participants, events]);

  const loadInsights = async () => {
    if (!analytics || !activeSession) return;
    setIsAnalyzing(true);
    try {
      const res = await generateSessionInsights(analytics, activeSession.subject);
      setInsightResponse(res);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    loadInsights();
  }, [analytics, activeSession]);

  if (!activeSession) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center max-w-lg mx-auto my-12 shadow-sm">
        <Activity className="w-12 h-12 mx-auto text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-800">No Active Session for Analytics</h2>
        <p className="text-xs text-slate-500 mt-2 mb-6">
          Please select or create an active classroom session.
        </p>
        <button
          onClick={() => onNavigate('teacher-dashboard')}
          className="px-5 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold shadow-sm hover:bg-teal-700 transition-all cursor-pointer"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header - Light 3D Structured Card */}
      <div className="bg-gradient-to-br from-white via-teal-50/40 to-slate-50 border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold uppercase tracking-wider">
              <Activity className="w-3.5 h-3.5 text-teal-600" />
              <span>Pedagogical Engagement Engine</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Classroom Analytics & Observations
            </h1>

            <p className="text-xs text-slate-600 leading-relaxed">
              Real-time pedagogical feedback evaluating student focus intervals, attention span persistence, and distraction recovery for <strong className="text-slate-900">{activeSession.subject}</strong> ({activeSession.className}).
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2">
            <button
              onClick={loadInsights}
              disabled={isAnalyzing}
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
              Refresh Analytics
            </button>
            <span className="text-[11px] font-semibold text-slate-400">
              Analysis Engine: Heuristic v2.0
            </span>
          </div>
        </div>
      </div>

      {/* Real-Time Session Status Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-sm transition-all">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Connected Devices
          </span>
          <div className="text-2xl font-black text-slate-900">{participants.length}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Live student smartphones</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-sm transition-all">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Active Focus Rate
          </span>
          <div className="text-2xl font-black text-teal-600">
            {analytics?.averageEngagementScore || 0}%
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Classroom attention score</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-sm transition-all">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Activity Alerts
          </span>
          <div className="text-2xl font-black text-slate-700">
            {events.filter(e => ['tab_switched_background', 'focus_lost_blur', 'unauthorized_login_attempt'].includes(e.eventType)).length}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">App switches or tab blurs</span>
        </div>
      </div>

      {/* Generated Observations Cards */}
      <div className="space-y-4">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-teal-600" />
          <span>Pedagogical Observations & Recommendations</span>
        </h3>

        {!insightResponse || insightResponse.insights.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center text-slate-400 shadow-xs">
            <p className="text-sm font-semibold text-slate-700">No telemetry insights generated yet</p>
            <p className="text-xs text-slate-400 mt-1">
              As connected students focus and interact in the session, engagement patterns will appear here in real time.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insightResponse.insights.map((insight) => (
              <InsightCard
                key={insight.id}
                insight={insight}
                modelName={insightResponse.modelName}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

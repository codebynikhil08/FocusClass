import React, { useEffect, useState, useMemo } from 'react';
import { useSession } from '../../contexts/SessionContext';
import { calculateEngagementMetrics } from '../../services/analyticsService';
import { generateSessionInsights, type AIInsightResponse } from '../../services/aiService';
import { InsightCard } from '../../components/analytics/InsightCard';
import { Sparkles, BrainCircuit, Lightbulb, Radio, RefreshCw, Cpu } from 'lucide-react';

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
      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto my-12">
        <Sparkles className="w-12 h-12 mx-auto text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-800">No Active Session for AI Insights</h2>
        <p className="text-xs text-slate-500 mt-2 mb-6">
          Please select or create an active classroom session.
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
      {/* Top Header */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pedagogical Heuristic Engine</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Classroom AI Insights & Advice
            </h1>

            <p className="text-xs text-slate-300 leading-relaxed">
              Automated behavioral heuristic analysis evaluating lecture flow, student attention span dynamics, and digital distraction patterns for <strong className="text-white">{activeSession.subject}</strong>.
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2">
            <button
              onClick={loadInsights}
              disabled={isAnalyzing}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold transition-all flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
              Re-Analyze Session
            </button>
            <span className="text-[11px] text-indigo-300">
              Model: {insightResponse?.modelName || 'Heuristic v1.2'}
            </span>
          </div>
        </div>
      </div>

      {/* Modular Architecture Banner */}
      <div className="bg-white rounded-2xl border border-indigo-100 p-4 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Modular AI Architecture Layer
            </h4>
            <p className="text-xs text-slate-500">
              Running locally with rule-based pedagogical heuristics. Can be connected to OpenAI or Gemini API without altering business logic.
            </p>
          </div>
        </div>

        <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-md">
          Zero-Key Ready
        </span>
      </div>

      {/* Generated Insights Cards */}
      <div className="space-y-4">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-teal-600" />
          <span>Active Observations & Recommendations</span>
        </h3>

        {!insightResponse || insightResponse.insights.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
            <p className="text-sm font-medium text-slate-600">No telemetry insights available yet</p>
            <p className="text-xs text-slate-400 mt-1">
              Start student focus sessions or trigger simulated interactions to generate insights.
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

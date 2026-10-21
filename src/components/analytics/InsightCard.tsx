import React from 'react';
import { Sparkles, AlertCircle, CheckCircle2, Info, Lightbulb } from 'lucide-react';
import type { InsightItem } from '../../types';

interface InsightCardProps {
  insight: InsightItem;
  modelName?: string;
}

export const InsightCard: React.FC<InsightCardProps> = ({ insight, modelName }) => {
  const getStyles = () => {
    switch (insight.type) {
      case 'warning':
        return {
          border: 'border-amber-200',
          bg: 'bg-amber-50/40',
          badgeBg: 'bg-amber-100 text-amber-800',
          icon: AlertCircle,
          iconColor: 'text-amber-600',
          recBg: 'bg-amber-100/70 border-amber-200 text-amber-900',
        };
      case 'positive':
        return {
          border: 'border-emerald-200',
          bg: 'bg-emerald-50/30',
          badgeBg: 'bg-emerald-100 text-emerald-800',
          icon: CheckCircle2,
          iconColor: 'text-emerald-600',
          recBg: 'bg-emerald-100/60 border-emerald-200 text-emerald-900',
        };
      case 'info':
      default:
        return {
          border: 'border-indigo-200',
          bg: 'bg-indigo-50/30',
          badgeBg: 'bg-indigo-100 text-indigo-800',
          icon: Info,
          iconColor: 'text-indigo-600',
          recBg: 'bg-indigo-100/60 border-indigo-200 text-indigo-900',
        };
    }
  };

  const style = getStyles();
  const Icon = style.icon;

  return (
    <div className={`rounded-2xl border ${style.border} ${style.bg} p-5 shadow-xs transition-all hover:shadow-sm`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg bg-white shadow-xs ${style.iconColor}`}>
            <Icon className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-sm text-slate-900">
            {insight.title}
          </h4>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
          Prototype AI Insight
        </span>
      </div>

      {/* Observation */}
      <div className="text-xs text-slate-600 mb-3 leading-relaxed">
        <strong className="text-slate-800 font-semibold">Observation: </strong>
        {insight.observation}
      </div>

      {/* Recommendation Box */}
      <div className={`p-3 rounded-xl border ${style.recBg} text-xs flex items-start gap-2.5`}>
        <Lightbulb className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
        <div>
          <span className="font-bold block mb-0.5">Pedagogical Recommendation:</span>
          <span>{insight.recommendation}</span>
        </div>
      </div>
    </div>
  );
};

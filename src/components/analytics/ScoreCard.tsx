import React from 'react';
import { Award, Users, Flame, CheckCircle, Clock, Info } from 'lucide-react';

interface ScoreCardProps {
  score: number; // 0-100
  totalStudents: number;
  activeStudents: number;
  completedStudents: number;
  durationMinutes: number;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({
  score,
  totalStudents,
  activeStudents,
  completedStudents,
  durationMinutes,
}) => {
  const getScoreRating = (val: number) => {
    if (val >= 85) return { label: 'High Engagement', color: 'text-teal-600', ring: 'border-teal-500' };
    if (val >= 70) return { label: 'Balanced Attention', color: 'text-blue-600', ring: 'border-blue-500' };
    return { label: 'Focus Opportunity', color: 'text-amber-600', ring: 'border-amber-500' };
  };

  const rating = getScoreRating(score);

  return (
    <div className="space-y-4">
      {/* Top Main Banner Card: Engagement Indicator */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        {/* Background decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-teal-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
                Classroom Telemetry Metric
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Prototype Engagement Indicator
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-4xl sm:text-5xl font-black text-teal-400 font-mono">
                {score}
              </span>
              <span className="text-2xl text-slate-400 font-medium font-mono">/100</span>
              <span className="ml-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30">
                {rating.label}
              </span>
            </div>
          </div>

          {/* Mandatory Transparency Disclaimer Box */}
          <div className="max-w-md bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 text-xs text-slate-300">
            <div className="flex items-center gap-1.5 text-amber-300 font-semibold mb-1">
              <Info className="w-4 h-4 shrink-0" />
              <span>Scientific Transparency Note</span>
            </div>
            <p className="leading-relaxed text-[11px] text-slate-300">
              "This is a prototype metric and should not be interpreted as a scientific measurement of attention."
            </p>
            <p className="text-[10px] text-slate-400 mt-2">
              Derived transparently from: Student participation ratio (35%), sustained focus duration (45%), and lecture completion status (20%).
            </p>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Enrolled</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">{totalStudents}</div>
          <div className="text-[11px] text-slate-500 mt-1">Checked-in students</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Focus</span>
            <Flame className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 font-mono">{activeStudents}</div>
          <div className="text-[11px] text-emerald-700 mt-1">Currently in focus session</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Completed</span>
            <CheckCircle className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-blue-600 font-mono">{completedStudents}</div>
          <div className="text-[11px] text-blue-700 mt-1">Ended focus session</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Target Duration</span>
            <Clock className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-purple-700 font-mono">{durationMinutes}m</div>
          <div className="text-[11px] text-slate-500 mt-1">Scheduled lecture block</div>
        </div>
      </div>
    </div>
  );
};

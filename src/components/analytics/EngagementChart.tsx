import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from 'recharts';

interface TimelinePoint {
  timeMinute: number;
  timeLabel: string;
  engagementRate: number; // 0 - 100
  interactions: number;
  activeStudents: number;
}

interface EngagementChartProps {
  data: TimelinePoint[];
}

export const EngagementChart: React.FC<EngagementChartProps> = ({ data }) => {
  return (
    <div className="space-y-6">
      {/* Chart 1: Engagement Over Time */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              ENGAGEMENT OVER TIME
            </h3>
            <p className="text-xs text-slate-500">
              Relative engagement rate throughout lecture duration intervals (0m to 50m)
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 font-medium text-teal-700">
              <span className="w-3 h-3 rounded-sm bg-teal-500" />
              Engagement Rate (%)
            </span>
            <span className="flex items-center gap-1.5 font-medium text-slate-500">
              <span className="w-3 h-3 rounded-sm bg-indigo-500" />
              Active Students
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis 
                dataKey="timeLabel" 
                tick={{ fill: '#64748b', fontSize: 12 }} 
                stroke="#cbd5e1"
              />
              <YAxis 
                domain={[0, 100]} 
                tick={{ fill: '#64748b', fontSize: 12 }} 
                stroke="#cbd5e1"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="engagementRate"
                name="Engagement %"
                stroke="#0d9488"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorEngagement)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Digital Interaction Events Trend */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              INTERACTION & PHONE EVENT FREQUENCY
            </h3>
            <p className="text-xs text-slate-500">
              Aggregated simulated phone unlocks and screen switches per interval
            </p>
          </div>
          <span className="text-[11px] font-semibold bg-amber-100 text-amber-900 px-2.5 py-1 rounded-md">
            Demo / Simulated Interaction Feed
          </span>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="timeLabel" tick={{ fill: '#64748b', fontSize: 12 }} stroke="#cbd5e1" />
              <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 12 }} stroke="#cbd5e1" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  fontSize: '12px',
                }}
              />
              <Bar 
                dataKey="interactions" 
                name="Digital Interactions" 
                fill="#f59e0b" 
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

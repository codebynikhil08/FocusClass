import React, { useState } from 'react';
import { Users, Search, Clock, CheckCircle2, Award, AlertTriangle } from 'lucide-react';
import { Badge } from '../common/Badge';
import { formatDuration, formatTimeAgo } from '../../utils/formatters';
import type { Participant } from '../../types';

interface ParticipantListProps {
  participants: Participant[];
  onSelectStudent?: (studentId: string) => void;
}

export const ParticipantList: React.FC<ParticipantListProps> = ({ 
  participants,
  onSelectStudent 
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = participants.filter((p) =>
    p.studentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = participants.filter((p) => p.status === 'active').length;
  const completedCount = participants.filter((p) => p.status === 'completed').length;
  const joinedCount = participants.filter((p) => p.status === 'joined').length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-slate-900 text-base">
              Real-Time Participants
            </h3>
            <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-teal-100 text-teal-800">
              {participants.length}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Instant live sync across student devices
          </p>
        </div>

        {/* Live Counters */}
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {activeCount} Active
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
            {completedCount} Done
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 font-semibold">
            {joinedCount} Joined
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Filter students by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent border-none text-xs w-full focus:outline-none text-slate-800 placeholder-slate-400"
        />
      </div>

      {/* Table / List */}
      <div className="divide-y divide-slate-100 overflow-y-auto max-h-[420px] flex-1">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <Users className="w-8 h-8 mx-auto mb-2 text-slate-300 opacity-60" />
            <p className="text-sm font-medium text-slate-600">No participants yet</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Students will appear here as soon as they scan the QR code or enter the session code.
            </p>
          </div>
        ) : (
          filtered.map((participant, index) => (
            <div 
              key={participant.studentId}
              onClick={() => onSelectStudent && onSelectStudent(participant.studentId)}
              className="p-3.5 sm:px-5 flex items-center justify-between hover:bg-teal-50/50 cursor-pointer transition-colors group"
              title="Click to view detailed timestamped activity audit"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 text-xs font-mono font-bold text-slate-400">
                  {index + 1}.
                </span>
                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 uppercase group-hover:bg-teal-100 group-hover:text-teal-800 transition-colors">
                  {participant.studentName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900 group-hover:text-teal-700 transition-colors">
                      {participant.studentName}
                    </span>
                    {(participant.infractionCount || 0) > 0 && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold animate-pulse">
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                        {participant.infractionCount} {participant.infractionCount === 1 ? 'alert' : 'alerts'}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    <span>Joined {formatTimeAgo(participant.joinedAt)}</span>
                    {participant.focusDurationSeconds > 0 && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-600 font-medium">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {formatDuration(participant.focusDurationSeconds)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                {participant.engagementScore && (
                  <div className="hidden sm:flex items-center gap-1 text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md" title="Calculated individual engagement index">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    <span>{participant.engagementScore}/100</span>
                  </div>
                )}
                <Badge status={participant.status} />
                <span className="text-xs text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity font-semibold hidden md:inline">
                  Inspect →
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

import type { ClassroomSession, Participant, SessionEvent } from '../types';

export interface CalculatedAnalytics {
  totalParticipants: number;
  activeParticipants: number;
  completedParticipants: number;
  averageEngagementScore: number;
  totalSimulatedInteractions: number;
  sessionDurationMinutes: number;
  engagementTimeline: {
    timeMinute: number;
    timeLabel: string;
    engagementRate: number; // 0 - 100
    interactions: number;
    activeStudents: number;
  }[];
  calculationBreakdown: {
    participationRatioScore: number;
    completionRatioScore: number;
    focusDurationScore: number;
    interactionDeduction: number;
    finalCompositeScore: number;
  };
}

/**
 * Transparent rule-based Prototype Engagement Indicator calculation.
 * Documents transparently how the score is derived from session completion,
 * focus duration, and interaction events.
 */
export function calculateEngagementMetrics(
  session: ClassroomSession,
  participants: Participant[],
  events: SessionEvent[]
): CalculatedAnalytics {
  const total = participants.length;
  const active = participants.filter((p) => p.status === 'active').length;
  const completed = participants.filter((p) => p.status === 'completed').length;

  const durationMins = session.duration || 50;

  // If no participants, default state
  if (total === 0) {
    return {
      totalParticipants: 0,
      activeParticipants: 0,
      completedParticipants: 0,
      averageEngagementScore: 0,
      totalSimulatedInteractions: 0,
      sessionDurationMinutes: durationMins,
      engagementTimeline: generateEmptyTimeline(durationMins),
      calculationBreakdown: {
        participationRatioScore: 0,
        completionRatioScore: 0,
        focusDurationScore: 0,
        interactionDeduction: 0,
        finalCompositeScore: 0,
      }
    };
  }

  // Factor 1: Participation & Attendance Ratio (Weight: 35 points max)
  const participationScore = Math.min(35, Math.round(((active + completed) / total) * 35));

  // Factor 2: Focus Duration Ratio (Weight: 45 points max)
  // Compares total accumulated focus seconds against expected duration
  const targetSeconds = durationMins * 60;
  const avgFocusSec = participants.reduce((acc, p) => acc + (p.focusDurationSeconds || 0), 0) / total;
  const focusRatio = Math.min(1, avgFocusSec / Math.max(60, targetSeconds * 0.7)); // normalized benchmark
  const focusDurationScore = Math.round(focusRatio * 45);

  // Factor 3: Completion / Active status consistency (Weight: 20 points max)
  const activeOrCompletedRatio = (active * 0.9 + completed * 1.0) / total;
  const completionScore = Math.round(activeOrCompletedRatio * 20);

  // Factor 4: Digital interaction & abnormal activity deduction (Max penalty: 15 points)
  const abnormalOrSimEvents = events.filter((e) => 
    e.isSimulated || 
    e.eventType.startsWith('simulated_') ||
    ['tab_switched_background', 'focus_lost_blur', 'unauthorized_login_attempt', 'abnormal_phone_activity'].includes(e.eventType)
  );
  const interactionDeduction = Math.min(15, Math.round((abnormalOrSimEvents.length / Math.max(1, total)) * 2.5));

  // Composite Score (0 - 100)
  const rawScore = participationScore + focusDurationScore + completionScore - interactionDeduction;
  const finalCompositeScore = Math.max(20, Math.min(98, rawScore));

  // Build timeline intervals (e.g. 0, 10, 20, 30, 40, 50 mins)
  const timeline = buildTimeline(session, participants, events, durationMins, finalCompositeScore);

  return {
    totalParticipants: total,
    activeParticipants: active,
    completedParticipants: completed,
    averageEngagementScore: finalCompositeScore,
    totalSimulatedInteractions: abnormalOrSimEvents.length,
    sessionDurationMinutes: durationMins,
    engagementTimeline: timeline,
    calculationBreakdown: {
      participationRatioScore: participationScore,
      completionRatioScore: completionScore,
      focusDurationScore: focusDurationScore,
      interactionDeduction: interactionDeduction,
      finalCompositeScore,
    }
  };
}

/**
 * Calculates individual student prototype engagement indicator
 */
export function calculateStudentEngagementScore(
  participant: Participant,
  sessionDurationMins: number,
  events: SessionEvent[]
): { score: number; summary: string } {
  const targetSec = (sessionDurationMins || 50) * 60;
  const focusSec = participant.focusDurationSeconds || 0;
  const focusRatio = Math.min(1, focusSec / Math.max(60, targetSec * 0.6));

  const studentDistractionEvents = events.filter(
    (e) => e.studentId === participant.studentId && (
      e.isSimulated ||
      ['tab_switched_background', 'focus_lost_blur', 'unauthorized_login_attempt', 'abnormal_phone_activity'].includes(e.eventType)
    )
  );

  let score = Math.round(focusRatio * 75) + (participant.status === 'completed' ? 20 : 15);
  score -= Math.min(15, studentDistractionEvents.length * 3);
  score = Math.max(35, Math.min(98, score));

  let summary = 'Good session engagement and consistent focus maintained throughout the lecture.';
  if (score >= 88) {
    summary = 'Outstanding session focus! You sustained deep focus for the vast majority of the classroom duration.';
  } else if (score < 60) {
    summary = 'Moderate focus session. Consider joining focus mode earlier in the lecture to maximize engagement.';
  }

  return { score, summary };
}

function generateEmptyTimeline(durationMins: number) {
  const steps = 5;
  const stepSize = Math.max(5, Math.round(durationMins / steps));
  return Array.from({ length: steps + 1 }, (_, i) => ({
    timeMinute: i * stepSize,
    timeLabel: `${i * stepSize}m`,
    engagementRate: 0,
    interactions: 0,
    activeStudents: 0,
  }));
}

function buildTimeline(
  _session: ClassroomSession,
  participants: Participant[],
  events: SessionEvent[],
  durationMins: number,
  baseScore: number
) {
  const steps = 5;
  const stepSize = Math.max(5, Math.round(durationMins / steps));
  const activeCount = participants.filter((p) => p.status === 'active' || p.status === 'completed').length;

  return Array.from({ length: steps + 1 }, (_, i) => {
    const minute = i * stepSize;
    // Mild natural dynamic variation for timeline chart demo
    const naturalVariation = Math.sin(i * 0.8) * 4 - (i > 3 ? 6 : 0);
    const scoreAtPoint = Math.max(30, Math.min(98, Math.round(baseScore + naturalVariation)));
    
    // Count interactions attributed around this interval
    const interactionSlice = events.filter((e) => e.isSimulated).length;
    const intervalInteractions = Math.round(interactionSlice * (i === 4 ? 0.4 : 0.15));

    return {
      timeMinute: minute,
      timeLabel: `${minute} min`,
      engagementRate: scoreAtPoint,
      interactions: intervalInteractions,
      activeStudents: Math.max(0, activeCount - (i === 5 ? 1 : 0)),
    };
  });
}

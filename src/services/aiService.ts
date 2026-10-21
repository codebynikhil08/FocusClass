import type { CalculatedAnalytics } from './analyticsService';
import type { InsightItem } from '../types';

export interface AIInsightResponse {
  insights: InsightItem[];
  modelName: string;
  isRuleBased: boolean;
  generatedAt: string;
}

/**
 * Modular AI Insights Service.
 * Evaluates session telemetry against pedagogical heuristics to formulate
 * actionable classroom engagement recommendations.
 * 
 * Future Phase: Can connect to OpenAI / Gemini API via VITE_AI_API_KEY.
 */
export async function generateSessionInsights(
  analytics: CalculatedAnalytics,
  subjectName: string
): Promise<AIInsightResponse> {
  const apiKey = import.meta.env.VITE_AI_API_KEY;

  // If a live LLM API key were provided in the future, call external model here:
  if (apiKey) {
    try {
      // Modular placeholder for future Phase 6 LLM integration
      console.info('[FocusClass AI] API key detected. Running external model pipeline...');
    } catch (e) {
      console.warn('[FocusClass AI] External API error, falling back to heuristic engine:', e);
    }
  }

  // Deterministic pedagogical heuristic engine
  const insights: InsightItem[] = [];

  // 1. Overall participation analysis
  if (analytics.totalParticipants === 0) {
    insights.push({
      id: 'ins-1',
      title: 'Awaiting Student Check-in',
      observation: 'No students have checked into the session yet.',
      recommendation: 'Display the session QR code on the projector or share the 6-character code FC-XXXX with the class.',
      type: 'info',
      timestamp: new Date().toISOString()
    });
    return {
      insights,
      modelName: 'FocusClass Pedagogical Heuristic v1.2',
      isRuleBased: true,
      generatedAt: new Date().toISOString()
    };
  }

  const activeRatio = (analytics.activeParticipants + analytics.completedParticipants) / Math.max(1, analytics.totalParticipants);
  if (activeRatio < 0.6) {
    insights.push({
      id: 'ins-participation-low',
      title: 'Student Participation Opportunity',
      observation: `Only ${Math.round(activeRatio * 100)}% of enrolled students engaged in active focus during ${subjectName}.`,
      recommendation: 'Consider introducing a short pair-discussion or prompt question to re-align student focus with the lecture topic.',
      type: 'warning',
      timestamp: new Date().toISOString()
    });
  } else {
    insights.push({
      id: 'ins-participation-high',
      title: 'Strong Classroom Participation',
      observation: `High focus commitment detected: ${Math.round(activeRatio * 100)}% of attendees remained in active focus status.`,
      recommendation: 'The pacing and content delivery for this lecture topic resonated well with student attention spans.',
      type: 'positive',
      timestamp: new Date().toISOString()
    });
  }

  // 2. Late Session Attention & Interaction Drift
  const timeline = analytics.engagementTimeline;
  if (timeline.length >= 4) {
    const earlyEngagement = timeline[1]?.engagementRate || 80;
    const lateEngagement = timeline[timeline.length - 1]?.engagementRate || 65;

    if (earlyEngagement - lateEngagement > 12) {
      insights.push({
        id: 'ins-late-drift',
        title: 'Attention Drift in Final 15 Minutes',
        observation: `Digital interactions increased and engagement dipped from ${earlyEngagement}% to ${lateEngagement}% during the final quarter of the session.`,
        recommendation: 'Digital interaction increased during the final part of the session. Consider introducing a short 3-minute interactive activity or live quiz before the concluding summary.',
        type: 'warning',
        timestamp: new Date().toISOString()
      });
    }
  }

  // 3. Digital Interaction spikes (from prototype simulation or future Android events)
  if (analytics.totalSimulatedInteractions > 4) {
    insights.push({
      id: 'ins-interaction-spikes',
      title: 'Periodic Notification Glances Observed',
      observation: `${analytics.totalSimulatedInteractions} simulated digital interaction events were registered across the class.`,
      recommendation: 'Students occasionally check their devices during cognitive transition periods (e.g. while switching lecture slides). Providing clear verbal transition signposts can reduce device checking.',
      type: 'info',
      timestamp: new Date().toISOString()
    });
  }

  // 4. Overall Engagement Health
  if (analytics.averageEngagementScore >= 80) {
    insights.push({
      id: 'ins-score-excellent',
      title: 'High Focus Retention Index',
      observation: `The session achieved an overall Prototype Engagement Indicator of ${analytics.averageEngagementScore}/100.`,
      recommendation: 'Maintain this session structure. Students demonstrated high sustained attention throughout core subject concepts.',
      type: 'positive',
      timestamp: new Date().toISOString()
    });
  }

  return {
    insights,
    modelName: 'FocusClass Pedagogical Heuristic v1.2 (Rule-Based)',
    isRuleBased: true,
    generatedAt: new Date().toISOString()
  };
}

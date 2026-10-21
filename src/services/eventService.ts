import { 
  collection, 
  doc, 
  setDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config';
import { mockStore } from '../firebase/mockStore';
import type { SessionEvent, SessionEventType } from '../types';

export interface LogEventParams {
  sessionId: string;
  studentId: string;
  studentName: string;
  eventType: SessionEventType;
  isSimulated?: boolean;
  metadata?: Record<string, any>;
}

export async function logSessionEvent(params: LogEventParams): Promise<SessionEvent> {
  const eventId = 'evt-' + Math.random().toString(36).substring(2, 9);
  const event: SessionEvent = {
    eventId,
    sessionId: params.sessionId,
    studentId: params.studentId,
    studentName: params.studentName,
    eventType: params.eventType,
    timestamp: new Date().toISOString(),
    isSimulated: Boolean(params.isSimulated),
    metadata: params.metadata || {},
  };

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, `sessions/${params.sessionId}/events`, eventId), event);
    } catch (err) {
      console.warn('Firebase logSessionEvent error:', err);
    }
  }

  mockStore.addEvent(event);
  return event;
}

export function subscribeToEvents(
  sessionId: string,
  callback: (events: SessionEvent[]) => void
): () => void {
  if (isFirebaseConfigured && db) {
    const unsubFirebase = onSnapshot(collection(db, `sessions/${sessionId}/events`), (snap) => {
      const list = snap.docs.map(d => d.data() as SessionEvent);
      if (list.length > 0) {
        list.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        callback(list);
      } else {
        callback(mockStore.getEvents(sessionId));
      }
    });

    const unsubLocal = mockStore.subscribe(() => {
      callback(mockStore.getEvents(sessionId));
    });

    return () => {
      unsubFirebase();
      unsubLocal();
    };
  }

  const check = () => {
    callback(mockStore.getEvents(sessionId));
  };
  check();
  return mockStore.subscribe(check);
}

export function getSessionEvents(sessionId: string): SessionEvent[] {
  return mockStore.getEvents(sessionId);
}

export async function triggerSimulatedInteraction(
  sessionId: string, 
  studentId: string, 
  studentName: string,
  eventType: 'simulated_phone_unlock' | 'simulated_app_switch' | 'simulated_notification_glance' = 'simulated_phone_unlock'
): Promise<SessionEvent> {
  const labels = {
    simulated_phone_unlock: 'Simulated Phone Unlock (Demonstration Event)',
    simulated_app_switch: 'Simulated App Switch (Demonstration Event)',
    simulated_notification_glance: 'Simulated Notification Glance (Demonstration Event)',
  };

  return await logSessionEvent({
    sessionId,
    studentId,
    studentName,
    eventType,
    isSimulated: true,
    metadata: {
      label: labels[eventType],
      simulatedNotice: 'Prototype simulated digital interaction for college demonstration only'
    }
  });
}

export async function logAbnormalActivity(params: {
  sessionId: string;
  studentId: string;
  studentName: string;
  eventType: 'tab_switched_background' | 'focus_lost_blur' | 'unauthorized_login_attempt' | 'abnormal_phone_activity';
  details: string;
  severity?: 'high' | 'medium' | 'low';
  durationSeconds?: number;
  isSimulated?: boolean;
}): Promise<SessionEvent> {
  const event = await logSessionEvent({
    sessionId: params.sessionId,
    studentId: params.studentId,
    studentName: params.studentName,
    eventType: params.eventType,
    isSimulated: Boolean(params.isSimulated),
    metadata: {
      details: params.details,
      severity: params.severity || 'medium',
      durationSeconds: params.durationSeconds,
      exactTimeString: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    }
  });

  // Also update participant infraction count
  const participant = mockStore.getParticipant(params.sessionId, params.studentId);
  if (participant) {
    const current = participant.infractionCount || 0;
    mockStore.upsertParticipant({
      ...participant,
      infractionCount: current + 1,
      lastActiveAt: new Date().toISOString()
    });
  }

  return event;
}

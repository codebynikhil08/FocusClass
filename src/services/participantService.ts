import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config';
import { mockStore } from '../firebase/mockStore';
import { logSessionEvent } from './eventService';
import type { Participant, ParticipantStatus } from '../types';

export async function joinSession(sessionId: string, studentId: string, studentName: string): Promise<Participant> {
  const existing = mockStore.getParticipant(sessionId, studentId);
  if (existing && existing.status !== 'left') {
    return existing;
  }

  const participant: Participant = {
    studentId,
    studentName: studentName.trim(),
    sessionId,
    joinedAt: new Date().toISOString(),
    status: 'joined',
    focusDurationSeconds: 0,
    engagementScore: 75,
  };

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, `sessions/${sessionId}/participants`, studentId), participant);
    } catch (err) {
      console.warn('Firebase participant join error:', err);
    }
  }

  mockStore.upsertParticipant(participant);

  // Log join event
  await logSessionEvent({
    sessionId,
    studentId,
    studentName,
    eventType: 'session_joined',
    isSimulated: false,
  });

  return participant;
}

export async function startFocusSession(sessionId: string, studentId: string): Promise<void> {
  const participant = mockStore.getParticipant(sessionId, studentId);
  if (!participant) return;

  const updates: Partial<Participant> = {
    status: 'active',
    focusStartTime: new Date().toISOString(),
  };

  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, `sessions/${sessionId}/participants`, studentId), updates);
    } catch (err) {
      console.warn('Firebase startFocus error:', err);
    }
  }

  mockStore.upsertParticipant({ ...participant, ...updates });

  await logSessionEvent({
    sessionId,
    studentId,
    studentName: participant.studentName,
    eventType: 'focus_started',
    isSimulated: false,
  });
}

export async function endFocusSession(
  sessionId: string, 
  studentId: string, 
  durationSeconds: number,
  calculatedScore?: number
): Promise<void> {
  const participant = mockStore.getParticipant(sessionId, studentId);
  if (!participant) return;

  const updates: Partial<Participant> = {
    status: 'completed',
    focusEndTime: new Date().toISOString(),
    focusDurationSeconds: (participant.focusDurationSeconds || 0) + durationSeconds,
    engagementScore: calculatedScore ?? participant.engagementScore ?? 85,
  };

  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, `sessions/${sessionId}/participants`, studentId), updates);
    } catch (err) {
      console.warn('Firebase endFocus error:', err);
    }
  }

  mockStore.upsertParticipant({ ...participant, ...updates });

  await logSessionEvent({
    sessionId,
    studentId,
    studentName: participant.studentName,
    eventType: 'focus_ended',
    isSimulated: false,
    metadata: { focusDurationSeconds: durationSeconds }
  });
}

export async function leaveSession(sessionId: string, studentId: string): Promise<void> {
  const participant = mockStore.getParticipant(sessionId, studentId);
  if (!participant) return;

  const updates: Partial<Participant> = {
    status: 'left'
  };

  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, `sessions/${sessionId}/participants`, studentId), updates);
    } catch (err) {
      console.warn('Firebase leaveSession error:', err);
    }
  }

  mockStore.upsertParticipant({ ...participant, ...updates });

  await logSessionEvent({
    sessionId,
    studentId,
    studentName: participant.studentName,
    eventType: 'session_left',
    isSimulated: false,
  });
}

export function subscribeToParticipants(
  sessionId: string, 
  callback: (participants: Participant[]) => void
): () => void {
  if (isFirebaseConfigured && db) {
    const unsubFirebase = onSnapshot(collection(db, `sessions/${sessionId}/participants`), (snap) => {
      const list = snap.docs.map(d => d.data() as Participant);
      if (list.length > 0) {
        callback(list);
      } else {
        callback(mockStore.getParticipants(sessionId));
      }
    });

    const unsubLocal = mockStore.subscribe(() => {
      callback(mockStore.getParticipants(sessionId));
    });

    return () => {
      unsubFirebase();
      unsubLocal();
    };
  }

  const check = () => {
    callback(mockStore.getParticipants(sessionId));
  };
  check();
  return mockStore.subscribe(check);
}

export async function recordParticipantInfraction(
  sessionId: string,
  studentId: string
): Promise<void> {
  const participant = mockStore.getParticipant(sessionId, studentId);
  if (!participant) return;

  const currentInfractions = participant.infractionCount || 0;
  const updates: Partial<Participant> = {
    infractionCount: currentInfractions + 1,
    lastActiveAt: new Date().toISOString()
  };

  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, `sessions/${sessionId}/participants`, studentId), updates);
    } catch (err) {
      console.warn('Firebase recordParticipantInfraction error:', err);
    }
  }

  mockStore.upsertParticipant({ ...participant, ...updates });
}

export function getParticipantById(sessionId: string, studentId: string): Participant | null {
  return mockStore.getParticipant(sessionId, studentId);
}

/**
 * DEMO MODE HELPER:
 * Injects sample demo students (Rahul, Priya, Aman) into an active session
 * so you can present the complete live workflow without needing 3 physical devices.
 */
export async function seedDemoStudents(sessionId: string): Promise<void> {
  const demoStudents = [
    { 
      id: 'demo-std-1', 
      name: 'Rahul Sharma', 
      status: 'active' as ParticipantStatus, 
      focusSec: 1450, 
      score: 82,
      infractions: 2,
      recentEvents: [
        {
          type: 'tab_switched_background' as const,
          minsAgo: 15,
          label: 'Tab Switched / App Backgrounded',
          details: 'Student switched away from classroom session to another tab',
          severity: 'medium' as const,
          durationSec: 45
        },
        {
          type: 'unauthorized_login_attempt' as const,
          minsAgo: 5,
          label: 'Unauthorized External Login Detected',
          details: 'Detected login activity on unauthorized entertainment / social service',
          severity: 'high' as const,
        }
      ]
    },
    { 
      id: 'demo-std-2', 
      name: 'Priya Patel', 
      status: 'active' as ParticipantStatus, 
      focusSec: 1680, 
      score: 94,
      infractions: 0,
      recentEvents: []
    },
    { 
      id: 'demo-std-3', 
      name: 'Aman Verma', 
      status: 'completed' as ParticipantStatus, 
      focusSec: 2100, 
      score: 85,
      infractions: 1,
      recentEvents: [
        {
          type: 'abnormal_phone_activity' as const,
          minsAgo: 22,
          label: 'Abnormal Phone Unlock in Lecture',
          details: 'Rapid phone screen wake and continuous background usage during lecture',
          severity: 'medium' as const,
          durationSec: 60
        }
      ]
    },
    { 
      id: 'demo-std-4', 
      name: 'Sneha Kulkarni', 
      status: 'active' as ParticipantStatus, 
      focusSec: 1200, 
      score: 79,
      infractions: 3,
      recentEvents: [
        {
          type: 'focus_lost_blur' as const,
          minsAgo: 25,
          label: 'Window Focus Lost',
          details: 'Browser window lost active focus for 30 seconds',
          severity: 'low' as const,
          durationSec: 30
        },
        {
          type: 'unauthorized_login_attempt' as const,
          minsAgo: 12,
          label: 'Unauthorized External Portal Login',
          details: 'Student logged into external gaming platform during class',
          severity: 'high' as const,
        },
        {
          type: 'tab_switched_background' as const,
          minsAgo: 2,
          label: 'Tab Switched to Background',
          details: 'Student left classroom tab in background',
          severity: 'medium' as const,
          durationSec: 50
        }
      ]
    },
    { 
      id: 'demo-std-5', 
      name: 'Vikram Joshi', 
      status: 'joined' as ParticipantStatus, 
      focusSec: 300, 
      score: 70,
      infractions: 0,
      recentEvents: []
    },
  ];

  for (const s of demoStudents) {
    const participant: Participant = {
      studentId: s.id,
      studentName: s.name,
      sessionId,
      joinedAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
      focusStartTime: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      status: s.status,
      focusDurationSeconds: s.focusSec,
      engagementScore: s.score,
      infractionCount: s.infractions,
      lastActiveAt: new Date().toISOString()
    };

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, `sessions/${sessionId}/participants`, s.id), participant);
      } catch (e) {
        console.warn('Firebase demo participant seed error:', e);
      }
    }

    mockStore.upsertParticipant(participant);

    await logSessionEvent({
      sessionId,
      studentId: s.id,
      studentName: s.name,
      eventType: 'session_joined',
      isSimulated: true,
      metadata: { demoSeed: true }
    });

    if (s.status === 'active' || s.status === 'completed') {
      await logSessionEvent({
        sessionId,
        studentId: s.id,
        studentName: s.name,
        eventType: 'focus_started',
        isSimulated: true,
      });
    }

    // Seed specific recent abnormal events with past timestamps
    for (const evt of s.recentEvents) {
      const eventTime = new Date(Date.now() - 1000 * 60 * evt.minsAgo).toISOString();
      const eventId = 'evt-seed-' + Math.random().toString(36).substring(2, 8);
      const sessionEvent = {
        eventId,
        sessionId,
        studentId: s.id,
        studentName: s.name,
        eventType: evt.type,
        timestamp: eventTime,
        isSimulated: true,
        metadata: {
          label: evt.label,
          details: evt.details,
          severity: evt.severity,
          durationSeconds: evt.durationSec,
          exactTimeString: new Date(eventTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        }
      };

      if (isFirebaseConfigured && db) {
        try {
          await setDoc(doc(db, `sessions/${sessionId}/events`, eventId), sessionEvent);
        } catch (e) {
          console.warn('Firebase demo event seed error:', e);
        }
      }

      mockStore.addEvent(sessionEvent);
    }
  }
}

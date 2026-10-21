import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  updateDoc, 
  onSnapshot, 
  query, 
  where 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config';
import { mockStore } from '../firebase/mockStore';
import { generateSessionCode } from '../utils/codeGenerator';
import type { ClassroomSession, SessionStatus } from '../types';

export interface CreateSessionParams {
  teacherId: string;
  teacherName: string;
  subject: string;
  className: string;
  duration: number; // in minutes
}

export async function createSession(params: CreateSessionParams): Promise<ClassroomSession> {
  const sessionId = 'session-' + Math.random().toString(36).substring(2, 9);
  const sessionCode = generateSessionCode();

  const newSession: ClassroomSession = {
    sessionId,
    sessionCode,
    teacherId: params.teacherId,
    teacherName: params.teacherName,
    subject: params.subject.trim(),
    className: params.className.trim(),
    duration: Number(params.duration) || 50,
    status: 'active', // starts active immediately for prompt classroom use
    startTime: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'sessions', sessionId), newSession);
    } catch (err) {
      console.warn('Firebase setDoc failed, saving to local store:', err);
    }
  }

  mockStore.upsertSession(newSession);
  return newSession;
}

export async function getSessionById(sessionId: string): Promise<ClassroomSession | null> {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDoc(doc(db, 'sessions', sessionId));
      if (snap.exists()) {
        return snap.data() as ClassroomSession;
      }
    } catch (err) {
      console.warn('Firebase getDoc failed, reading from local store:', err);
    }
  }
  return mockStore.getSession(sessionId);
}

export async function getSessionByCode(code: string): Promise<ClassroomSession | null> {
  const cleanCode = code.trim().toUpperCase();
  
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, 'sessions'), where('sessionCode', '==', cleanCode));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs[0].data() as ClassroomSession;
      }
    } catch (err) {
      console.warn('Firebase query failed, checking local store:', err);
    }
  }

  return mockStore.getSessionByCode(cleanCode);
}

export async function updateSessionStatus(sessionId: string, status: SessionStatus): Promise<void> {
  const updates: Partial<ClassroomSession> = { status };
  if (status === 'completed' || status === 'cancelled') {
    updates.endTime = new Date().toISOString();
  }

  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, 'sessions', sessionId), updates);
    } catch (err) {
      console.warn('Firebase updateDoc failed:', err);
    }
  }

  const existing = mockStore.getSession(sessionId);
  if (existing) {
    mockStore.upsertSession({ ...existing, ...updates });
  }
}

export function subscribeToSession(sessionId: string, callback: (session: ClassroomSession | null) => void): () => void {
  if (isFirebaseConfigured && db) {
    const unsubFirebase = onSnapshot(doc(db, 'sessions', sessionId), (snap) => {
      if (snap.exists()) {
        callback(snap.data() as ClassroomSession);
      } else {
        callback(mockStore.getSession(sessionId));
      }
    });

    const unsubLocal = mockStore.subscribe(() => {
      callback(mockStore.getSession(sessionId));
    });

    return () => {
      unsubFirebase();
      unsubLocal();
    };
  }

  const check = () => {
    callback(mockStore.getSession(sessionId));
  };
  check();
  return mockStore.subscribe(check);
}

export function getTeacherSessions(teacherId: string): ClassroomSession[] {
  return mockStore.getAllSessionsForTeacher(teacherId);
}

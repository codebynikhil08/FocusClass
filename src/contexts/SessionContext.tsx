import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { 
  createSession as createSessionService, 
  getSessionById, 
  getSessionByCode, 
  updateSessionStatus, 
  subscribeToSession, 
  type CreateSessionParams 
} from '../services/sessionService';
import { 
  joinSession as joinSessionService, 
  startFocusSession, 
  endFocusSession, 
  leaveSession, 
  subscribeToParticipants, 
  seedDemoStudents as seedDemoStudentsService 
} from '../services/participantService';
import { 
  subscribeToEvents, 
  triggerSimulatedInteraction,
  logAbnormalActivity
} from '../services/eventService';
import { useAuth } from './AuthContext';
import type { ClassroomSession, Participant, SessionEvent } from '../types';

interface SessionContextType {
  activeSession: ClassroomSession | null;
  participants: Participant[];
  events: SessionEvent[];
  currentParticipant: Participant | null;
  loadingSession: boolean;
  setActiveSessionId: (sessionId: string | null) => void;
  createSession: (params: Omit<CreateSessionParams, 'teacherId' | 'teacherName'>) => Promise<ClassroomSession>;
  joinSessionWithCode: (code: string) => Promise<ClassroomSession>;
  startFocus: () => Promise<void>;
  endFocus: (focusSeconds: number, score?: number) => Promise<void>;
  leaveSession: () => Promise<void>;
  endSession: () => Promise<void>;
  simulateInteraction: (type?: 'simulated_phone_unlock' | 'simulated_app_switch' | 'simulated_notification_glance') => Promise<void>;
  seedDemoStudents: () => Promise<void>;
  reportAbnormalActivity: (params: {
    eventType: 'tab_switched_background' | 'focus_lost_blur' | 'unauthorized_login_attempt' | 'abnormal_phone_activity';
    details: string;
    severity?: 'high' | 'medium' | 'low';
    durationSeconds?: number;
    isSimulated?: boolean;
  }) => Promise<SessionEvent | undefined>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [activeSessionId, setActiveSessionIdState] = useState<string | null>(() => {
    return localStorage.getItem('focusclass_active_session_id');
  });
  const [activeSession, setActiveSession] = useState<ClassroomSession | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [events, setEvents] = useState<SessionEvent[]>([]);
  const [loadingSession, setLoadingSession] = useState<boolean>(false);

  const setActiveSessionId = useCallback((id: string | null) => {
    setActiveSessionIdState(id);
    if (id) {
      localStorage.setItem('focusclass_active_session_id', id);
    } else {
      localStorage.removeItem('focusclass_active_session_id');
      setActiveSession(null);
      setParticipants([]);
      setEvents([]);
    }
  }, []);

  // Subscribe to active session details
  useEffect(() => {
    if (!activeSessionId) {
      setActiveSession(null);
      return;
    }

    setLoadingSession(true);
    const unsubSession = subscribeToSession(activeSessionId, (session) => {
      setActiveSession(session);
      setLoadingSession(false);
    });

    const unsubParticipants = subscribeToParticipants(activeSessionId, (list) => {
      setParticipants(list);
    });

    const unsubEvents = subscribeToEvents(activeSessionId, (evtList) => {
      setEvents(evtList);
    });

    return () => {
      unsubSession();
      unsubParticipants();
      unsubEvents();
    };
  }, [activeSessionId]);

  // Current user's participant record if they are a student
  const currentParticipant = user && user.role === 'student' && activeSessionId
    ? participants.find((p) => p.studentId === user.uid) || null
    : null;

  const createSession = async (params: Omit<CreateSessionParams, 'teacherId' | 'teacherName'>) => {
    if (!user) throw new Error('Must be logged in to create a session');
    const session = await createSessionService({
      ...params,
      teacherId: user.uid,
      teacherName: user.name,
    });
    setActiveSessionId(session.sessionId);
    return session;
  };

  const joinSessionWithCode = async (code: string) => {
    if (!user) throw new Error('Must be logged in to join a session');
    const cleanCode = code.trim().toUpperCase();
    const session = await getSessionByCode(cleanCode);
    if (!session) {
      throw new Error(`Invalid session code "${cleanCode}". Please verify the code on the screen.`);
    }
    if (session.status === 'completed' || session.status === 'cancelled') {
      throw new Error(`Session ${cleanCode} has already ended.`);
    }

    await joinSessionService(session.sessionId, user.uid, user.name);
    setActiveSessionId(session.sessionId);
    return session;
  };

  const startFocus = async () => {
    if (!activeSessionId || !user) return;
    await startFocusSession(activeSessionId, user.uid);
  };

  const endFocus = async (focusSeconds: number, score?: number) => {
    if (!activeSessionId || !user) return;
    await endFocusSession(activeSessionId, user.uid, focusSeconds, score);
  };

  const leaveCurrentSession = async () => {
    if (!activeSessionId || !user) return;
    await leaveSession(activeSessionId, user.uid);
    setActiveSessionId(null);
  };

  const endSession = async () => {
    if (!activeSessionId) return;
    await updateSessionStatus(activeSessionId, 'completed');
  };

  const simulateInteraction = async (type?: 'simulated_phone_unlock' | 'simulated_app_switch' | 'simulated_notification_glance') => {
    if (!activeSessionId || !user) return;
    await triggerSimulatedInteraction(activeSessionId, user.uid, user.name, type);
  };

  const seedDemoStudents = async () => {
    if (!activeSessionId) return;
    await seedDemoStudentsService(activeSessionId);
  };

  const reportAbnormalActivity = async (params: {
    eventType: 'tab_switched_background' | 'focus_lost_blur' | 'unauthorized_login_attempt' | 'abnormal_phone_activity';
    details: string;
    severity?: 'high' | 'medium' | 'low';
    durationSeconds?: number;
    isSimulated?: boolean;
  }) => {
    if (!activeSessionId || !user) return undefined;
    return await logAbnormalActivity({
      sessionId: activeSessionId,
      studentId: user.uid,
      studentName: user.name,
      ...params,
    });
  };

  return (
    <SessionContext.Provider
      value={{
        activeSession,
        participants,
        events,
        currentParticipant,
        loadingSession,
        setActiveSessionId,
        createSession,
        joinSessionWithCode,
        startFocus,
        endFocus,
        leaveSession: leaveCurrentSession,
        endSession,
        simulateInteraction,
        seedDemoStudents,
        reportAbnormalActivity,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export function useSession(): SessionContextType {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}

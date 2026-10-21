import type { ClassroomSession, Participant, SessionEvent, SessionReport, UserProfile } from '../types';

interface StoreSchema {
  users: Record<string, UserProfile>;
  sessions: Record<string, ClassroomSession>;
  participants: Record<string, Participant>; // key: `${sessionId}_${studentId}`
  events: SessionEvent[];
  reports: Record<string, SessionReport>;
}

const STORAGE_KEY = 'focusclass_local_store_v1';
const BROADCAST_NAME = 'focusclass_sync_channel';

// Default initial seed data for immediate demonstration
const initialData: StoreSchema = {
  users: {
    'teacher-1': {
      uid: 'teacher-1',
      name: 'Prof. Anita Sharma',
      email: 'teacher@focusclass.edu',
      role: 'teacher',
      createdAt: new Date().toISOString(),
    },
    'student-1': {
      uid: 'student-1',
      name: 'Rahul Verma',
      email: 'rahul@student.edu',
      role: 'student',
      createdAt: new Date().toISOString(),
    },
    'student-2': {
      uid: 'student-2',
      name: 'Priya Patel',
      email: 'priya@student.edu',
      role: 'student',
      createdAt: new Date().toISOString(),
    },
    'student-3': {
      uid: 'student-3',
      name: 'Aman Khan',
      email: 'aman@student.edu',
      role: 'student',
      createdAt: new Date().toISOString(),
    }
  },
  sessions: {
    'fc-sample-1': {
      sessionId: 'fc-sample-1',
      sessionCode: 'FC-4821',
      teacherId: 'teacher-1',
      teacherName: 'Prof. Anita Sharma',
      subject: 'Data Structures & Algorithms',
      className: 'SE Computer A',
      duration: 50,
      status: 'active',
      startTime: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }
  },
  participants: {
    'fc-sample-1_student-1': {
      studentId: 'student-1',
      studentName: 'Rahul Verma',
      sessionId: 'fc-sample-1',
      joinedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      focusStartTime: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      status: 'active',
      focusDurationSeconds: 720,
      engagementScore: 88,
    }
  },
  events: [
    {
      eventId: 'evt-1',
      sessionId: 'fc-sample-1',
      studentId: 'student-1',
      studentName: 'Rahul Verma',
      eventType: 'session_joined',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      isSimulated: false,
    },
    {
      eventId: 'evt-2',
      sessionId: 'fc-sample-1',
      studentId: 'student-1',
      studentName: 'Rahul Verma',
      eventType: 'focus_started',
      timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      isSimulated: false,
    },
    {
      eventId: 'evt-3',
      sessionId: 'fc-sample-1',
      studentId: 'student-1',
      studentName: 'Rahul Verma',
      eventType: 'simulated_phone_unlock',
      timestamp: new Date(Date.now() - 1000 * 60 * 6).toISOString(),
      isSimulated: true,
      metadata: { trigger: 'Quick notification check' }
    }
  ],
  reports: {}
};

class LocalReactiveStore {
  private data: StoreSchema;
  private channel: BroadcastChannel | null = null;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.data = this.loadFromStorage();
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel(BROADCAST_NAME);
      this.channel.onmessage = () => {
        this.data = this.loadFromStorage();
        this.notifyListeners();
      };
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY) {
          this.data = this.loadFromStorage();
          this.notifyListeners();
        }
      });

      // Synchronize across devices (e.g. Android phone + Laptop) on the local Wi-Fi
      fetch('/api/store')
        .then((r) => r.json())
        .then((json) => {
          if (json.data) {
            this.data = json.data;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
            this.notifyListeners();
          } else {
            fetch('/api/store', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ data: this.data })
            }).catch(() => {});
          }
        })
        .catch(() => {});

      // Periodic fast poll so mobile actions reflect immediately on laptop
      setInterval(async () => {
        try {
          const r = await fetch('/api/store');
          const json = await r.json();
          if (json.data && JSON.stringify(json.data) !== JSON.stringify(this.data)) {
            this.data = json.data;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
            this.notifyListeners();
          }
        } catch (e) {}
      }, 1200);
    }
  }

  private loadFromStorage(): StoreSchema {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load local store:', e);
    }
    this.saveToStorage(initialData);
    return initialData;
  }

  private saveToStorage(data: StoreSchema) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      if (this.channel) {
        this.channel.postMessage({ type: 'DATA_UPDATED', timestamp: Date.now() });
      }
      if (typeof window !== 'undefined') {
        fetch('/api/store', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data })
        }).catch(() => {});
      }
      this.notifyListeners();
    } catch (e) {
      console.error('Failed to save to local storage:', e);
    }
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener());
  }

  public subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  // User Operations
  public getUser(uid: string): UserProfile | null {
    return this.data.users[uid] || null;
  }

  public getUserByEmail(email: string): UserProfile | null {
    const user = Object.values(this.data.users).find((u) => u.email.toLowerCase() === email.toLowerCase());
    return user || null;
  }

  public upsertUser(user: UserProfile) {
    this.data.users[user.uid] = user;
    this.saveToStorage(this.data);
  }

  // Session Operations
  public getSession(sessionId: string): ClassroomSession | null {
    return this.data.sessions[sessionId] || null;
  }

  public getSessionByCode(code: string): ClassroomSession | null {
    const cleanCode = code.trim().toUpperCase();
    const session = Object.values(this.data.sessions).find(
      (s) => s.sessionCode.toUpperCase() === cleanCode
    );
    return session || null;
  }

  public getAllSessionsForTeacher(teacherId: string): ClassroomSession[] {
    return Object.values(this.data.sessions)
      .filter((s) => s.teacherId === teacherId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public upsertSession(session: ClassroomSession) {
    this.data.sessions[session.sessionId] = session;
    this.saveToStorage(this.data);
  }

  // Participant Operations
  public getParticipants(sessionId: string): Participant[] {
    return Object.values(this.data.participants).filter((p) => p.sessionId === sessionId);
  }

  public getParticipant(sessionId: string, studentId: string): Participant | null {
    const key = `${sessionId}_${studentId}`;
    return this.data.participants[key] || null;
  }

  public upsertParticipant(participant: Participant) {
    const key = `${participant.sessionId}_${participant.studentId}`;
    this.data.participants[key] = participant;
    this.saveToStorage(this.data);
  }

  public getStudentSessions(studentId: string): ClassroomSession[] {
    const joinedSessionIds = Object.values(this.data.participants)
      .filter((p) => p.studentId === studentId)
      .map((p) => p.sessionId);
    
    return Object.values(this.data.sessions).filter((s) => joinedSessionIds.includes(s.sessionId));
  }

  // Event Operations
  public addEvent(event: SessionEvent) {
    this.data.events.push(event);
    this.saveToStorage(this.data);
  }

  public getEvents(sessionId: string): SessionEvent[] {
    return this.data.events
      .filter((e) => e.sessionId === sessionId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  // Report Operations
  public saveReport(report: SessionReport) {
    this.data.reports[report.reportId] = report;
    this.saveToStorage(this.data);
  }

  public getReport(reportId: string): SessionReport | null {
    return this.data.reports[reportId] || null;
  }

  public getReportBySessionId(sessionId: string): SessionReport | null {
    return Object.values(this.data.reports).find((r) => r.sessionId === sessionId) || null;
  }

  // Reset / Clear Data
  public resetToDefaults() {
    this.data = initialData;
    this.saveToStorage(initialData);
  }
}

export const mockStore = new LocalReactiveStore();

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

// Clean production store schema (no fake demo sessions or simulated events)
const initialData: StoreSchema = {
  users: {
    'teacher-1': {
      uid: 'teacher-1',
      name: 'Prof. Anita Sharma',
      email: 'teacher@focusclass.edu',
      role: 'teacher',
      createdAt: new Date().toISOString(),
    }
  },
  sessions: {},
  participants: {},
  events: [],
  reports: {}
};

class LocalReactiveStore {
  private data: StoreSchema;
  private channel: BroadcastChannel | null = null;
  private listeners: Set<() => void> = new Set();
  private eventSource: EventSource | null = null;

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

      // 1. Instant Real-Time Cross-Device SSE Stream
      try {
        if ('EventSource' in window) {
          this.eventSource = new EventSource('/api/stream');
          this.eventSource.onmessage = (event) => {
            try {
              const parsed = JSON.parse(event.data);
              if (parsed && parsed.data && JSON.stringify(parsed.data) !== JSON.stringify(this.data)) {
                this.data = parsed.data;
                localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
                this.notifyListeners();
              }
            } catch {
              // ignore parse errors
            }
          };
          this.eventSource.onerror = () => {
            // EventSource will auto-retry
          };
        }
      } catch {
        // SSE not supported
      }

      // 2. Initial fetch from server
      fetch('/api/store')
        .then((r) => r.json())
        .then((json) => {
          if (json.data && Object.keys(json.data.sessions || {}).length > 0) {
            this.data = json.data;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
            this.notifyListeners();
          } else if (Object.keys(this.data.sessions || {}).length > 0) {
            fetch('/api/store', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ data: this.data })
            }).catch(() => {});
          }
        })
        .catch(() => {});

      // 3. Fallback periodic sync (1.5s) for networks where SSE might be blocked
      setInterval(async () => {
        try {
          const r = await fetch('/api/store');
          const json = await r.json();
          if (json.data && JSON.stringify(json.data) !== JSON.stringify(this.data)) {
            this.data = json.data;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
            this.notifyListeners();
          }
        } catch {}
      }, 1500);
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

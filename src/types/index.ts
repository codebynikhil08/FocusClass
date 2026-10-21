export type UserRole = 'teacher' | 'student';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export type SessionStatus = 'scheduled' | 'active' | 'completed' | 'cancelled';

export interface ClassroomSession {
  sessionId: string;
  sessionCode: string; // e.g. FC-4821
  teacherId: string;
  teacherName: string;
  subject: string;     // e.g. Data Structures
  className: string;   // e.g. SE Computer A
  duration: number;    // in minutes, e.g. 50
  status: SessionStatus;
  startTime?: string;
  endTime?: string;
  createdAt: string;
}

export type ParticipantStatus = 'joined' | 'active' | 'completed' | 'left';

export interface Participant {
  studentId: string;
  studentName: string;
  sessionId: string;
  joinedAt: string;
  focusStartTime?: string;
  focusEndTime?: string;
  status: ParticipantStatus;
  focusDurationSeconds: number;
  engagementScore?: number;
  infractionCount?: number;
  lastActiveAt?: string;
}

export type SessionEventType = 
  | 'session_joined' 
  | 'focus_started' 
  | 'focus_ended' 
  | 'session_left' 
  | 'tab_switched_background'
  | 'focus_lost_blur'
  | 'unauthorized_login_attempt'
  | 'abnormal_phone_activity'
  | 'simulated_phone_unlock' 
  | 'simulated_app_switch' 
  | 'simulated_notification_glance';

export interface SessionEvent {
  eventId: string;
  sessionId: string;
  studentId: string;
  studentName: string;
  eventType: SessionEventType;
  timestamp: string;
  isSimulated: boolean; // Transparency flag required by prototype specifications
  metadata?: {
    severity?: 'high' | 'medium' | 'low';
    durationSeconds?: number;
    details?: string;
    label?: string;
    actionType?: string;
    [key: string]: any;
  };
}

export interface InsightItem {
  id: string;
  title: string;
  observation: string;
  recommendation: string;
  type: 'positive' | 'warning' | 'info';
  timestamp: string;
}

export interface SessionReport {
  reportId: string;
  sessionId: string;
  subject: string;
  className: string;
  teacherName: string;
  durationMinutes: number;
  totalParticipants: number;
  activeParticipants: number;
  completedParticipants: number;
  averageEngagementScore: number;
  studentReport?: {
    studentId: string;
    studentName: string;
    status: ParticipantStatus;
    focusDurationMinutes: number;
    engagementScore: number;
    summary: string;
  };
  interactionTrendData: {
    timeLabel: string;
    timeMinute: number;
    interactions: number;
    activeFocusCount: number;
  }[];
  insights: InsightItem[];
  generatedAt: string;
}

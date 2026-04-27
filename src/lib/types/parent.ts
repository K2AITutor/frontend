export interface SubjectMastery {
  code: string;
  name: string;
  mastery: number;
}

export interface ParentChild {
  id: string;
  name: string;
  grade: string;
  avatarUrl: string | null;
  currentSubjects: SubjectMastery[];
  lastActiveAt: string;
  weeklyMinutes: number;
  alertCount: number;
}

export interface MasteryEntry {
  subject: string;
  score: number;
  trend: 'up' | 'down' | 'stable';
}

export interface TimelineEntry {
  date: string;
  subject: string;
  activity: string;
  scorePct: number;
}

export interface WeakArea {
  topic: string;
  errorRate: number;
}

export interface ParentChildDetail {
  id: string;
  name: string;
  grade: string;
  mastery: MasteryEntry[];
  timeline: TimelineEntry[];
  weakAreas: WeakArea[];
}

export interface WeeklyReport {
  weekOf: string;
  minutesByDay: Record<string, number>;
  questionsAttempted: number;
  accuracyPct: number;
  topicsImproved: string[];
  topicsRegressed: string[];
}

export interface ParentAlert {
  id: string;
  childId: string;
  type: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  createdAt: string;
}

export interface ChildReportTrend {
  childId: string;
  accuracyTrend: number[];
  hoursTrend: number[];
}

export interface ParentReports {
  children: ChildReportTrend[];
}

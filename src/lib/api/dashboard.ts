"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { apiGet } from "@/lib/apiClient";

type ActivityType = "quiz_completed" | "lesson_completed" | "achievement" | "practice";

/**
 * Canonical course icon keys agreed with the backend. The backend normalizes
 * `Subject.icon` into one of these lowercase keys (default "book"); the
 * frontend `iconMap` (CourseCard) maps each key to a lucide icon.
 */
export type CourseIconKey =
  | "calculator"
  | "book"
  | "flask"
  | "atom"
  | "globe"
  | "pen"
  | "chart";

export interface StudentDashboardData {
  profile: {
    id: string;
    name: string;
    email: string;
    avatar: string; // may be "" — header renders initials fallback
    grade: string;
    enrollmentDate: string; // ISO
    overallProgress: number; // 0-100
    streak: number;
  };
  courses: Array<{
    id: string;
    name: string;
    progress: number; // 0-100
    grade: string; // letter grade
    nextLesson: string; // human-readable Topic name (not raw subtopicCode)
    icon: CourseIconKey; // canonical key — never raw/empty
  }>;
  // Adaptive recommended questions for this user. May be [] (no data).
  recommendedNext: Array<{
    questionId: string;
    title: string;
    subjectCode: string; // e.g. "MATH_METHODS"
    topicCode: string;
    difficulty: string | null; // e.g. "EASY" | "MEDIUM" | "HARD" or null
    href: string; // ready-to-use practice link
  }>;
  // Student's weakest areas for the "Areas to improve" card. May be [] (no data).
  weakAreas: Array<{
    topicCode: string;
    topicName: string; // resolved display name (fallback topicCode)
    subjectCode: string; // e.g. "MATH_METHODS"
    masteryPercent: number; // 0-100 (already converted)
    status: string; // "Weak" | "Early signal" | ...
    href: string; // link into weak-area practice
  }>;
  recentActivities: Array<{
    id: string; // String(attempt.id) — Attempt model
    type: ActivityType;
    title: string;
    description: string;
    timestamp: string; // ISO (attempt.createdAt)
    submissionId: string; // String(attempt.id) — opens /student/submissions/[submissionId]
    href: string; // "/student/submissions/" + submissionId (ready-to-use)
    subjectCode: string; // e.g. "MATH_METHODS"
    subjectName: string; // display name; fallback subjectCode
    score: {
      awarded: number;
      max: number;
      percent: number | null; // max>0 ? round(awarded/max*100) : null
    };
  }>;
  stats: {
    totalHoursLearned: number;
    questionsAnswered: number;
    averageScore: number; // 0-100
    coursesEnrolled: number;
  };
}

export interface AdminDashboardData {
  systemStats: {
    totalStudents: number;
    totalParents: number;
    totalTeachers: number;
    activeUsers: number;
    newUsersThisMonth: number;
    totalQuestions: number;
    totalSubjects: number;
    totalTopics: number;
    totalAttempts: number;
  };
  recentUsers: Array<{
    id: number | string;
    name?: string | null;
    email?: string | null;
    role?: string | null;
    status?: string | null;
    joinedDate?: string | null;
    createdAt?: string | null;
    lastLoginAt?: string | null;
    isActive?: boolean | null;
    emailVerified?: boolean | null;
    yearLevel?: string | null;
    avatar?: string | null;
    subscriptionStatus?: string | null;
  }>;
}

export function useDashboardStats() {
  const { data: session } = useSession();
  const accessToken = (session?.user as any)?.accessToken;

  const query = useQuery({
    queryKey: ["dashboardData", accessToken],
    queryFn: () => apiGet<StudentDashboardData>("/dashboard/data", accessToken),
    enabled: !!accessToken,
  });
  // While the query is disabled (session token not resolved yet on reload),
  // `isLoading` is false but there is no data — surface that window as loading
  // so pages show a skeleton instead of a flash of error/empty state.
  return { ...query, isLoading: query.isPending };
}

export function useStudentDashboardData() {
  const { data: session } = useSession();
  const accessToken = (session?.user as any)?.accessToken;

  const query = useQuery({
    queryKey: ["studentDashboardData", accessToken],
    queryFn: () => apiGet<StudentDashboardData>("/dashboard/data", accessToken),
    enabled: !!accessToken,
    staleTime: 30_000,
  });
  // Treat the pre-auth window (query disabled until the session token loads)
  // as loading so the page shows a skeleton instead of "Failed to load dashboard".
  return { ...query, isLoading: query.isPending };
}

export function useAdminDashboardData() {
  const { data: session } = useSession();
  const accessToken = (session?.user as any)?.accessToken;

  const query = useQuery<AdminDashboardData>({
    queryKey: ["adminDashboard", accessToken],
    queryFn: () => apiGet<AdminDashboardData>("/admin/dashboard", accessToken),
    enabled: !!accessToken,
  });
  // See useStudentDashboardData: keep loading until the session token resolves.
  return { ...query, isLoading: query.isPending };
}


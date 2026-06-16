"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { apiGet } from "@/lib/apiClient";

type ActivityType = "quiz_completed" | "lesson_completed" | "achievement" | "practice";
type AssignmentStatus = "pending" | "in_progress" | "completed";
type Priority = "high" | "medium" | "low";

export interface StudentDashboardData {
  profile: {
    id: string;
    name: string;
    email: string;
    avatar: string;
    grade: string;
    enrollmentDate: string;
    overallProgress: number;
    streak: number;
  };
  courses: Array<{
    id: string;
    name: string;
    progress: number;
    grade: string;
    nextLesson: string;
    icon: string;
  }>;
  assignments: Array<{
    id: string;
    title: string;
    course: string;
    dueDate: string;
    status: AssignmentStatus;
    priority: Priority;
  }>;
  recentActivities: Array<{
    id: string;
    type: ActivityType;
    title: string;
    description: string;
    timestamp: string;
  }>;
  stats: {
    totalHoursLearned: number;
    questionsAnswered: number;
    averageScore: number;
    coursesEnrolled: number;
    assignmentsCompleted: number;
    assignmentsPending: number;
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


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
  recentUsers: any[];
}

export function useDashboardStats() {
  const { data: session } = useSession();
  const accessToken = (session?.user as any)?.accessToken;

  return useQuery({
    queryKey: ["dashboardData", accessToken],
    queryFn: () => apiGet<StudentDashboardData>("/dashboard/data", accessToken),
    enabled: !!accessToken,
  });
}

export function useStudentDashboardData() {
  const { data: session } = useSession();
  const accessToken = (session?.user as any)?.accessToken;

  return useQuery({
    queryKey: ["studentDashboardData", accessToken],
    queryFn: () => apiGet<StudentDashboardData>("/dashboard/data", accessToken),
    enabled: !!accessToken,
    staleTime: 30_000,
  });
}

export function useAdminDashboardData() {
  const { data: session } = useSession();
  const accessToken = (session?.user as any)?.accessToken;

  return useQuery<AdminDashboardData>({
    queryKey: ["adminDashboard", accessToken],
    queryFn: () => apiGet<AdminDashboardData>("/admin/dashboard", accessToken),
    enabled: !!accessToken,
  });
}

export type AdminDashboardData = {
  systemStats: {
    totalStudents: number;
    newUsersThisMonth: number;
    activeUsers: number;
    totalSubjects: number;
    totalTopics: number;
    totalQuestions: number;
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
};

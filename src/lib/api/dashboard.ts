"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

const API_BASE_RAW =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:4000";

const API_BASE = (() => {
  const clean = String(API_BASE_RAW).replace(/\/+$/, "");
  return clean.endsWith("/api") ? clean : `${clean}/api`;
})();

/**
 * Existing hook (kept for compatibility).
 * NOTE: Backend currently exposes GET /api/dashboard/data, not /api/dashboard/stats.
 * We keep this hook but point it at /dashboard/data so it actually works when backend is ready.
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboardData"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/dashboard/data`, {
        cache: "no-store",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch dashboard data");
      return res.json();
    },
  });
}


export function useStudentDashboardData() {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["studentDashboardData", session?.user?.email],
    queryFn: async () => {
      const name =
        (session?.user as any)?.name ||
        session?.user?.email?.split("@")[0] ||
        "Student";

      const email = session?.user?.email || "student@example.com";

      // ✅ SAFE mock data that matches StudentDashboardPage interfaces
      return {
        profile: {
          id: "dev-student",
          name,
          email,
          avatar: "",
          grade: "VCE Student",
          enrollmentDate: new Date().toISOString(),
          overallProgress: 32,
          streak: 3,
        },
        courses: [
          {
            id: "math-methods",
            name: "Mathematical Methods",
            progress: 28,
            grade: "Units 3–4",
            nextLesson: "Functions & Graphs",
            icon: "calculator",
          },
          {
            id: "specialist-maths",
            name: "Specialist Mathematics",
            progress: 15,
            grade: "Units 3–4",
            nextLesson: "Vectors",
            icon: "sigma",
          },
          {
            id: "physics",
            name: "Physics",
            progress: 21,
            grade: "Units 3–4",
            nextLesson: "Motion",
            icon: "atom",
          },
          {
            id: "chemistry",
            name: "Chemistry",
            progress: 12,
            grade: "Units 3–4",
            nextLesson: "Organic Chemistry",
            icon: "flask",
          },
        ],
        assignments: [
          {
            id: "a1",
            title: "Methods Practice Set 1",
            course: "Mathematical Methods",
            dueDate: new Date(Date.now() + 3 * 86400000).toISOString(),
            status: "pending",
            priority: "high",
          },
          {
            id: "a2",
            title: "Physics Checkpoint Questions",
            course: "Physics",
            dueDate: new Date(Date.now() + 5 * 86400000).toISOString(),
            status: "in_progress",
            priority: "medium",
          },
        ],
        recentActivities: [
          {
            id: "r1",
            type: "practice",
            title: "Practice started",
            description: "You started a practice session",
            timestamp: "Just now",
          },
          {
            id: "r2",
            type: "quiz_completed",
            title: "Quiz completed",
            description: "Completed a short quiz",
            timestamp: "Yesterday",
          },
        ],
        stats: {
          totalHoursLearned: 6,
          questionsAnswered: 24,
          averageScore: 68,
          coursesEnrolled: 4,
          assignmentsCompleted: 0,
          assignmentsPending: 2,
        },
      };
    },
    staleTime: 30_000,
  });
}

export function useAdminDashboardData() {
  return useQuery({
    queryKey: ["adminDashboard"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/admin/dashboard`);
      return res.json();
    },
  });
}


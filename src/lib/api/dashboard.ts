"use client";

import { useQuery } from "@tanstack/react-query";

const MOCK_API_BASE = "http://localhost:4002/api";

export function useStudentProfile() {
  return useQuery({
    queryKey: ["studentProfile"],
    queryFn: async () => {
      const res = await fetch(`${MOCK_API_BASE}/student/profile`);
      return res.json();
    },
  });
}

export function useStudentCourses() {
  return useQuery({
    queryKey: ["studentCourses"],
    queryFn: async () => {
      const res = await fetch(`${MOCK_API_BASE}/student/courses`);
      return res.json();
    },
  });
}

export function useStudentAssignments() {
  return useQuery({
    queryKey: ["studentAssignments"],
    queryFn: async () => {
      const res = await fetch(`${MOCK_API_BASE}/student/assignments`);
      return res.json();
    },
  });
}

export function useStudentRecentActivities() {
  return useQuery({
    queryKey: ["studentRecentActivities"],
    queryFn: async () => {
      const res = await fetch(`${MOCK_API_BASE}/student/activities`);
      return res.json();
    },
  });
}

export function useStudentStats() {
  return useQuery({
    queryKey: ["studentStats"],
    queryFn: async () => {
      const res = await fetch(`${MOCK_API_BASE}/student/stats`);
      return res.json();
    },
  });
}

export function useStudentDashboardData() {
  return useQuery({
    queryKey: ["studentDashboard"],
    queryFn: async () => {
      const res = await fetch(`${MOCK_API_BASE}/student/dashboard`);
      return res.json();
    },
  });
}

export function useParentProfile() {
  return useQuery({
    queryKey: ["parentProfile"],
    queryFn: async () => {
      const res = await fetch(`${MOCK_API_BASE}/parent/profile`);
      return res.json();
    },
  });
}

export function useChildren() {
  return useQuery({
    queryKey: ["children"],
    queryFn: async () => {
      const res = await fetch(`${MOCK_API_BASE}/parent/children`);
      return res.json();
    },
  });
}

export function useParentNotifications() {
  return useQuery({
    queryKey: ["parentNotifications"],
    queryFn: async () => {
      const res = await fetch(`${MOCK_API_BASE}/parent/notifications`);
      return res.json();
    },
  });
}

export function useUpcomingEvents() {
  return useQuery({
    queryKey: ["upcomingEvents"],
    queryFn: async () => {
      const res = await fetch(`${MOCK_API_BASE}/parent/events`);
      return res.json();
    },
  });
}

export function useParentStats() {
  return useQuery({
    queryKey: ["parentStats"],
    queryFn: async () => {
      const res = await fetch(`${MOCK_API_BASE}/parent/stats`);
      return res.json();
    },
  });
}

export function useParentDashboardData() {
  return useQuery({
    queryKey: ["parentDashboard"],
    queryFn: async () => {
      const res = await fetch(`${MOCK_API_BASE}/parent/dashboard`);
      return res.json();
    },
  });
}

export function useAdminProfile() {
  return useQuery({
    queryKey: ["adminProfile"],
    queryFn: async () => {
      const res = await fetch(`${MOCK_API_BASE}/admin/profile`);
      return res.json();
    },
  });
}

export function useSystemStats() {
  return useQuery({
    queryKey: ["systemStats"],
    queryFn: async () => {
      const res = await fetch(`${MOCK_API_BASE}/admin/system-stats`);
      return res.json();
    },
  });
}

export function useUserGrowth() {
  return useQuery({
    queryKey: ["userGrowth"],
    queryFn: async () => {
      const res = await fetch(`${MOCK_API_BASE}/admin/user-growth`);
      return res.json();
    },
  });
}

export function useRecentUsers() {
  return useQuery({
    queryKey: ["recentUsers"],
    queryFn: async () => {
      const res = await fetch(`${MOCK_API_BASE}/admin/recent-users`);
      return res.json();
    },
  });
}

export function useCourseStats() {
  return useQuery({
    queryKey: ["courseStats"],
    queryFn: async () => {
      const res = await fetch(`${MOCK_API_BASE}/admin/course-stats`);
      return res.json();
    },
  });
}

export function useSystemAlerts() {
  return useQuery({
    queryKey: ["systemAlerts"],
    queryFn: async () => {
      const res = await fetch(`${MOCK_API_BASE}/admin/alerts`);
      return res.json();
    },
  });
}

export function useAdminActivities() {
  return useQuery({
    queryKey: ["adminActivities"],
    queryFn: async () => {
      const res = await fetch(`${MOCK_API_BASE}/admin/activities`);
      return res.json();
    },
  });
}

export function useAdminDashboardData() {
  return useQuery({
    queryKey: ["adminDashboard"],
    queryFn: async () => {
      const res = await fetch(`${MOCK_API_BASE}/admin/dashboard`);
      return res.json();
    },
  });
}

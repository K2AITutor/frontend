"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/dashboard/ui/card";
import { Button } from "@/components/dashboard/ui/button";
import { Skeleton } from "@/components/dashboard/ui/skeleton";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { UserTable } from "@/components/dashboard/UserTable";
import { useAdminDashboardData } from "@/lib/api/dashboard";
import { usePageTitle } from "@/lib/usePageTitle";
import {
  GraduationCap,
  BookOpen,
  Activity,
  ArrowRight,
  FileQuestion,
  Layers,
  ClipboardList,
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  usePageTitle("Admin Dashboard");
  const { data, isLoading, isError } = useAdminDashboardData();

  if (isLoading) {
    return <AdminDashboardSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-muted-foreground">Failed to load dashboard</p>
      </div>
    );
  }

  const { systemStats, recentUsers } = data;
  const userTableRows = recentUsers.map((user) => ({
    id: String(user.id),
    name: user.name ?? user.email ?? "Unknown user",
    email: user.email ?? "",
    role: user.role ?? "STUDENT",
    status: user.status ?? "ACTIVE",
    joinedDate: user.joinedDate ?? user.createdAt ?? new Date().toISOString(),
    lastLoginAt: user.lastLoginAt ?? null,
    isActive: user.isActive ?? user.status !== "INACTIVE",
    emailVerified: user.emailVerified ?? false,
    yearLevel: user.yearLevel ?? null,
    avatar: user.avatar ?? null,
    subscriptionStatus: user.subscriptionStatus ?? null,
  }));

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of platform statistics</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        <StatsCard
          title="Total Students"
          value={systemStats.totalStudents.toLocaleString()}
          subtitle={`+${systemStats.newUsersThisMonth} this month`}
          icon={GraduationCap}
        />
        <StatsCard
          title="Active Users"
          value={systemStats.activeUsers.toLocaleString()}
          subtitle="Currently active"
          icon={Activity}
          iconClassName="bg-green-100 dark:bg-green-900/30"
        />
      </div>

      {/* Content Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 p-3">
              <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{systemStats.totalSubjects}</p>
              <p className="text-xs text-muted-foreground">Subjects</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="rounded-lg bg-purple-100 dark:bg-purple-900/30 p-3">
              <Layers className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{systemStats.totalTopics}</p>
              <p className="text-xs text-muted-foreground">Topics</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="rounded-lg bg-orange-100 dark:bg-orange-900/30 p-3">
              <FileQuestion className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{(systemStats.totalQuestions ?? 0).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Questions</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="rounded-lg bg-teal-100 dark:bg-teal-900/30 p-3">
              <ClipboardList className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{(systemStats.totalAttempts ?? 0).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total Attempts</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Users */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Recently Joined Students</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/students">
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <UserTable users={userTableRows} />
        </CardContent>
      </Card>
    </div>
  );
}

function AdminDashboardSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
      <Skeleton className="h-[300px]" />
    </div>
  );
}

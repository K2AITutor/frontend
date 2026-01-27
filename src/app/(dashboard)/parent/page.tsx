"use client";


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ChildCard } from "@/components/dashboard/ChildCard";
import { NotificationItem } from "@/components/dashboard/NotificationItem";
import { useParentDashboardData } from "@/lib/api/dashboard";
import {
  Users,
  TrendingUp,
  Bell,
  Calendar,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";  

type NotificationType = "grade" | "assignment" | "achievement" | "message";
type EventType = "meeting" | "exam" | "event";

interface ParentProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

interface Subject {
  name: string;
  grade: string;
  progress: number;
}

interface Child {
  id: string;
  name: string;
  grade: string;
  avatar: string;
  overallProgress: number;
  averageGrade: string;
  lastActive: string;
  subjects: Subject[];
}

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  type: EventType;
}

interface Stats {
  totalChildren: number;
  averageProgress: number;
  upcomingDeadlines: number;
  unreadMessages: number;
}

interface DashboardData {
  profile: ParentProfile;
  children: Child[];
  notifications: Notification[];
  stats: Stats;
}

export default function ParentDashboardPage() {
  const { data: session } = useSession();
  const { data, isLoading, isError } = useParentDashboardData();

  if (isLoading) {
    return <ParentDashboardSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-muted-foreground">Failed to load dashboard</p>
      </div>
    );
  }

  const {children, notifications, stats } = data;
  const unreadNotifications = notifications.filter((n) => !n.read);

  return (
    <div className="space-y-6 p-6">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome, {session?.user?.name.split(" ")[0]}!
            </h1>
            <p className="text-muted-foreground">{session?.user?.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild>
            <Link href="/parent/progress">
              View Progress <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Children"
          value={stats.totalChildren}
          subtitle="Enrolled students"
          icon={Users}
        />
        <StatsCard
          title="Average Progress"
          value={`${stats.averageProgress}%`}
          subtitle="Across all subjects"
          icon={TrendingUp}
        />
        <StatsCard
          title="Upcoming Deadlines"
          value={stats.upcomingDeadlines}
          subtitle="Due this week"
          icon={Calendar}
        />
        <StatsCard
          title="Notifications"
          value={unreadNotifications.length}
          subtitle="Unread messages"
          icon={Bell}
        />
      </div>

      {/* Children Overview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Children Overview</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/parent/children">
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {children.map((child) => (
            <ChildCard
              key={child.id}
              id={child.id}
              name={child.name}
              grade={child.grade}
              avatar={child.avatar}
              overallProgress={child.overallProgress}
              averageGrade={child.averageGrade}
              lastActive={child.lastActive}
              subjects={child.subjects}
            />
          ))}
        </div>
      </div>

      {/* Notifications and Events Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Notifications */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Recent Notifications
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[280px] pr-4">
              <div className="space-y-2">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      type={notification.type}
                      title={notification.title}
                      message={notification.message}
                      timestamp={notification.timestamp}
                      read={notification.read}
                    />
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No notifications
                  </p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ParentDashboardSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <Skeleton key={i} className="h-64" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-[350px]" />
        <Skeleton className="h-[350px]" />
      </div>
    </div>
  );
}

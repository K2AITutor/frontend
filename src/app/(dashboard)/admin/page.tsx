"use client";


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { UserTable } from "@/components/dashboard/UserTable";
import { SystemAlert } from "@/components/dashboard/SystemAlert";
import { useAdminDashboardData } from "@/lib/api/dashboard";
import {
  Users,
  GraduationCap,
  BookOpen,
  Activity,
  TrendingUp,
  ArrowRight,
  Plus,
  Settings,
  Shield,
  BarChart3,
} from "lucide-react";
import Link from "next/link";

type UserRole = "student" | "parent" | "teacher" | "admin";
type UserStatus = "active" | "pending" | "suspended";
type AlertType = "warning" | "info" | "success";

interface AdminProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
}

interface SystemStats {
  totalStudents: number;
  totalParents: number;
  totalTeachers: number;
  totalCourses: number;
  activeUsers: number;
  newUsersThisMonth: number;
  averagePlatformScore: number;
  systemUptime: number;
}

interface UserGrowthData {
  month: string;
  students: number;
  parents: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  joinedDate: string;
  status: UserStatus;
}

interface CourseStats {
  id: string;
  name: string;
  enrollments: number;
  avgScore: number;
  completionRate: number;
}

interface SystemAlertData {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  timestamp: string;
}

interface AdminActivity {
  id: string;
  action: string;
  target: string;
  timestamp: string;
  admin: string;
}

interface DashboardData {
  profile: AdminProfile;
  systemStats: SystemStats;
  userGrowth: UserGrowthData[];
  recentUsers: User[];
  courseStats: CourseStats[];
  systemAlerts: SystemAlertData[];
  activities: AdminActivity[];
}

export default function AdminDashboardPage() {
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

  const {
    profile,
    systemStats,
    recentUsers,
    courseStats,
    systemAlerts,
    activities,
  } = data;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile.avatar} alt={profile.name} />
            <AvatarFallback className="text-lg">
              {profile.name.split(" ").map((n) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              {profile.name} • {profile.role}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <Link href="/admin/settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/users">
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Students"
          value={systemStats.totalStudents.toLocaleString()}
          subtitle={`+${systemStats.newUsersThisMonth} this month`}
          icon={GraduationCap}
          trend={{ value: 5.2, isPositive: true }}
        />
        <StatsCard
          title="Total Parents"
          value={systemStats.totalParents.toLocaleString()}
          subtitle="Registered guardians"
          icon={Users}
        />
        <StatsCard
          title="Active Users"
          value={systemStats.activeUsers.toLocaleString()}
          subtitle="Currently online"
          icon={Activity}
          iconClassName="bg-green-100 dark:bg-green-900/30"
        />
        <StatsCard
          title="Total Courses"
          value={systemStats.totalCourses}
          subtitle={`${systemStats.totalTeachers} teachers`}
          icon={BookOpen}
        />
      </div>

      {/* System Health */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">System Uptime</span>
                <span className="font-semibold text-green-600">
                  {systemStats.systemUptime}%
                </span>
              </div>
              <Progress value={systemStats.systemUptime} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Average Platform Score
                </span>
                <span className="font-semibold">
                  {systemStats.averagePlatformScore}%
                </span>
              </div>
              <Progress
                value={systemStats.averagePlatformScore}
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-muted/50 p-4 text-center">
                <p className="text-2xl font-bold text-primary">
                  {systemStats.totalTeachers}
                </p>
                <p className="text-xs text-muted-foreground">Teachers</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-4 text-center">
                <p className="text-2xl font-bold text-primary">
                  {systemStats.newUsersThisMonth}
                </p>
                <p className="text-xs text-muted-foreground">New This Month</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-4 text-center">
                <p className="text-2xl font-bold text-primary">
                  {systemStats.totalCourses}
                </p>
                <p className="text-xs text-muted-foreground">Active Courses</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-4 text-center">
                <p className="text-2xl font-bold text-green-600">
                  {systemStats.activeUsers}
                </p>
                <p className="text-xs text-muted-foreground">Online Now</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Recent Users</TabsTrigger>
          <TabsTrigger value="courses">Course Stats</TabsTrigger>
          <TabsTrigger value="alerts">System Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Recently Joined Users</h3>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/users">
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <UserTable users={recentUsers} />
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Course Performance</h3>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/courses">
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {courseStats.map((course) => (
              <Card key={course.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">{course.name}</h4>
                    <span className="text-xs text-muted-foreground">
                      {course.enrollments.toLocaleString()} students
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Avg Score</span>
                        <span className="font-medium">{course.avgScore}%</span>
                      </div>
                      <Progress value={course.avgScore} className="h-1.5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">
                          Completion Rate
                        </span>
                        <span className="font-medium">
                          {course.completionRate}%
                        </span>
                      </div>
                      <Progress
                        value={course.completionRate}
                        className="h-1.5"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">System Alerts</h3>
            <Button variant="ghost" size="sm">
              Clear all
            </Button>
          </div>
          <div className="space-y-3">
            {systemAlerts.map((alert) => (
              <SystemAlert
                key={alert.id}
                type={alert.type}
                title={alert.title}
                message={alert.message}
                timestamp={alert.timestamp}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Admin Activity
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/analytics">View logs</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px] pr-4">
            <div className="space-y-3">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.target}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {activity.admin}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

function AdminDashboardSkeleton() {
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
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
      <Skeleton className="h-10 w-80" />
      <Skeleton className="h-[300px]" />
      <Skeleton className="h-[250px]" />
    </div>
  );
}

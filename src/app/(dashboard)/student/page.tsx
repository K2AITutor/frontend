"use client";


import { Card, CardContent, CardHeader, CardTitle } from "@/components/dashboard/ui/card";
import { Button } from "@/components/dashboard/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/dashboard/ui/avatar";
import { Progress } from "@/components/dashboard/ui/progress";
import { ScrollArea } from "@/components/dashboard/ui/scroll-area";
import { Separator } from "@/components/dashboard/ui/separator";
import { Skeleton } from "@/components/dashboard/ui/skeleton";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { CourseCard } from "@/components/dashboard/CourseCard";
import { AssignmentItem } from "@/components/dashboard/AssignmentItem";
import { ActivityItem } from "@/components/dashboard/ActivityItem";
import { useStudentDashboardData } from "@/lib/api/dashboard";
import { usePageTitle } from "@/lib/usePageTitle";
import {
  BookOpen,
  Clock,
  Target,
  Trophy,
  Flame,
  GraduationCap,
  ArrowRight,
  CalendarDays,
} from "lucide-react";
import Link from "next/link";

type AssignmentStatus = "pending" | "in_progress" | "completed";
type Priority = "high" | "medium" | "low";
type ActivityType = "quiz_completed" | "lesson_completed" | "achievement" | "practice";

interface StudentProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  grade: string;
  enrollmentDate: string;
  overallProgress: number;
  streak: number;
}

interface Course {
  id: string;
  name: string;
  progress: number;
  grade: string;
  nextLesson: string;
  icon: string;
}

interface Assignment {
  id: string;
  title: string;
  course: string;
  dueDate: string;
  status: AssignmentStatus;
  priority: Priority;
}

interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
}

interface Stats {
  totalHoursLearned: number;
  questionsAnswered: number;
  averageScore: number;
  coursesEnrolled: number;
  assignmentsCompleted: number;
  assignmentsPending: number;
}

interface DashboardData {
  profile: StudentProfile;
  courses: Course[];
  assignments: Assignment[];
  recentActivities: Activity[];
  stats: Stats;
}

export default function StudentDashboardPage() {
  usePageTitle("Student Dashboard");
  const { data, isLoading, isError } = useStudentDashboardData();

  if (isLoading) {
    return <StudentDashboardSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-muted-foreground">Failed to load dashboard</p>
      </div>
    );
  }

  const { profile, courses, recentActivities, stats } = data;
  const assignments = data.assignments as Assignment[];
  const pendingAssignments = assignments.filter((a) => a.status !== "completed");

  return (
    <div className="space-y-6 p-6">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {profile.name.split(" ")[0]}!</h1>
            <p className="text-muted-foreground">{profile.grade} • {profile.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-orange-100 dark:bg-orange-900/30 px-4 py-2">
            <Flame className="h-5 w-5 text-orange-500" />
            <span className="font-semibold text-orange-700 dark:text-orange-400">
              {profile.streak} day streak
            </span>
          </div>
          <Button asChild>
            <Link href="/student/practice">
              Start Practice <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Hours Learned"
          value={stats.totalHoursLearned}
          subtitle="Total study time"
          icon={Clock}
        />
        <StatsCard
          title="Questions Answered"
          value={stats.questionsAnswered}
          subtitle="Practice questions"
          icon={Target}
        />
        <StatsCard
          title="Average Score"
          value={`${stats.averageScore}%`}
          subtitle="Across all subjects"
          icon={Trophy}
        />
        <StatsCard
          title="Courses Enrolled"
          value={stats.coursesEnrolled}
          subtitle={`${stats.assignmentsPending} pending tasks`}
          icon={BookOpen}
        />
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Overall Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Curriculum completion</span>
              <span className="font-semibold">{profile.overallProgress}%</span>
            </div>
            <Progress value={profile.overallProgress} className="h-3" />
            <p className="text-xs text-muted-foreground">
              Keep up the great work! You&apos;re making excellent progress.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Courses - Takes 2 columns */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">My Courses</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                id={course.id}
                name={course.name}
                progress={course.progress}
                grade={course.grade}
                nextLesson={course.nextLesson}
                icon={course.icon}
              />
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[320px] pr-4">
              <div className="space-y-1">
                {recentActivities.map((activity, index) => (
                  <div key={activity.id}>
                    <ActivityItem
                      type={activity.type}
                      title={activity.title}
                      description={activity.description}
                      timestamp={activity.timestamp}
                    />
                    {index < recentActivities.length - 1 && (
                      <Separator className="my-1" />
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Assignments Section */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Upcoming Assignments
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pendingAssignments.length > 0 ? (
              pendingAssignments.map((assignment) => (
                <AssignmentItem
                  key={assignment.id}
                  id={assignment.id}
                  title={assignment.title}
                  course={assignment.course}
                  dueDate={assignment.dueDate}
                  status={assignment.status}
                  priority={assignment.priority}
                />
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No pending assignments. Great job!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StudentDashboardSkeleton() {
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
      <Skeleton className="h-24" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
        <Skeleton className="h-[400px]" />
      </div>
    </div>
  );
}

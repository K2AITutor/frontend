"use client";


import { Card, CardContent, CardHeader, CardTitle } from "@/components/dashboard/ui/card";
import { Button } from "@/components/dashboard/ui/button";
import { Badge } from "@/components/dashboard/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/dashboard/ui/avatar";
import { Progress } from "@/components/dashboard/ui/progress";
import { Separator } from "@/components/dashboard/ui/separator";
import { Skeleton } from "@/components/dashboard/ui/skeleton";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { CourseCard } from "@/components/dashboard/CourseCard";
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
  Lightbulb,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

// Builds up to two uppercase initials from a display name for the avatar fallback.
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Solid-fill badge variant for a weak-area status (white text, no faint tint).
function weakAreaStatusVariant(status: string): "destructive" | "default" | "secondary" {
  const normalized = status.toLowerCase();
  if (normalized.includes("weak")) return "destructive";
  if (normalized.includes("early")) return "default";
  return "secondary";
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

  const { profile, courses, recentActivities, recommendedNext, weakAreas, stats } = data;

  return (
    <div className="space-y-6 p-6">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile.avatar || undefined} alt={profile.name} />
            <AvatarFallback className="text-lg font-semibold">
              {getInitials(profile.name)}
            </AvatarFallback>
          </Avatar>
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
          subtitle="Active subjects"
          icon={BookOpen}
        />
      </div>

      {/* Practice next + Areas to improve */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Practice next */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Practice next
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recommendedNext.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No recommendations right now. Keep practicing to unlock tailored
                suggestions.
              </p>
            ) : (
              <div className="space-y-2">
                {recommendedNext.map((item) => (
                  <Link
                    key={item.questionId}
                    href={item.href}
                    className="flex items-center justify-between gap-3 rounded-md border border-border p-3 transition-colors hover:bg-muted/50"
                  >
                    <span className="min-w-0 flex-1 text-sm font-medium text-foreground truncate">
                      {item.title}
                    </span>
                    {item.difficulty && (
                      <Badge variant="secondary" className="capitalize shrink-0">
                        {item.difficulty.toLowerCase()}
                      </Badge>
                    )}
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Areas to improve */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Areas to improve
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weakAreas.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No weak areas detected yet. Great work staying on top of your
                subjects!
              </p>
            ) : (
              <div className="space-y-2">
                {weakAreas.map((area) => (
                  <Link
                    key={area.topicCode}
                    href={area.href}
                    className="flex items-center justify-between gap-3 rounded-md border border-border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">
                        {area.topicName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {area.masteryPercent}% mastery
                      </p>
                    </div>
                    <Badge
                      variant={weakAreaStatusVariant(area.status)}
                      className="shrink-0"
                    >
                      {area.status}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
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
            {recentActivities.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No recent activity yet. Start practicing to see your progress here.
              </p>
            ) : (
              <div className="space-y-1">
                {recentActivities.map((activity, index) => (
                  <div key={activity.id}>
                    <ActivityItem
                      type={activity.type}
                      title={activity.title}
                      description={activity.description}
                      timestamp={activity.timestamp}
                      href={activity.href}
                      subjectName={activity.subjectName}
                      score={activity.score}
                    />
                    {index < recentActivities.length - 1 && (
                      <Separator className="my-1" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
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
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
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

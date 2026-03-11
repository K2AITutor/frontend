"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/dashboard/ui/card";
import { Button } from "@/components/dashboard/ui/button";
import { Skeleton } from "@/components/dashboard/ui/skeleton";
import { CourseCard } from "@/components/dashboard/CourseCard";
import { useStudentCourses } from "@/lib/api/dashboard";
import { BookOpen, Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/dashboard/ui/dropdown-menu";

interface Course {
  id: string;
  name: string;
  progress: number;
  grade?: string;
  nextLesson?: string;
  icon?: string;
}

export default function StudentCoursesPage() {
  const [filter, setFilter] = useState<"all" | "in_progress" | "completed">("all");
  const { data: courses = [], isLoading, isError } = useStudentCourses();

  const filteredCourses = courses.filter((course) => {
    if (filter === "all") return true;
    if (filter === "in_progress") return course.progress > 0 && course.progress < 100;
    if (filter === "completed") return course.progress === 100;
    return true;
  });

  if (isLoading) {
    return <CoursesPageSkeleton />;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Courses</h1>
          <p className="text-muted-foreground">
            {filteredCourses.length} course{filteredCourses.length !== 1 ? "s" : ""} enrolled
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              {filter === "all" ? "All Courses" : filter === "in_progress" ? "In Progress" : "Completed"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Filter by</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setFilter("all")}>All Courses</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("in_progress")}>In Progress</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("completed")}>Completed</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {filteredCourses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BookOpen className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No courses found</h3>
            <p className="text-muted-foreground text-center max-w-sm">
              {filter === "all"
                ? "You haven't enrolled in any courses yet."
                : `No ${filter === "in_progress" ? "in-progress" : "completed"} courses found.`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
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
      )}
    </div>
  );
}

function CoursesPageSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>
    </div>
  );
}

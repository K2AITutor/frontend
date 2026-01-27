"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Subject {
  name: string;
  grade: string;
  progress: number;
}

interface ChildCardProps {
  id: string;
  name: string;
  grade: string;
  avatar?: string;
  overallProgress: number;
  averageGrade: string;
  lastActive: string;
  subjects: Subject[];
  className?: string;
}

function formatLastActive(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffInHours = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  );

  if (diffInHours < 1) return "Active now";
  if (diffInHours < 24) return `${diffInHours}h ago`;
  return `${Math.floor(diffInHours / 24)}d ago`;
}

function getGradeColor(grade: string): string {
  if (grade.startsWith("A"))
    return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
  if (grade.startsWith("B"))
    return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
  if (grade.startsWith("C"))
    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
  return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
}

export function ChildCard({
  id,
  name,
  grade,
  avatar,
  overallProgress,
  averageGrade,
  lastActive,
  subjects,
  className,
}: ChildCardProps) {
  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={avatar} alt={name} />
              <AvatarFallback>
                {name.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">{name}</CardTitle>
              <p className="text-sm text-muted-foreground">{grade}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={cn("font-semibold", getGradeColor(averageGrade))}>
              Avg: {averageGrade}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-medium">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>

        {/* Subject Grades */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Subjects</p>
          <div className="grid grid-cols-2 gap-2">
            {subjects.slice(0, 4).map((subject) => (
              <div
                key={subject.name}
                className="flex items-center justify-between rounded-md bg-muted/50 px-2 py-1.5"
              >
                <span className="text-xs truncate">{subject.name}</span>
                <Badge
                  variant="secondary"
                  className={cn("text-xs ml-1", getGradeColor(subject.grade))}
                >
                  {subject.grade}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {formatLastActive(lastActive)}
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/parent/children/${id}`}>
              View Details <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

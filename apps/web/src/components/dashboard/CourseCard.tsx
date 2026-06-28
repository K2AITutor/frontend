"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/dashboard/ui/card";
import { Progress } from "@/components/dashboard/ui/progress";
import { Badge } from "@/components/dashboard/ui/badge";
import { Button } from "@/components/dashboard/ui/button";
import {
  Calculator,
  BookOpen,
  FlaskConical,
  Atom,
  Globe,
  PenLine,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface CourseCardProps {
  id: string;
  name: string;
  progress: number;
  grade?: string;
  nextLesson?: string;
  icon?: string;
  className?: string;
}

// Maps the canonical lowercase icon keys the backend sends to lucide icons.
// Keys must stay in sync with CourseIconKey in @/lib/api/dashboard.
const iconMap: Record<string, React.ReactNode> = {
  calculator: <Calculator className="h-5 w-5" />,
  book: <BookOpen className="h-5 w-5" />,
  flask: <FlaskConical className="h-5 w-5" />,
  atom: <Atom className="h-5 w-5" />,
  globe: <Globe className="h-5 w-5" />,
  pen: <PenLine className="h-5 w-5" />,
  chart: <BarChart3 className="h-5 w-5" />,
};

const defaultIcon = <BookOpen className="h-5 w-5" />;

function getGradeColor(grade?: string): string {
  if (!grade) return "bg-gray-100 text-gray-800";
  if (grade.startsWith("A")) return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
  if (grade.startsWith("B")) return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
  if (grade.startsWith("C")) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
  return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
}

export function CourseCard({
  name,
  progress,
  grade,
  nextLesson,
  icon = "book",
  className,
}: CourseCardProps) {
  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {iconMap[icon] ?? defaultIcon}
            </div>
            <CardTitle className="text-base">{name}</CardTitle>
          </div>
          {grade && (
            <Badge className={cn("font-semibold", getGradeColor(grade))}>
              {grade}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        {nextLesson && (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Next lesson</p>
              <p className="text-sm font-medium">{nextLesson}</p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/student/practice">
                Practice <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

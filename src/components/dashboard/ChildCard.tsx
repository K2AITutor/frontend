"use client";

import Link from "next/link";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/dashboard/ui/card";
import { Progress } from "@/components/dashboard/ui/progress";
import { Badge } from "@/components/dashboard/ui/badge";
import { Button } from "@/components/dashboard/ui/button";
import { UserAvatar } from "@/components/dashboard/UserAvatar";
import { cn } from "@/lib/utils";
import type { ParentChild } from "@/lib/types/parent";

function TrendIcon({ trend }: { trend: "up" | "down" | "stable" }) {
  if (trend === "up") return <TrendingUp className="h-4 w-4 text-green-500" />;
  if (trend === "down") return <TrendingDown className="h-4 w-4 text-red-500" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
}

export function ChildCard({ child, className }: { child: ParentChild; className?: string }) {
  const lastActive = new Date(child.lastActiveAt).toLocaleDateString("en-AU", {
    month: "short",
    day: "numeric",
  });

  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <UserAvatar name={child.name} src={child.avatarUrl} className="h-9 w-9 shrink-0" />
            <div className="min-w-0">
              <CardTitle className="truncate text-base">{child.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{child.grade}</p>
            </div>
          </div>
          {child.alertCount > 0 && (
            <Badge variant="destructive" className="shrink-0 text-xs">
              {child.alertCount} alert{child.alertCount > 1 ? "s" : ""}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {child.currentSubjects.length > 0 ? (
          child.currentSubjects.map((sub) => (
            <div key={sub.code} className="space-y-1">
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="truncate text-muted-foreground">{sub.name}</span>
                <div className="flex shrink-0 items-center gap-1">
                  {sub.trend && <TrendIcon trend={sub.trend} />}
                  <span className="font-medium">{sub.mastery}%</span>
                </div>
              </div>
              <Progress value={sub.mastery} className="h-1.5" />
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No subject activity yet.</p>
        )}
        <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
          <span>Last active {lastActive}</span>
          <span>{child.weeklyMinutes} min this week</span>
        </div>
        <Button asChild size="sm" variant="outline" className="mt-1 w-full">
          <Link href={`/parent/children/${child.id}`}>View Details</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

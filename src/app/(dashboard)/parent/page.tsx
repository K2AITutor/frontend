"use client";

import Link from "next/link";
import { Loader2, AlertCircle, Users, Clock, Bell, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/dashboard/ui/card";
import { Badge } from "@/components/dashboard/ui/badge";
import { Button } from "@/components/dashboard/ui/button";
import { Progress } from "@/components/dashboard/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/dashboard/ui/avatar";
import { useParentChildren, useParentAlerts } from "@/lib/api/parent";
import { usePageTitle } from "@/lib/usePageTitle";
import type { ParentChild } from "@/lib/types/parent";

function TrendIcon({ trend }: { trend: "up" | "down" | "stable" }) {
  if (trend === "up") return <TrendingUp className="h-4 w-4 text-green-500" />;
  if (trend === "down") return <TrendingDown className="h-4 w-4 text-red-500" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
}

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function ChildCard({ child }: { child: ParentChild }) {
  const lastActive = new Date(child.lastActiveAt).toLocaleDateString("en-AU", {
    month: "short",
    day: "numeric",
  });

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="h-9 w-9 shrink-0">
              {child.avatarUrl && <AvatarImage src={child.avatarUrl} alt={child.name} />}
              <AvatarFallback className="text-xs font-medium">{initials(child.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <CardTitle className="text-base truncate">{child.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{child.grade}</p>
            </div>
          </div>
          {child.alertCount > 0 && (
            <Badge variant="destructive" className="text-xs shrink-0">
              {child.alertCount} alert{child.alertCount > 1 ? "s" : ""}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {child.currentSubjects.map((sub) => (
          <div key={sub.code} className="space-y-1">
            <div className="flex justify-between items-center text-sm gap-2">
              <span className="text-muted-foreground truncate">{sub.name}</span>
              <div className="flex items-center gap-1 shrink-0">
                {sub.trend && <TrendIcon trend={sub.trend} />}
                <span className="font-medium">{sub.mastery}%</span>
              </div>
            </div>
            <Progress value={sub.mastery} className="h-1.5" />
          </div>
        ))}
        <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
          <span>Last active {lastActive}</span>
          <span>{child.weeklyMinutes} min this week</span>
        </div>
        <Button asChild size="sm" variant="outline" className="w-full mt-1">
          <Link href={`/parent/children/${child.id}`}>View Details</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default function ParentDashboardPage() {
  usePageTitle("Parent Dashboard");

  const { data: session } = useSession();
  const { data: children, isLoading: childrenLoading, error: childrenError, refetch } = useParentChildren();
  const { data: alerts, error: alertsError, refetch: refetchAlerts } = useParentAlerts();

  if (childrenLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (childrenError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="h-10 w-10 text-red-500" />
        <p className="text-muted-foreground">Failed to load dashboard</p>
        <Button variant="outline" onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  const parentName = session?.user?.name;
  const totalWeeklyMinutes = children?.reduce((sum, c) => sum + c.weeklyMinutes, 0) ?? 0;
  const totalAlerts = alerts?.length ?? 0;

  return (
    <div className="space-y-6 p-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {parentName ? `Welcome back, ${parentName}` : "Parent Dashboard"}
        </h1>
        <p className="text-muted-foreground">Monitor your children&apos;s VCE progress</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <Users className="h-8 w-8 text-primary shrink-0" />
            <div>
              <p className="text-2xl font-bold">{children?.length ?? 0}</p>
              <p className="text-sm text-muted-foreground">Children enrolled</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <Clock className="h-8 w-8 text-blue-500 shrink-0" />
            <div>
              <p className="text-2xl font-bold">{totalWeeklyMinutes}</p>
              <p className="text-sm text-muted-foreground">Total minutes this week</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <Bell className={`h-8 w-8 shrink-0 ${totalAlerts > 0 ? "text-amber-500" : "text-muted-foreground"}`} />
            <div>
              <p className="text-2xl font-bold">{totalAlerts}</p>
              <p className="text-sm text-muted-foreground">Active alerts</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Children grid */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Your Children</h2>
        {children && children.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {children.map((child) => (
              <ChildCard key={child.id} child={child} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No children linked to your account yet.
            </CardContent>
          </Card>
        )}
      </div>

      {/* Alert snippet */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Recent Alerts</h2>
          {alerts && alerts.length > 0 && (
            <Button asChild variant="ghost" size="sm">
              <Link href="/parent/alerts">
                View all{alerts.length > 3 ? ` (${alerts.length})` : ""}
              </Link>
            </Button>
          )}
        </div>
        {alertsError ? (
          <div className="flex flex-col items-center justify-center py-6 gap-3">
            <AlertCircle className="h-6 w-6 text-red-500" />
            <p className="text-sm text-muted-foreground">Failed to load alerts</p>
            <Button variant="outline" size="sm" onClick={() => refetchAlerts()}>Retry</Button>
          </div>
        ) : alerts && alerts.length > 0 ? (
          <div className="space-y-2">
            {alerts.slice(0, 3).map((alert) => (
              <Card key={alert.id} className={`border-l-4 ${
                alert.severity === "critical" ? "border-l-red-500" :
                alert.severity === "warning" ? "border-l-amber-500" : "border-l-blue-400"
              }`}>
                <CardContent className="py-3 flex items-center justify-between gap-4">
                  <p className="text-sm">{alert.message}</p>
                  <Badge variant={alert.severity === "critical" ? "destructive" : "secondary"} className="shrink-0 capitalize">
                    {alert.severity}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No active alerts.</p>
        )}
      </div>
    </div>
  );
}

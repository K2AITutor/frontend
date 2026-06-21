"use client";

import Link from "next/link";
import { Loader2, AlertCircle, Users, Clock, Bell } from "lucide-react";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/dashboard/ui/card";
import { Badge } from "@/components/dashboard/ui/badge";
import { Button } from "@/components/dashboard/ui/button";
import { ChildCard } from "@/components/dashboard/ChildCard";
import { useParentChildren, useParentAlerts } from "@/lib/api/parent";
import { usePageTitle } from "@/lib/usePageTitle";

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

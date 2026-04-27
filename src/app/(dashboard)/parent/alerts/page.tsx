"use client";

import { Loader2, AlertCircle, Bell, Info, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/dashboard/ui/card";
import { Button } from "@/components/dashboard/ui/button";
import { Badge } from "@/components/dashboard/ui/badge";
import { useParentAlerts, useParentChildren } from "@/lib/api/parent";
import { usePageTitle } from "@/lib/usePageTitle";
import type { ParentAlert } from "@/lib/types/parent";

function SeverityIcon({ severity }: { severity: ParentAlert["severity"] }) {
  if (severity === "critical") return <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />;
  if (severity === "warning") return <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />;
  return <Info className="h-5 w-5 text-blue-500 shrink-0" />;
}

const borderMap: Record<ParentAlert["severity"], string> = {
  critical: "border-l-red-500",
  warning: "border-l-amber-500",
  info: "border-l-blue-400",
};

const badgeVariantMap: Record<ParentAlert["severity"], "destructive" | "secondary"> = {
  critical: "destructive",
  warning: "secondary",
  info: "secondary",
};

export default function ParentAlertsPage() {
  usePageTitle("Alerts");

  const { data: alerts, isLoading, error, refetch } = useParentAlerts();
  const { data: children } = useParentChildren();

  const getChildName = (childId: string) =>
    children?.find((c) => c.id === childId)?.name ?? childId;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="h-10 w-10 text-red-500" />
        <p className="text-muted-foreground">Failed to load alerts</p>
        <Button variant="outline" onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 pb-20">
      <div className="flex items-center gap-3">
        <Bell className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Alerts</h1>
          <p className="text-muted-foreground">
            {alerts?.length ?? 0} active alert{alerts?.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {!alerts || alerts.length === 0 ? (
        <Card>
          <CardContent className="py-16 flex flex-col items-center gap-3 text-muted-foreground">
            <Bell className="h-10 w-10" />
            <p>No alerts — everything looks good!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <Card key={alert.id} className={`border-l-4 ${borderMap[alert.severity]}`}>
              <CardContent className="py-4 flex items-start gap-3">
                <SeverityIcon severity={alert.severity} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{alert.message}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {getChildName(alert.childId)} · {new Date(alert.createdAt).toLocaleDateString("en-AU", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <Badge variant={badgeVariantMap[alert.severity]} className="capitalize shrink-0">
                  {alert.severity}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

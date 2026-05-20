"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  AlertCircle,
  Bell,
  Info,
  AlertTriangle,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/dashboard/ui/card";
import { Button } from "@/components/dashboard/ui/button";
import { Badge } from "@/components/dashboard/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/dashboard/ui/select";
import { toast } from "@/components/dashboard/ui/sonner";
import {
  useParentAlerts,
  useParentChildren,
  useDismissParentAlert,
} from "@/lib/api/parent";
import { usePageTitle } from "@/lib/usePageTitle";
import type { ParentAlert } from "@/lib/types/parent";

const PAGE_SIZE = 10;

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

function formatType(type: string) {
  return type.replace(/_/g, " ");
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ParentAlertsPage() {
  usePageTitle("Alerts");

  const { data: alerts, isLoading, error, refetch } = useParentAlerts();
  const { data: children, isError: childrenError } = useParentChildren();
  const dismiss = useDismissParentAlert();

  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [childFilter, setChildFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [severityFilter, childFilter]);

  const childMap = useMemo(() => {
    const m = new Map<string, string>();
    (children ?? []).forEach((c) => m.set(c.id, c.name));
    return m;
  }, [children]);

  const getChildName = (childId: string) => {
    if (childMap.has(childId)) return childMap.get(childId)!;
    if (childrenError) return "Unknown student";
    return childId;
  };

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

  const sorted = (alerts ?? [])
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const filtered = sorted.filter((a) => {
    if (severityFilter !== "all" && a.severity !== severityFilter) return false;
    if (childFilter !== "all" && a.childId !== childFilter) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * PAGE_SIZE;
  const visible = filtered.slice(startIdx, startIdx + PAGE_SIZE);

  const handleDismiss = (id: string) => {
    dismiss.mutate(id, {
      onSuccess: () => toast.success("Alert dismissed"),
      onError: () => toast.error("Failed to dismiss alert"),
    });
  };

  const childrenForFilter = children ?? [];
  const totalActive = alerts?.length ?? 0;

  return (
    <div className="space-y-6 p-6 pb-20">
      <div className="flex items-center gap-3">
        <Bell className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Alerts</h1>
          <p className="text-muted-foreground">
            {totalActive} active alert{totalActive !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {totalActive === 0 ? (
        <Card>
          <CardContent className="py-16 flex flex-col items-center gap-3 text-muted-foreground">
            <Bell className="h-10 w-10" />
            <p>No alerts — everything looks good!</p>
            <Button asChild variant="outline" size="sm" className="mt-2">
              <Link href="/parent">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                </SelectContent>
              </Select>
              <Select value={childFilter} onValueChange={setChildFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Child" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All children</SelectItem>
                  {childrenForFilter.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {filtered.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No alerts match your filter.
              </p>
            ) : (
              <>
                <div className="space-y-3">
                  {visible.map((alert) => (
                    <Card
                      key={alert.id}
                      className={`border-l-4 ${borderMap[alert.severity]} transition hover:bg-muted/50`}
                    >
                      <CardContent className="py-4 flex items-start gap-3">
                        <Link
                          href={`/parent/children/${alert.childId}`}
                          className="flex flex-1 items-start gap-3 min-w-0"
                        >
                          <SeverityIcon severity={alert.severity} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{alert.message}</p>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-xs text-muted-foreground">
                              <span>{getChildName(alert.childId)}</span>
                              <span aria-hidden="true">·</span>
                              <span>{formatDate(alert.createdAt)}</span>
                              {alert.type ? (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <Badge
                                    variant="outline"
                                    className="capitalize text-[10px] py-0 h-4 font-normal"
                                  >
                                    {formatType(alert.type)}
                                  </Badge>
                                </>
                              ) : null}
                            </div>
                          </div>
                        </Link>
                        <Badge
                          variant={badgeVariantMap[alert.severity]}
                          className="capitalize shrink-0"
                        >
                          {alert.severity}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          aria-label="Dismiss alert"
                          disabled={dismiss.isPending}
                          onClick={() => handleDismiss(alert.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4">
                    <p className="text-sm text-muted-foreground">
                      Showing {startIdx + 1}–{Math.min(startIdx + PAGE_SIZE, filtered.length)} of {filtered.length}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                      <span className="text-sm font-medium">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

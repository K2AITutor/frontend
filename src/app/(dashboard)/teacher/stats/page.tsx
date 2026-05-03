"use client";

import Link from "next/link";
import { Loader2, AlertCircle, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/dashboard/ui/card";
import { Button } from "@/components/dashboard/ui/button";
import { useTeacherStats, useTeacherHistory } from "@/lib/api/teacher";
import { usePageTitle } from "@/lib/usePageTitle";
import type { TeacherHistoryItem } from "@/lib/types/teacher";

function RadialGauge({ value, max = 100, color, label, displayValue, unavailable }: {
  value: number;
  max?: number;
  color: string;
  label: string;
  displayValue?: string;
  unavailable?: boolean;
}) {
  const pct = unavailable ? 0 : Math.min(value / max, 1);
  const circumference = 2 * Math.PI * 36;
  const dashOffset = circumference * (1 - pct);
  const text = unavailable ? "—" : (displayValue ?? `${value.toFixed(0)}${max === 100 ? "%" : ""}`);
  const arcColor = unavailable ? "currentColor" : color;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="88" height="88" viewBox="0 0 88 88" aria-hidden="true"
        className={unavailable ? "opacity-40" : undefined}>
        <circle cx="44" cy="44" r="36" fill="none" stroke="currentColor"
          strokeWidth="8" className="text-muted/20" />
        <circle cx="44" cy="44" r="36" fill="none" stroke={arcColor}
          strokeWidth="8" strokeDasharray={circumference}
          strokeDashoffset={dashOffset} strokeLinecap="round"
          transform="rotate(-90 44 44)"
          className={unavailable ? "text-muted/40" : undefined} />
        <text x="44" y="50" textAnchor="middle"
          className="fill-foreground text-sm font-bold" fontSize="14">
          {text}
        </text>
      </svg>
      <p className="text-xs text-muted-foreground text-center">{label}</p>
    </div>
  );
}

function DecisionBar({ history }: { history: TeacherHistoryItem[] }) {
  const counts = { approve: 0, override: 0, escalate: 0 };
  history.forEach((h) => { counts[h.decision] = (counts[h.decision] ?? 0) + 1; });
  const total = history.length;

  const bars = [
    { key: "approve", label: "Approved", color: "#22c55e" },
    { key: "override", label: "Overridden", color: "#f59e0b" },
    { key: "escalate", label: "Escalated", color: "#ef4444" },
  ] as const;

  return (
    <div className="space-y-3">
      {bars.map(({ key, label, color }) => {
        const count = counts[key];
        const pct = total > 0 ? (count / total) * 100 : 0;
        return (
          <div key={key}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">{label}</span>
              <span className="font-medium">{count} ({pct.toFixed(0)}%)</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${pct}%`, backgroundColor: color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function TeacherStatsPage() {
  usePageTitle("My Stats");

  const { data: stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } =
    useTeacherStats({ refetchInterval: 60_000 });
  const { data: history, isLoading: historyLoading, error: historyError, refetch: refetchHistory } =
    useTeacherHistory("30d", { refetchInterval: 60_000 });

  const isLoading = statsLoading || historyLoading;

  if (statsError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="h-10 w-10 text-red-500" />
        <p className="text-muted-foreground">Failed to load stats</p>
        <Button variant="outline" onClick={() => refetchStats()}>Retry</Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const historyData = history ?? [];
  const avgMin = stats?.avgResolutionMinutes ?? 0;
  const avgGaugeValue = Math.min(avgMin, 30);
  const avgGaugeDisplay = avgMin > 30 ? "30+" : avgMin.toFixed(0);

  return (
    <div className="space-y-6 p-6 pb-20">
      <div className="flex items-center gap-3">
        <BarChart3 className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Stats</h1>
          <p className="text-muted-foreground">Personal review performance overview</p>
        </div>
      </div>

      {/* Gauges */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Performance Gauges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap justify-around gap-6">
            <RadialGauge
              value={stats?.agreementRatePct ?? 0}
              color="#6366f1"
              label="Agreement with AI"
            />
            <RadialGauge
              value={stats?.agreementRatePct30d ?? 0}
              color="#10b981"
              label="Agreement (30d)"
              unavailable={!!historyError && stats?.agreementRatePct30d == null}
            />
            <RadialGauge
              value={stats?.escalationRatePct ?? 0}
              color="#ef4444"
              label="Escalation rate"
            />
            <RadialGauge
              value={avgGaugeValue}
              max={30}
              color="#f59e0b"
              label={`Avg ${stats?.avgResolutionMinutes?.toFixed(1) ?? "—"} min/review`}
              displayValue={avgGaugeDisplay}
            />
          </div>
        </CardContent>
      </Card>

      {/* Decision breakdown (30d) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Decision Breakdown (last 30 days)</CardTitle>
        </CardHeader>
        <CardContent>
          {historyError ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <AlertCircle className="h-6 w-6 text-red-500" />
              <p className="text-sm text-muted-foreground">Failed to load review history.</p>
              <Button variant="outline" size="sm" onClick={() => refetchHistory()}>Retry</Button>
            </div>
          ) : historyData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No review history in the last 30 days.
            </p>
          ) : (
            <DecisionBar history={historyData} />
          )}
        </CardContent>
      </Card>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-5 text-center">
            <p className="text-3xl font-bold text-primary">{stats?.reviewedToday ?? 0}</p>
            <p className="text-xs text-muted-foreground mt-1">Reviewed today</p>
          </CardContent>
        </Card>
        <Link href="/teacher/review" className="block group">
          <Card className="h-full cursor-pointer transition-colors hover:border-primary">
            <CardContent className="pt-5 text-center">
              <p className="text-3xl font-bold text-amber-500">{stats?.queueDepth ?? 0}</p>
              <p className="text-xs text-muted-foreground mt-1">In queue now</p>
            </CardContent>
          </Card>
        </Link>
        <Card>
          <CardContent className="pt-5 text-center">
            <p className="text-3xl font-bold text-green-500">{historyData.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Reviewed (30d)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 text-center">
            <p className="text-3xl font-bold">{stats?.avgResolutionMinutes?.toFixed(1) ?? "—"}</p>
            <p className="text-xs text-muted-foreground mt-1">Avg min/review</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

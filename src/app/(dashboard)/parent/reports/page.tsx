"use client";

import { useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/dashboard/ui/card";
import { Button } from "@/components/dashboard/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/dashboard/ui/select";
import { useParentReports, useParentChildren } from "@/lib/api/parent";
import { usePageTitle } from "@/lib/usePageTitle";

const COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ef4444"];

function MiniLineChart({
  data,
  color,
  label,
}: {
  data: number[];
  color: string;
  label: string;
}) {
  if (data.length === 0) return null;

  const width = 300;
  const height = 80;
  const padding = 8;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((v, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2);
    const y = padding + ((max - v) / range) * (height - padding * 2);
    return `${x},${y}`;
  });

  const polyline = points.join(" ");
  const lastPoint = points[points.length - 1].split(",");

  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        style={{ height: `${height}px` }}
        aria-hidden="true"
      >
        <polyline
          points={polyline}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <circle
          cx={lastPoint[0]}
          cy={lastPoint[1]}
          r="3"
          fill={color}
        />
      </svg>
      <div className="flex justify-between text-xs text-muted-foreground mt-1">
        <span>{data[0].toFixed(1)}</span>
        <span className="font-medium" style={{ color }}>{data[data.length - 1].toFixed(1)}</span>
      </div>
    </div>
  );
}

const RANGE_OPTIONS = [
  { value: "4w", label: "Last 4 weeks" },
  { value: "8w", label: "Last 8 weeks" },
  { value: "12w", label: "Last 12 weeks" },
];

export default function ParentReportsPage() {
  usePageTitle("Progress Reports");

  const [range, setRange] = useState("4w");
  const { data: reports, isLoading: reportsLoading, error: reportsError, refetch } = useParentReports(range);
  const { data: children } = useParentChildren();

  if (reportsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (reportsError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="h-10 w-10 text-red-500" />
        <p className="text-muted-foreground">Failed to load reports</p>
        <Button variant="outline" onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  const getChildName = (childId: string) =>
    children?.find((c) => c.id === childId)?.name ?? childId;

  // Slice data according to range selection
  const weeksMap: Record<string, number> = { "4w": 28, "8w": 56, "12w": 84 };
  const daysToShow = weeksMap[range] ?? 28;

  return (
    <div className="space-y-6 p-6 pb-20">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Progress Reports</h1>
          <p className="text-muted-foreground">Accuracy and study hours trends by child</p>
        </div>
        <Select value={range} onValueChange={setRange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RANGE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!reports || reports.children.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No report data available.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reports.children.map((childReport, i) => {
            const color = COLORS[i % COLORS.length];
            const accuracySlice = childReport.accuracyTrend.slice(-daysToShow);
            const hoursSlice = childReport.hoursTrend.slice(-daysToShow);

            return (
              <Card key={childReport.childId}>
                <CardHeader>
                  <CardTitle className="text-base" style={{ color }}>
                    {getChildName(childReport.childId)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <MiniLineChart
                    data={accuracySlice}
                    color={color}
                    label="Accuracy (%)"
                  />
                  <MiniLineChart
                    data={hoursSlice}
                    color={color}
                    label="Study hours"
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

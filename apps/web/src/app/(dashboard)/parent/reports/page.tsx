"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, AlertCircle, Download, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/dashboard/ui/card";
import { Button } from "@/components/dashboard/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/dashboard/ui/select";
import { toast } from "@/components/dashboard/ui/sonner";
import { useParentReports, useParentChildren } from "@/lib/api/parent";
import { usePageTitle } from "@/lib/usePageTitle";
import { ParentTrendChart } from "@/components/dashboard/parent/ParentTrendChart";

const COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ef4444"];

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

  const weeksMap: Record<string, number> = { "4w": 28, "8w": 56, "12w": 84 };
  const daysToShow = weeksMap[range] ?? 28;

  const hasData = !!reports && reports.children.length > 0;

  function handleExportCsv() {
    if (!hasData) return;
    try {
      const rangeLabel = RANGE_OPTIONS.find((o) => o.value === range)?.label ?? range;
      const escape = (s: string) => `"${s.replace(/"/g, '""')}"`;
      const lines: string[] = [];
      lines.push(`# Progress Report — ${rangeLabel}`);
      lines.push(`# Generated ${new Date().toISOString()}`);
      lines.push("Child,DayIndex,Accuracy(%),StudyHours");
      reports!.children.forEach((c) => {
        const name = escape(getChildName(c.childId));
        const accuracy = c.accuracyTrend.slice(-daysToShow);
        const hours = c.hoursTrend.slice(-daysToShow);
        const len = Math.max(accuracy.length, hours.length);
        for (let i = 0; i < len; i++) {
          lines.push(`${name},${i + 1},${accuracy[i] ?? ""},${hours[i] ?? ""}`);
        }
      });
      const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `progress-report-${range}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Export started");
    } catch {
      toast.error("Failed to export report");
    }
  }

  return (
    <div className="space-y-6 p-6 pb-20">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Progress Reports</h1>
          <p className="text-muted-foreground">Accuracy and study hours trends by child</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
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
          <Button
            variant="outline"
            onClick={handleExportCsv}
            disabled={!hasData}
            aria-label="Export progress report as CSV"
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {!hasData ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No report data available.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reports!.children.map((childReport, i) => {
            const color = COLORS[i % COLORS.length];
            const accuracySlice = childReport.accuracyTrend.slice(-daysToShow);
            const hoursSlice = childReport.hoursTrend.slice(-daysToShow);
            const childName = getChildName(childReport.childId);
            const hoursMax = Math.max(1, ...hoursSlice);
            const isEmpty = accuracySlice.length === 0 && hoursSlice.length === 0;

            return (
              <Card
                key={childReport.childId}
                className="transition-shadow hover:shadow-md focus-within:ring-2 focus-within:ring-ring"
              >
                <Link
                  href={`/parent/children/${childReport.childId}`}
                  className="block focus:outline-none"
                  aria-label={`View detailed report for ${childName}`}
                >
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base" style={{ color }}>
                      {childName}
                    </CardTitle>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {isEmpty ? (
                      <p className="text-sm text-muted-foreground py-6 text-center">
                        No data for this period yet.
                      </p>
                    ) : (
                      <>
                        <div>
                          <p className="mb-1 text-xs text-muted-foreground">Accuracy (%)</p>
                          <ParentTrendChart
                            data={accuracySlice}
                            dataKey="accuracy"
                            label="Accuracy"
                            color={color}
                            unit="%"
                            domain={[0, 100]}
                          />
                        </div>
                        <div>
                          <p className="mb-1 text-xs text-muted-foreground">Study hours per day</p>
                          <ParentTrendChart
                            data={hoursSlice}
                            dataKey="hours"
                            label="Study hours"
                            color={color}
                            unit="h"
                            domain={[0, Math.ceil(hoursMax)]}
                          />
                        </div>
                      </>
                    )}
                  </CardContent>
                </Link>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

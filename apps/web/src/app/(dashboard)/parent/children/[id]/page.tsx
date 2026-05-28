"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, AlertCircle, TrendingUp, TrendingDown, Minus, ArrowLeft, ChevronLeft, ChevronRight, BookOpen, Activity, Award, Target } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/dashboard/ui/card";
import { Button } from "@/components/dashboard/ui/button";
import { Badge } from "@/components/dashboard/ui/badge";
import { Progress } from "@/components/dashboard/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/dashboard/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/dashboard/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/dashboard/ui/select";
import { useParentChild, useParentWeeklyReport } from "@/lib/api/parent";
import { usePageTitle } from "@/lib/usePageTitle";
import type { MasteryEntry, TimelineEntry, WeakArea, WeeklyReport } from "@/lib/types/parent";

const TIMELINE_PAGE_SIZE = 10;

function TrendIcon({ trend }: { trend: MasteryEntry["trend"] }) {
  if (trend === "up") return <TrendingUp className="h-4 w-4 text-green-500" />;
  if (trend === "down") return <TrendingDown className="h-4 w-4 text-red-500" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
}

function StatTile({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  tone?: "default" | "good" | "warn";
}) {
  const toneClass =
    tone === "good" ? "text-green-600" : tone === "warn" ? "text-red-500" : "text-foreground";
  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
          {icon}
          <span>{label}</span>
        </div>
        <p className={`text-2xl font-bold ${toneClass}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

function OverviewTab({
  mastery,
  timeline,
  weakAreas,
}: {
  mastery: MasteryEntry[];
  timeline: TimelineEntry[];
  weakAreas: WeakArea[];
}) {
  const totalSubjects = mastery.length;
  const avgMastery = totalSubjects
    ? Math.round(mastery.reduce((s, m) => s + m.score, 0) / totalSubjects)
    : 0;
  const improvingCount = mastery.filter((m) => m.trend === "up").length;

  const sortedByScore = [...mastery].sort((a, b) => b.score - a.score);
  const strongest = sortedByScore[0];
  const needsFocus =
    mastery.find((m) => m.trend === "down") ?? sortedByScore[sortedByScore.length - 1];
  const showDistinctFocus = needsFocus && strongest && needsFocus.subject !== strongest.subject;

  const recentActivity = timeline.slice(0, 3);
  const topWeakAreas = weakAreas.slice(0, 3);

  return (
    <div className="space-y-4">
      {/* Stat tiles — quick snapshot */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatTile
          icon={<BookOpen className="h-3.5 w-3.5" />}
          label="Subjects"
          value={totalSubjects}
        />
        <StatTile
          icon={<Award className="h-3.5 w-3.5" />}
          label="Avg Mastery"
          value={`${avgMastery}%`}
        />
        <StatTile
          icon={<TrendingUp className="h-3.5 w-3.5" />}
          label="Improving"
          value={improvingCount}
          tone="good"
        />
        <StatTile
          icon={<Target className="h-3.5 w-3.5" />}
          label="Areas to Watch"
          value={weakAreas.length}
          tone={weakAreas.length > 0 ? "warn" : "default"}
        />
      </div>

      {/* Strongest + Needs Focus highlights */}
      {strongest && (
        <div className={`grid grid-cols-1 ${showDistinctFocus ? "sm:grid-cols-2" : ""} gap-4`}>
          <Card className="border-l-4 border-l-green-500 bg-green-500/10 dark:bg-green-500/15">
            <CardContent className="pt-5">
              <div className="flex items-center gap-2 text-xs font-medium text-green-700 dark:text-green-300 mb-1">
                <Award className="h-3.5 w-3.5" />
                <span>Strongest</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold">{strongest.subject}</span>
                <div className="flex items-center gap-1">
                  <TrendIcon trend={strongest.trend} />
                  <span className="font-bold text-green-700 dark:text-green-300">{strongest.score}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
          {showDistinctFocus && needsFocus && (
            <Card className="border-l-4 border-l-red-500 bg-red-500/10 dark:bg-red-500/15">
              <CardContent className="pt-5">
                <div className="flex items-center gap-2 text-xs font-medium text-red-600 dark:text-red-300 mb-1">
                  <Target className="h-3.5 w-3.5" />
                  <span>Needs Focus</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{needsFocus.subject}</span>
                  <div className="flex items-center gap-1">
                    <TrendIcon trend={needsFocus.trend} />
                    <span className="font-bold text-red-600 dark:text-red-300">{needsFocus.score}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Top weak topics — quick scan */}
      {topWeakAreas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4 text-red-500" />
              Top Areas Needing Attention
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {topWeakAreas.map((w) => (
              <div key={w.topic} className="flex items-center justify-between text-sm">
                <span>{w.topic}</span>
                <Badge variant="destructive">{Math.round(w.errorRate * 100)}% error rate</Badge>
              </div>
            ))}
            {weakAreas.length > topWeakAreas.length && (
              <p className="text-xs text-muted-foreground pt-1">
                +{weakAreas.length - topWeakAreas.length} more — see Mastery tab for full list.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent activity preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <p className="text-muted-foreground text-sm">No recent activity.</p>
          ) : (
            <ul className="space-y-2">
              {recentActivity.map((entry, i) => (
                <li
                  key={`${i}-${entry.date}`}
                  className="flex items-center justify-between text-sm border-b last:border-b-0 pb-2 last:pb-0"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{entry.activity}</span>
                    <span className="text-xs text-muted-foreground">
                      {entry.subject} · {entry.date}
                    </span>
                  </div>
                  <Badge
                    variant={
                      entry.scorePct >= 75
                        ? "default"
                        : entry.scorePct >= 60
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {entry.scorePct}%
                  </Badge>
                </li>
              ))}
            </ul>
          )}
          {timeline.length > recentActivity.length && (
            <p className="text-xs text-muted-foreground pt-3">
              See Timeline tab for full history ({timeline.length} entries).
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MasteryTab({ mastery, weakAreas }: { mastery: MasteryEntry[]; weakAreas: WeakArea[] }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Subject Mastery</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mastery.map((m) => (
            <div key={m.subject} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendIcon trend={m.trend} />
                  <span className="font-medium text-sm">{m.subject}</span>
                </div>
                <span className="text-sm font-bold">{m.score}%</span>
              </div>
              <Progress value={m.score} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Weak Areas</CardTitle>
        </CardHeader>
        <CardContent>
          {weakAreas.length === 0 ? (
            <p className="text-muted-foreground text-sm">No weak areas identified.</p>
          ) : (
            <div className="space-y-3">
              {weakAreas.map((w) => (
                <div key={w.topic} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{w.topic}</span>
                    <span className="text-red-500 font-medium">{Math.round(w.errorRate * 100)}% error rate</span>
                  </div>
                  <Progress value={w.errorRate * 100} className="h-1.5 [&>div]:bg-red-400" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function TimelineTab({ timeline }: { timeline: TimelineEntry[] }) {
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [page, setPage] = useState(1);

  const subjects = useMemo(
    () => Array.from(new Set(timeline.map((e) => e.subject))).sort(),
    [timeline]
  );

  const filtered = useMemo(
    () => (subjectFilter === "all" ? timeline : timeline.filter((e) => e.subject === subjectFilter)),
    [timeline, subjectFilter]
  );

  useEffect(() => {
    setPage(1);
  }, [subjectFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / TIMELINE_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * TIMELINE_PAGE_SIZE;
  const visible = filtered.slice(startIdx, startIdx + TIMELINE_PAGE_SIZE);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-base">Activity Timeline</CardTitle>
          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No activity matches your filter.</p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((entry, i) => (
                  <TableRow key={`${startIdx + i}-${entry.date}`}>
                    <TableCell className="text-muted-foreground text-sm">{entry.date}</TableCell>
                    <TableCell>{entry.subject}</TableCell>
                    <TableCell>{entry.activity}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={entry.scorePct >= 75 ? "default" : entry.scorePct >= 60 ? "secondary" : "destructive"}>
                        {entry.scorePct}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {startIdx + 1}–{Math.min(startIdx + TIMELINE_PAGE_SIZE, filtered.length)} of {filtered.length}
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
  );
}

function WeeklyTab({
  report,
  error,
  onRetry,
}: {
  report: WeeklyReport | undefined;
  error: unknown;
  onRetry: () => void;
}) {
  if (error) {
    return (
      <Card>
        <CardContent className="py-12 flex flex-col items-center justify-center gap-3">
          <AlertCircle className="h-10 w-10 text-red-500" />
          <p className="text-muted-foreground">Failed to load weekly report</p>
          <Button variant="outline" onClick={onRetry}>Retry</Button>
        </CardContent>
      </Card>
    );
  }

  if (!report) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No weekly report available.
        </CardContent>
      </Card>
    );
  }

  const days = Object.entries(report.minutesByDay);
  const maxMinutes = Math.max(...days.map(([, v]) => v), 1);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Week of {report.weekOf}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{report.questionsAttempted}</p>
              <p className="text-xs text-muted-foreground">Questions attempted</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{report.accuracyPct}%</p>
              <p className="text-xs text-muted-foreground">Accuracy</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{report.topicsImproved.length}</p>
              <p className="text-xs text-muted-foreground">Topics improved</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-500">{report.topicsRegressed.length}</p>
              <p className="text-xs text-muted-foreground">Topics regressed</p>
            </div>
          </div>

          {/* Daily minutes bar chart */}
          <div>
            <p className="text-sm font-medium mb-3">Daily Study Minutes</p>
            <div className="flex items-end gap-2 h-24">
              {days.map(([day, mins]) => (
                <div key={day} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-primary/80 rounded-t"
                    style={{ height: `${(mins / maxMinutes) * 80}px`, minHeight: mins > 0 ? 4 : 0 }}
                  />
                  <span className="text-xs text-muted-foreground">{day.slice(0, 2)}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-green-600">Topics Improved</CardTitle>
          </CardHeader>
          <CardContent>
            {report.topicsImproved.length === 0 ? (
              <p className="text-muted-foreground text-sm">None this week</p>
            ) : (
              <ul className="space-y-1">
                {report.topicsImproved.map((t) => (
                  <li key={t} className="text-sm flex items-center gap-2">
                    <TrendingUp className="h-3 w-3 text-green-500 shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-red-500">Topics Regressed</CardTitle>
          </CardHeader>
          <CardContent>
            {report.topicsRegressed.length === 0 ? (
              <p className="text-muted-foreground text-sm">None this week</p>
            ) : (
              <ul className="space-y-1">
                {report.topicsRegressed.map((t) => (
                  <li key={t} className="text-sm flex items-center gap-2">
                    <TrendingDown className="h-3 w-3 text-red-500 shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ChildDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;

  const { data: child, isLoading: childLoading, error: childError, refetch } = useParentChild(id);
  const {
    data: weeklyReport,
    isLoading: weeklyLoading,
    error: weeklyError,
    refetch: refetchWeekly,
  } = useParentWeeklyReport(id);

  usePageTitle(child ? `${child.name} — Details` : "Child Details");

  if (childLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (childError || !child) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="h-10 w-10 text-red-500" />
        <p className="text-muted-foreground">Failed to load child details</p>
        <Button variant="outline" onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 pb-20">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/parent/children">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{child.name}</h1>
          <p className="text-muted-foreground">{child.grade}</p>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="mastery">Mastery</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="weekly">Weekly Digest</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <OverviewTab mastery={child.mastery} timeline={child.timeline} weakAreas={child.weakAreas} />
        </TabsContent>

        <TabsContent value="mastery" className="mt-4">
          <MasteryTab mastery={child.mastery} weakAreas={child.weakAreas} />
        </TabsContent>

        <TabsContent value="timeline" className="mt-4">
          <TimelineTab timeline={child.timeline} />
        </TabsContent>

        <TabsContent value="weekly" className="mt-4">
          {weeklyLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <WeeklyTab report={weeklyReport} error={weeklyError} onRetry={() => refetchWeekly()} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

"use client";

import { Loader2, AlertCircle, TrendingUp, TrendingDown, Minus, ArrowLeft } from "lucide-react";
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
import { useParentChild, useParentWeeklyReport } from "@/lib/api/parent";
import { usePageTitle } from "@/lib/usePageTitle";
import type { MasteryEntry, TimelineEntry, WeakArea, WeeklyReport } from "@/lib/types/parent";

function TrendIcon({ trend }: { trend: MasteryEntry["trend"] }) {
  if (trend === "up") return <TrendingUp className="h-4 w-4 text-green-500" />;
  if (trend === "down") return <TrendingDown className="h-4 w-4 text-red-500" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
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
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Activity Timeline</CardTitle>
      </CardHeader>
      <CardContent>
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
            {timeline.map((entry, i) => (
              <TableRow key={i}>
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
      </CardContent>
    </Card>
  );
}

function WeeklyTab({ report }: { report: WeeklyReport | undefined; loading: boolean }) {
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
  const { data: weeklyReport, isLoading: weeklyLoading } = useParentWeeklyReport(id);

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

        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {child.mastery.map((m) => (
              <Card key={m.subject}>
                <CardContent className="pt-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{m.subject}</span>
                    <div className="flex items-center gap-1">
                      <TrendIcon trend={m.trend} />
                      <span className="font-bold">{m.score}%</span>
                    </div>
                  </div>
                  <Progress value={m.score} className="h-2" />
                </CardContent>
              </Card>
            ))}
          </div>
          {child.weakAreas.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Areas Needing Attention</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {child.weakAreas.map((w) => (
                  <div key={w.topic} className="flex items-center justify-between text-sm">
                    <span>{w.topic}</span>
                    <Badge variant="destructive">{Math.round(w.errorRate * 100)}% error rate</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
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
            <WeeklyTab report={weeklyReport} loading={weeklyLoading} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

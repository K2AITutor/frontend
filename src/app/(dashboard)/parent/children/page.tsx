"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Loader2, AlertCircle, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/dashboard/ui/card";
import { Button } from "@/components/dashboard/ui/button";
import { Input } from "@/components/dashboard/ui/input";
import { Badge } from "@/components/dashboard/ui/badge";
import { Progress } from "@/components/dashboard/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/dashboard/ui/avatar";
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
import { useParentChildren } from "@/lib/api/parent";
import { usePageTitle } from "@/lib/usePageTitle";

const PAGE_SIZE = 10;

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function formatLastActive(iso: string) {
  return new Date(iso).toLocaleDateString("en-AU", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ParentChildrenPage() {
  usePageTitle("My Children");

  const { data: children, isLoading, error, refetch } = useParentChildren();
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [search, gradeFilter]);

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
        <p className="text-muted-foreground">Failed to load children</p>
        <Button variant="outline" onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  const grades = Array.from(new Set(children?.map((c) => c.grade) ?? []));

  const filtered = (children ?? []).filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchesGrade = gradeFilter === "all" || c.grade === gradeFilter;
    return matchesSearch && matchesGrade;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * PAGE_SIZE;
  const visible = filtered.slice(startIdx, startIdx + PAGE_SIZE);

  return (
    <div className="space-y-6 p-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Children</h1>
        <p className="text-muted-foreground">View and manage your children&apos;s accounts</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={gradeFilter} onValueChange={setGradeFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter by grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                {grades.map((g) => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No children match your filter.</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Subjects</TableHead>
                    <TableHead>Weekly Activity</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead>Alerts</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visible.map((child) => (
                    <TableRow key={child.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            {child.avatarUrl ? (
                              <AvatarImage src={child.avatarUrl} alt={child.name} />
                            ) : null}
                            <AvatarFallback className="text-xs">{initials(child.name)}</AvatarFallback>
                          </Avatar>
                          <span>{child.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{child.grade}</TableCell>
                      <TableCell>
                        <div className="space-y-1 min-w-[160px]">
                          {child.currentSubjects.map((s) => (
                            <div key={s.code} className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground truncate w-28">{s.name}</span>
                              <Progress value={s.mastery} className="h-1.5 flex-1" />
                              <span className="text-xs font-medium w-8 text-right">{s.mastery}%</span>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{child.weeklyMinutes} min</TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {formatLastActive(child.lastActiveAt)}
                      </TableCell>
                      <TableCell>
                        {child.alertCount > 0 ? (
                          <Badge variant="destructive">{child.alertCount}</Badge>
                        ) : (
                          <Badge variant="secondary">0</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/parent/children/${child.id}`}>View</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

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
    </div>
  );
}

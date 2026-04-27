"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2, AlertCircle, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/dashboard/ui/card";
import { Button } from "@/components/dashboard/ui/button";
import { Input } from "@/components/dashboard/ui/input";
import { Badge } from "@/components/dashboard/ui/badge";
import { Progress } from "@/components/dashboard/ui/progress";
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

export default function ParentChildrenPage() {
  usePageTitle("My Children");

  const { data: children, isLoading, error, refetch } = useParentChildren();
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("all");

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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Subjects</TableHead>
                  <TableHead>Weekly Activity</TableHead>
                  <TableHead>Alerts</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((child) => (
                  <TableRow key={child.id}>
                    <TableCell className="font-medium">{child.name}</TableCell>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}

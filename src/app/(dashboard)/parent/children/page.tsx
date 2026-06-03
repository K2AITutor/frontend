"use client";

import Link from "next/link";
import { Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/dashboard/ui/card";
import { Button } from "@/components/dashboard/ui/button";
import { Badge } from "@/components/dashboard/ui/badge";
import { Progress } from "@/components/dashboard/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/dashboard/ui/avatar";
import { DataTable, SortHeader } from "@/components/dashboard/DataTable";
import { createColumnHelper } from "@tanstack/react-table";
import { useParentChildren } from "@/lib/api/parent";
import { usePageTitle } from "@/lib/usePageTitle";
import type { ParentChild } from "@/lib/types/parent";

const columnHelper = createColumnHelper<ParentChild>();

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

  const columns = [
    columnHelper.accessor("name", {
      header: SortHeader("Name"),
      cell: (info) => {
        const child = info.row.original;
        return (
          <div className="flex items-center gap-3 font-medium">
            <Avatar className="h-8 w-8">
              {child.avatarUrl ? <AvatarImage src={child.avatarUrl} alt={child.name} /> : null}
              <AvatarFallback className="text-xs">{initials(child.name)}</AvatarFallback>
            </Avatar>
            <span>{child.name}</span>
          </div>
        );
      },
    }),
    columnHelper.accessor("grade", {
      header: SortHeader("Grade"),
      enableGlobalFilter: false,
    }),
    columnHelper.display({
      id: "subjects",
      header: "Subjects",
      enableSorting: false,
      cell: (info) => (
        <div className="min-w-[160px] space-y-1">
          {info.row.original.currentSubjects.map((s) => (
            <div key={s.code} className="flex items-center gap-2">
              <span className="w-28 truncate text-xs text-muted-foreground">{s.name}</span>
              <Progress value={s.mastery} className="h-1.5 flex-1" />
              <span className="w-8 text-right text-xs font-medium">{s.mastery}%</span>
            </div>
          ))}
        </div>
      ),
    }),
    columnHelper.accessor("weeklyMinutes", {
      header: SortHeader("Weekly Activity"),
      enableGlobalFilter: false,
      cell: (info) => `${info.getValue()} min`,
    }),
    columnHelper.accessor("lastActiveAt", {
      header: SortHeader("Last Active"),
      enableGlobalFilter: false,
      cell: (info) => (
        <span className="whitespace-nowrap text-sm text-muted-foreground">
          {formatLastActive(info.getValue())}
        </span>
      ),
    }),
    columnHelper.accessor("alertCount", {
      header: SortHeader("Alerts"),
      enableGlobalFilter: false,
      cell: (info) =>
        info.getValue() > 0 ? (
          <Badge variant="destructive">{info.getValue()}</Badge>
        ) : (
          <Badge variant="secondary">0</Badge>
        ),
    }),
    columnHelper.display({
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      enableSorting: false,
      cell: (info) => (
        <Button asChild size="sm" variant="outline">
          <Link href={`/parent/children/${info.row.original.id}`}>View</Link>
        </Button>
      ),
    }),
  ];

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

  return (
    <div className="space-y-6 p-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Children</h1>
        <p className="text-muted-foreground">View and manage your children&apos;s accounts</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <DataTable
            columns={columns}
            data={children ?? []}
            searchPlaceholder="Search by name..."
            filters={[
              {
                id: "grade",
                label: "Filter by grade",
                options: [
                  { label: "All Grades", value: "all" },
                  ...grades.map((g) => ({ label: g, value: g })),
                ],
              },
            ]}
            emptyMessage="No children match your filter."
          />
        </CardContent>
      </Card>
    </div>
  );
}

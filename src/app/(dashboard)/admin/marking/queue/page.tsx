"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/dashboard/ui/card";
import { Badge } from "@/components/dashboard/ui/badge";
import { Button } from "@/components/dashboard/ui/button";
import { DataTable, SortHeader } from "@/components/dashboard/DataTable";
import { createColumnHelper } from "@tanstack/react-table";
import { Loader2, AlertCircle, Inbox, Download } from "lucide-react";
import { useAnnotations, type Annotation } from "@/lib/api/admin-marking";
import { AnnotationDrawer } from "@/components/marking/AnnotationDrawer";

const columnHelper = createColumnHelper<Annotation>();

function withinDays(iso: string, days: number) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return new Date(iso) >= cutoff;
}

function exportCSV(rows: Annotation[]) {
  const headers = ["Annotation ID", "Teacher", "Attempt", "Agreement", "Error Tags", "Created"];
  const body = rows.map((a) => [
    a.id,
    a.teacherName,
    a.attemptId,
    a.agreementWithModel ? "Agreed" : "Overridden",
    a.errorTags.join("; "),
    new Date(a.createdAt).toLocaleDateString(),
  ]);
  const csv = [headers, ...body]
    .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "annotations.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function AdminMarkingQueuePage() {
  const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | null>(null);
  const [visibleRows, setVisibleRows] = useState<Annotation[]>([]);

  const { data, isLoading, error, refetch } = useAnnotations();

  const columns = [
    columnHelper.accessor("id", {
      header: SortHeader("Annotation ID"),
      enableGlobalFilter: false,
      cell: (info) => <span className="font-mono text-xs">{info.getValue()}</span>,
    }),
    columnHelper.accessor("teacherName", {
      header: SortHeader("Teacher"),
    }),
    columnHelper.accessor("attemptId", {
      header: SortHeader("Attempt"),
      enableGlobalFilter: false,
      cell: (info) => <span className="font-mono text-xs">{info.getValue()}</span>,
    }),
    columnHelper.accessor("agreementWithModel", {
      header: SortHeader("Agreement"),
      enableGlobalFilter: false,
      cell: (info) => (
        <Badge variant={info.getValue() ? "default" : "destructive"}>
          {info.getValue() ? "Agreed" : "Overridden"}
        </Badge>
      ),
    }),
    columnHelper.accessor("errorTags", {
      header: "Error Tags",
      enableGlobalFilter: false,
      enableSorting: false,
      cell: (info) => {
        const tags = info.getValue();
        return (
          <div className="flex flex-wrap gap-1">
            {tags.length === 0 ? (
              <span className="text-muted-foreground text-xs">—</span>
            ) : (
              tags.map((t) => (
                <Badge key={t} variant="outline" className="text-xs">
                  {t}
                </Badge>
              ))
            )}
          </div>
        );
      },
    }),
    columnHelper.accessor("createdAt", {
      header: SortHeader("Created"),
      enableGlobalFilter: false,
      cell: (info) => (
        <span className="text-xs text-muted-foreground">
          {new Date(info.getValue()).toLocaleDateString()}
        </span>
      ),
    }),
    columnHelper.display({
      id: "action",
      header: () => <span className="sr-only">Action</span>,
      enableSorting: false,
      cell: (info) => (
        <Button variant="outline" size="sm" onClick={() => setSelectedAnnotation(info.row.original)}>
          View
        </Button>
      ),
    }),
  ];

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="h-10 w-10 text-red-500" />
        <p className="text-muted-foreground">Failed to load annotation queue</p>
        <Button variant="outline" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );

  return (
    <div className="space-y-6 p-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Annotation Queue</h1>
        <p className="text-muted-foreground">
          Cross-organisation view of completed teacher annotations.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Inbox className="h-4 w-4" />
            Annotations ({visibleRows.length}{data && visibleRows.length !== data.length ? ` of ${data.length}` : ""})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={data ?? []}
            searchPlaceholder="Filter by teacher name..."
            initialPageSize={25}
            pageSizeOptions={[10, 25, 50, 100]}
            onFilteredDataChange={setVisibleRows}
            emptyMessage="No annotations found."
            filters={[
              {
                id: "agreementWithModel",
                label: "Agreement",
                options: [
                  { label: "All outcomes", value: "all" },
                  { label: "Agreed only", value: "agreed" },
                  { label: "Overridden only", value: "overridden" },
                ],
                predicate: (row: Annotation, v) =>
                  v === "agreed" ? row.agreementWithModel : !row.agreementWithModel,
              },
              {
                id: "createdAt",
                label: "Date range",
                options: [
                  { label: "All time", value: "all" },
                  { label: "Last 7 days", value: "7d" },
                  { label: "Last 30 days", value: "30d" },
                  { label: "Last 90 days", value: "90d" },
                ],
                predicate: (row: Annotation, v) =>
                  withinDays(row.createdAt, v === "7d" ? 7 : v === "30d" ? 30 : 90),
              },
            ]}
            toolbarActions={
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportCSV(visibleRows)}
                disabled={visibleRows.length === 0}
              >
                <Download className="mr-1.5 h-3.5 w-3.5" />
                Export CSV
              </Button>
            }
          />
        </CardContent>
      </Card>
      <AnnotationDrawer
        annotation={selectedAnnotation}
        onClose={() => setSelectedAnnotation(null)}
      />
    </div>
  );
}

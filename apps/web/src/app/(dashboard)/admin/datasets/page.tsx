"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/dashboard/ui/card";
import { Badge } from "@/components/dashboard/ui/badge";
import { Button } from "@/components/dashboard/ui/button";
import { Input } from "@/components/dashboard/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/dashboard/ui/dialog";
import { DataTable, SortHeader } from "@/components/dashboard/DataTable";
import { createColumnHelper } from "@tanstack/react-table";
import { toast } from "@/components/dashboard/ui/sonner";
import { Loader2, AlertCircle, Plus, ExternalLink, Database } from "lucide-react";
import { useDatasets, useBuildDataset } from "@/lib/api/admin-datasets";
import type { DatasetStatus, DatasetVersion } from "@/lib/types/dataset";

const STATUS_VARIANT: Record<
  DatasetStatus,
  "default" | "secondary" | "outline"
> = {
  ready: "default",
  building: "secondary",
  archived: "outline",
};

const columnHelper = createColumnHelper<DatasetVersion>();

export default function AdminDatasetsPage() {
  const { data, isLoading, error, refetch } = useDatasets();
  const build = useBuildDataset();

  const [buildDialog, setBuildDialog] = useState(false);
  const [form, setForm] = useState({
    name: "",
    fromDate: "",
    toDate: "",
    includeOnlyAgreed: false,
  });

  function handleBuild() {
    if (!form.name || !form.fromDate || !form.toDate) {
      toast.error("Please fill in all required fields");
      return;
    }
    build.mutate(form, {
      onSuccess: (res) => {
        toast.success(`Dataset build started (job: ${res.jobId})`);
        setBuildDialog(false);
        setForm({ name: "", fromDate: "", toDate: "", includeOnlyAgreed: false });
      },
      onError: () => toast.error("Failed to start dataset build"),
    });
  }

  const columns = [
      columnHelper.accessor("name", {
        header: SortHeader("Name"),
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
      }),
      columnHelper.accessor("version", {
        header: SortHeader("Version"),
        enableGlobalFilter: false,
        cell: (info) => <span className="font-mono text-xs">v{info.getValue()}</span>,
      }),
      columnHelper.accessor("status", {
        header: SortHeader("Status"),
        enableGlobalFilter: false,
        cell: (info) => {
          const status = info.getValue();
          return (
            <Badge variant={STATUS_VARIANT[status]} className="capitalize">
              {status === "building" && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
              {status}
            </Badge>
          );
        },
      }),
      columnHelper.accessor("rowCount", {
        header: SortHeader("Rows"),
        enableGlobalFilter: false,
        cell: (info) => info.getValue().toLocaleString(),
      }),
      columnHelper.accessor("builtBy", {
        header: SortHeader("Built By"),
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
        cell: (info) => {
          const ds = info.row.original;
          return (
            <Button
              variant="outline"
              size="sm"
              disabled={ds.status !== "ready"}
              asChild={ds.status === "ready"}
            >
              {ds.status === "ready" ? (
                <Link href={`/admin/datasets/${ds.id}`}>
                  <ExternalLink className="mr-1 h-3.5 w-3.5" />
                  Browse
                </Link>
              ) : (
                <span>
                  <ExternalLink className="mr-1 h-3.5 w-3.5" />
                  Browse
                </span>
              )}
            </Button>
          );
        },
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
        <p className="text-muted-foreground">Failed to load datasets</p>
        <Button variant="outline" onClick={() => refetch()}>Retry</Button>
      </div>
    );

  return (
    <div className="space-y-6 p-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Datasets</h1>
        <p className="text-muted-foreground">
          Training datasets built from teacher annotations.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Dataset Versions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={data ?? []}
            searchPlaceholder="Search datasets..."
            filters={[
              {
                id: "status",
                label: "Status",
                options: [
                  { label: "All Statuses", value: "all" },
                  { label: "Ready", value: "ready" },
                  { label: "Building", value: "building" },
                  { label: "Archived", value: "archived" },
                ],
              },
            ]}
            emptyMessage="No datasets yet."
            toolbarActions={
              <Button onClick={() => setBuildDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Build New Dataset
              </Button>
            }
          />
        </CardContent>
      </Card>

      <Dialog open={buildDialog} onOpenChange={setBuildDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Build New Dataset</DialogTitle>
            <DialogDescription>
              Create a training dataset from teacher annotation data within the specified
              date range.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Dataset Name *</label>
              <Input
                placeholder="e.g. MathMethods-2026-Q2"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">From Date *</label>
                <Input
                  type="date"
                  value={form.fromDate}
                  onChange={(e) => setForm({ ...form, fromDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">To Date *</label>
                <Input
                  type="date"
                  value={form.toDate}
                  onChange={(e) => setForm({ ...form, toDate: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="includeOnlyAgreed"
                checked={form.includeOnlyAgreed}
                onChange={(e) =>
                  setForm({ ...form, includeOnlyAgreed: e.target.checked })
                }
                className="h-4 w-4 accent-primary"
              />
              <label htmlFor="includeOnlyAgreed" className="text-sm cursor-pointer">
                Include only teacher-agreed annotations
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBuildDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleBuild}
              disabled={
                build.isPending || !form.name || !form.fromDate || !form.toDate
              }
            >
              {build.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Start Build
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

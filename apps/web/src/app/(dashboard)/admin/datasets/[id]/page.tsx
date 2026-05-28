"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
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
import { Loader2, AlertCircle, ChevronLeft, Download } from "lucide-react";
import { useDatasets, useDatasetRows } from "@/lib/api/admin-datasets";
import type { SplitFilter } from "@/lib/api/admin-datasets";
import { useAdminToken } from "@/lib/api/useAdminToken";
import { DatasetRowTable } from "@/components/marking/DatasetRowTable";

function getApiBase() {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";
  const clean = String(raw).replace(/\/+$/, "");
  return clean.endsWith("/api") ? clean : `${clean}/api`;
}

export default function AdminDatasetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const token = useAdminToken();
  const [page, setPage] = useState(1);
  const [splitFilter, setSplitFilter] = useState<SplitFilter>("all");

  const { data: datasets } = useDatasets();
  const { data, isLoading, error, refetch } = useDatasetRows(id, page, splitFilter);

  const dataset = datasets?.find((d) => d.id === id);

  async function handleExport() {
    if (!token) {
      toast.error("Admin session is not ready");
      return;
    }
    const url = `${getApiBase()}/admin/datasets/${id}/export?format=jsonl`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
      cache: "no-store",
    });
    if (!res.ok) {
      toast.error("Failed to export dataset");
      return;
    }
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = `${dataset?.name ?? id}.jsonl`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl);
    toast.success("Export started");
  }

  function handleSplitChange(value: string) {
    setSplitFilter(value as SplitFilter);
    setPage(1);
  }

  if (error)
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="h-10 w-10 text-red-500" />
        <p className="text-muted-foreground">Failed to load dataset rows</p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>Retry</Button>
          <Button variant="outline" asChild>
            <Link href="/admin/datasets">Back to Datasets</Link>
          </Button>
        </div>
      </div>
    );

  return (
    <div className="space-y-6 p-6 pb-20">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/datasets">
            <ChevronLeft className="h-4 w-4" />
            Datasets
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {dataset?.name ?? id}
          </h1>
          {dataset && (
            <p className="text-sm text-muted-foreground">
              v{dataset.version} · {dataset.rowCount.toLocaleString()} rows · Built
              by {dataset.builtBy}
            </p>
          )}
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export JSONL
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Rows</CardTitle>
          <Select value={splitFilter} onValueChange={handleSplitChange}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="All Splits" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Splits</SelectItem>
              <SelectItem value="train">Train</SelectItem>
              <SelectItem value="val">Validation</SelectItem>
              <SelectItem value="test">Test</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <DatasetRowTable
            rows={data?.rows ?? []}
            total={data?.total ?? 0}
            page={page}
            pageSize={10}
            loading={isLoading}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>
    </div>
  );
}

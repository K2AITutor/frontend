"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/dashboard/ui/card";
import { Badge } from "@/components/dashboard/ui/badge";
import { Button } from "@/components/dashboard/ui/button";
import { Input } from "@/components/dashboard/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/dashboard/ui/select";
import { DataTable, SortHeader } from "@/components/dashboard/DataTable";
import { createColumnHelper } from "@tanstack/react-table";
import { Loader2, AlertCircle, Cpu } from "lucide-react";
import { useModels } from "@/lib/api/admin-models";
import { ModelSheet } from "@/components/marking/ModelSheet";
import type { ModelFamily, DeploymentStatus, ModelVersion } from "@/lib/types/model";

const STATUS_VARIANT: Record<
  DeploymentStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  production: "default",
  staging: "secondary",
  archived: "outline",
  retired: "destructive",
};

const FAMILY_LABEL: Record<ModelFamily, string> = {
  rule: "Rule Engine",
  llm: "LLM",
  ml: "Machine Learning",
};

const FAMILY_ORDER: ModelFamily[] = ["rule", "llm", "ml"];

const columnHelper = createColumnHelper<ModelVersion>();

export default function AdminModelsPage() {
  const { data, isLoading, error, refetch } = useModels();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | DeploymentStatus>("all");
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data ?? []).filter((m) => {
      const matchSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.version.toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || m.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [data, search, statusFilter]);

  // Group once per filter change so each family's array keeps a stable
  // reference across unrelated re-renders (e.g. opening the detail sheet) —
  // that lets each DataTable preserve its own page while filtering still resets it.
  const byFamily = useMemo(() => {
    const groups = { rule: [], llm: [], ml: [] } as Record<ModelFamily, ModelVersion[]>;
    for (const m of filtered) groups[m.family].push(m);
    return groups;
  }, [filtered]);

  const familyCounts = useMemo(() => {
    const counts = { rule: 0, llm: 0, ml: 0 } as Record<ModelFamily, number>;
    for (const m of data ?? []) counts[m.family]++;
    return counts;
  }, [data]);

  const columns = [
    columnHelper.accessor("name", {
      header: SortHeader("Name"),
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    }),
    columnHelper.accessor("version", {
      header: SortHeader("Version"),
      cell: (info) => <span className="font-mono text-xs">{info.getValue()}</span>,
    }),
    columnHelper.accessor("status", {
      header: SortHeader("Status"),
      cell: (info) => (
        <Badge variant={STATUS_VARIANT[info.getValue()]} className="capitalize">
          {info.getValue()}
        </Badge>
      ),
    }),
    columnHelper.accessor("accuracyPct", {
      header: SortHeader("Accuracy"),
      cell: (info) => `${info.getValue()}%`,
    }),
    columnHelper.accessor("agreementWithTeacherPct", {
      header: SortHeader("Teacher Agreement"),
      cell: (info) => `${info.getValue()}%`,
    }),
    columnHelper.accessor("deployedAt", {
      header: SortHeader("Deployed"),
      cell: (info) => (
        <span className="text-xs text-muted-foreground">
          {info.getValue() ? new Date(info.getValue()!).toLocaleDateString() : "—"}
        </span>
      ),
    }),
    columnHelper.display({
      id: "action",
      header: () => <span className="sr-only">Action</span>,
      enableSorting: false,
      cell: (info) => (
        <Button variant="outline" size="sm" onClick={() => setSelectedModelId(info.row.original.id)}>
          Detail
        </Button>
      ),
    }),
  ];

  const hasFilters = !!search.trim() || statusFilter !== "all";

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
        <p className="text-muted-foreground">Failed to load models</p>
        <Button variant="outline" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );

  return (
    <div className="space-y-6 p-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Model Registry</h1>
        <p className="text-muted-foreground">
          Manage marking model versions and deployments.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search by name or version..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="production">Production</SelectItem>
            <SelectItem value="staging">Staging</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
            <SelectItem value="retired">Retired</SelectItem>
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearch("");
              setStatusFilter("all");
            }}
          >
            Clear filters
          </Button>
        )}
      </div>

      {FAMILY_ORDER.map((family) => {
        const familyFiltered = byFamily[family];
        const familyAll = familyCounts[family];

        return (
          <Card key={family}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Cpu className="h-4 w-4" />
                {FAMILY_LABEL[family]}
                <span className="text-xs font-normal text-muted-foreground ml-1">
                  {familyFiltered.length}
                  {familyAll !== familyFiltered.length ? ` of ${familyAll}` : ""}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={familyFiltered}
                enableSearch={false}
                initialPageSize={5}
                emptyMessage={
                  hasFilters && familyAll > 0
                    ? "No models match the current filters."
                    : "No models in this family."
                }
              />
            </CardContent>
          </Card>
        );
      })}

      <ModelSheet
        modelId={selectedModelId}
        onClose={() => setSelectedModelId(null)}
      />
    </div>
  );
}

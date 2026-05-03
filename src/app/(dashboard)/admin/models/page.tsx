"use client";

import { useState, useMemo, useEffect } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/dashboard/ui/table";
import {
  Loader2,
  AlertCircle,
  Cpu,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useModels } from "@/lib/api/admin-models";
import { ModelSheet } from "@/components/marking/ModelSheet";
import type { ModelFamily, DeploymentStatus } from "@/lib/types/model";

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
const PAGE_SIZE = 5;

export default function AdminModelsPage() {
  const { data, isLoading, error, refetch } = useModels();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | DeploymentStatus>("all");
  const [pages, setPages] = useState<Record<ModelFamily, number>>({
    rule: 1,
    llm: 1,
    ml: 1,
  });
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);

  useEffect(() => {
    setPages({ rule: 1, llm: 1, ml: 1 });
  }, [search, statusFilter]);

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
        const familyAll = (data ?? []).filter((m) => m.family === family);
        const familyFiltered = filtered.filter((m) => m.family === family);
        const page = pages[family];
        const totalPages = Math.max(1, Math.ceil(familyFiltered.length / PAGE_SIZE));
        const paginated = familyFiltered.slice(
          (page - 1) * PAGE_SIZE,
          page * PAGE_SIZE
        );

        return (
          <Card key={family}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Cpu className="h-4 w-4" />
                {FAMILY_LABEL[family]}
                <span className="text-xs font-normal text-muted-foreground ml-1">
                  {familyFiltered.length}
                  {familyAll.length !== familyFiltered.length
                    ? ` of ${familyAll.length}`
                    : ""}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {familyFiltered.length === 0 ? (
                <p className="text-sm text-center text-muted-foreground py-6">
                  {hasFilters && familyAll.length > 0
                    ? "No models match the current filters."
                    : "No models in this family."}
                </p>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Version</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Accuracy</TableHead>
                        <TableHead>Teacher Agreement</TableHead>
                        <TableHead>Deployed</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginated.map((model) => (
                        <TableRow key={model.id}>
                          <TableCell className="font-medium">
                            {model.name}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {model.version}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={STATUS_VARIANT[model.status]}
                              className="capitalize"
                            >
                              {model.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{model.accuracyPct}%</TableCell>
                          <TableCell>{model.agreementWithTeacherPct}%</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {model.deployedAt
                              ? new Date(model.deployedAt).toLocaleDateString()
                              : "—"}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedModelId(model.id)}
                            >
                              Detail
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4 border-t mt-4">
                      <p className="text-sm text-muted-foreground">
                        Page {page} of {totalPages} · {familyFiltered.length} models
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setPages((p) => ({
                              ...p,
                              [family]: Math.max(1, p[family] - 1),
                            }))
                          }
                          disabled={page === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setPages((p) => ({
                              ...p,
                              [family]: Math.min(totalPages, p[family] + 1),
                            }))
                          }
                          disabled={page === totalPages}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
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

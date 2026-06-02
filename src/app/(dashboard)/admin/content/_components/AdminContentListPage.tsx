"use client";

import { ReactNode, useMemo, useState } from "react";
import { AlertCircle, Search } from "lucide-react";
import { Badge } from "@/components/dashboard/ui/badge";
import { Button } from "@/components/dashboard/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/dashboard/ui/card";
import { Input } from "@/components/dashboard/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/dashboard/ui/select";
import { DataTable } from "@/components/dashboard/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import {
  AdminContentFilters,
  AdminContentItem,
  AdminContentKind,
  useAdminContentList,
} from "@/lib/api/admin-content";
import { usePageTitle } from "@/lib/usePageTitle";

type FilterConfig = {
  key: keyof AdminContentFilters;
  label: string;
  placeholder?: string;
  type?: "text" | "select";
  options?: Array<{ label: string; value: string }>;
};

type ColumnConfig<T extends AdminContentItem> = {
  key: string;
  label: string;
  className?: string;
  render: (item: T) => ReactNode;
};

interface AdminContentListPageProps<T extends AdminContentItem> {
  title: string;
  description: string;
  kind: AdminContentKind;
  icon: ReactNode;
  filters: FilterConfig[];
  columns: ColumnConfig<T>[];
}

const PAGE_SIZE = 20;

function cleanFilters(filters: AdminContentFilters) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== "" && value !== undefined)
  ) as AdminContentFilters;
}

export function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString();
}

export function formatUserName(user?: {
  email: string;
  firstName: string | null;
  lastName: string | null;
} | null) {
  if (!user) return "-";
  return [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;
}

export function StatusBadge({ value }: { value?: string | boolean | null }) {
  if (value === undefined || value === null) return <span>-</span>;
  const text = typeof value === "boolean" ? (value ? "Active" : "Inactive") : value;
  const normalized = String(text).toLowerCase();
  const variant =
    normalized === "active" || normalized === "done"
      ? "default"
      : normalized === "draft" || normalized === "todo" || normalized === "inactive"
        ? "outline"
        : "secondary";

  return (
    <Badge variant={variant} className="capitalize">
      {String(text).replace(/_/g, " ").toLowerCase()}
    </Badge>
  );
}

export default function AdminContentListPage<T extends AdminContentItem>({
  title,
  description,
  kind,
  icon,
  filters,
  columns,
}: AdminContentListPageProps<T>) {
  usePageTitle(title);
  const [page, setPage] = useState(1);
  const [draftFilters, setDraftFilters] = useState<AdminContentFilters>({});
  const [appliedFilters, setAppliedFilters] = useState<AdminContentFilters>({});

  const queryFilters = useMemo(
    () => cleanFilters({ ...appliedFilters, page, pageSize: PAGE_SIZE }),
    [appliedFilters, page]
  );

  const { data, isLoading, error, refetch } = useAdminContentList<T>(kind, queryFilters);
  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  // Adapt the lightweight ColumnConfig contract to TanStack column defs. These
  // are render-only (no accessors) so sorting stays off; pagination is server-side.
  const tableColumns = useMemo<ColumnDef<T, any>[]>(
    () =>
      columns.map((column) => ({
        id: column.key,
        header: column.label,
        enableSorting: false,
        cell: ({ row }) => column.render(row.original),
        meta: { className: column.className },
      })),
    [columns]
  );

  function applyFilters() {
    setPage(1);
    setAppliedFilters(cleanFilters(draftFilters));
  }

  function resetFilters() {
    setPage(1);
    setDraftFilters({});
    setAppliedFilters({});
  }

  return (
    <div className="space-y-6 p-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {icon}
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {filters.map((filter) => (
              <div key={String(filter.key)} className="space-y-2">
                <label className="text-sm font-medium">{filter.label}</label>
                {filter.type === "select" ? (
                  <Select
                    value={String(draftFilters[filter.key] ?? "all")}
                    onValueChange={(value) =>
                      setDraftFilters((current) => ({
                        ...current,
                        [filter.key]: value === "all" ? "" : value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={filter.placeholder ?? "All"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {(filter.options ?? []).map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    placeholder={filter.placeholder}
                    value={String(draftFilters[filter.key] ?? "")}
                    onChange={(event) =>
                      setDraftFilters((current) => ({
                        ...current,
                        [filter.key]: event.target.value,
                      }))
                    }
                  />
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={applyFilters}>
              <Search className="mr-2 h-4 w-4" />
              Apply
            </Button>
            <Button variant="outline" onClick={resetFilters}>
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2">
              {icon}
              {title}
            </span>
            <span className="text-sm font-normal text-muted-foreground">
              {total.toLocaleString()} total
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="flex h-48 flex-col items-center justify-center gap-4 text-center">
              <AlertCircle className="h-10 w-10 text-red-500" />
              <p className="text-muted-foreground">Failed to load {title.toLowerCase()}.</p>
              <Button variant="outline" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          ) : (
            <DataTable
              columns={tableColumns}
              data={items}
              isLoading={isLoading}
              hidePageSize
              emptyMessage="No records found."
              server={{
                total,
                pageIndex: page - 1,
                pageSize: PAGE_SIZE,
                onPaginationChange: ({ pageIndex }) => setPage(pageIndex + 1),
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
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
import { Input } from "@/components/dashboard/ui/input";
import { Button } from "@/components/dashboard/ui/button";
import { ArrowUpDown, ChevronLeft, ChevronRight, Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";

export interface DataTableFilter {
  /** Must match a key on the row data; values are compared as strings. */
  id: string;
  label: string;
  options: { label: string; value: string }[];
  /**
   * Custom match predicate. When omitted, the row matches if
   * `String(row[id]) === value`. Use this for non-equality filters such as
   * date ranges or boolean mappings. Not called for the "all" value.
   */
  predicate?: (row: any, value: string) => boolean;
}

/**
 * Server-side mode. When provided, the table does NOT search / filter / sort /
 * paginate in memory — `data` is the current server page and the parent owns
 * fetching. The shared table chrome + pagination footer are reused so server
 * lists look identical to client lists. Built-in search/filters are hidden;
 * render bespoke filters via the `toolbar` prop.
 */
export interface DataTableServer {
  /** Total row count across all pages (for "of Z" + page count). */
  total: number;
  /** Current 0-based page index. */
  pageIndex: number;
  pageSize: number;
  onPaginationChange: (next: { pageIndex: number; pageSize: number }) => void;
  /** Provide both to enable server-side column sorting. */
  sorting?: SortingState;
  onSortingChange?: (sorting: SortingState) => void;
}

export interface DataTableProps<T> {
  columns: ColumnDef<T, any>[];
  data: T[];
  searchPlaceholder?: string;
  enableSearch?: boolean;
  filters?: DataTableFilter[];
  initialPageSize?: number;
  pageSizeOptions?: number[];
  toolbarActions?: React.ReactNode;
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
  /**
   * Called with the rows remaining after search + filters are applied
   * (in current sort order). Useful for "Export CSV" of the visible set.
   * Client mode only.
   */
  onFilteredDataChange?: (rows: T[]) => void;
  /** Custom toolbar content; replaces the built-in search + filter row. */
  toolbar?: React.ReactNode;
  /** Enables server-side mode (manual pagination/sorting/filtering). */
  server?: DataTableServer;
  /** Hide the pagination footer (e.g. small embedded previews). */
  hideFooter?: boolean;
  /** Hide the rows-per-page selector (e.g. server APIs with a fixed page size). */
  hidePageSize?: boolean;
}

/**
 * Shared sortable column header — mirrors the pattern in UserTable.tsx so every
 * table in the app gets the same affordance. Use as `header: SortHeader("Label")`.
 */
export function SortHeader(label: string) {
  // eslint-disable-next-line react/display-name
  return function HeaderCell({ column }: { column: any }) {
    const sorted = column.getIsSorted();
    return (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(sorted === "asc")}
        className={cn(
          "-ml-2 h-8 gap-1.5 px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground",
          sorted && "text-foreground"
        )}
      >
        {label}
        <ArrowUpDown className={cn("h-3.5 w-3.5", sorted ? "opacity-100" : "opacity-40")} />
      </Button>
    );
  };
}

export function DataTable<T>({
  columns,
  data,
  searchPlaceholder = "Search...",
  enableSearch = true,
  filters,
  initialPageSize = 10,
  pageSizeOptions = [5, 10, 25, 50],
  toolbarActions,
  isLoading = false,
  emptyMessage = "No results found.",
  className,
  onFilteredDataChange,
  toolbar,
  server,
  hideFooter = false,
  hidePageSize = false,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});

  const isServer = !!server;
  const manualSorting = isServer && !!server!.onSortingChange;

  // Select filters are applied to the raw data before the table model so we
  // control the matching (string equality) regardless of column filterFns.
  // Skipped in server mode — `data` is already the current server page.
  const filteredData = useMemo(() => {
    if (isServer) return data;
    const active = filters?.filter((f) => {
      const v = filterValues[f.id];
      return v && v !== "all";
    });
    if (!active || active.length === 0) return data;
    return data.filter((row) =>
      active.every((f) => {
        const value = filterValues[f.id];
        return f.predicate
          ? f.predicate(row, value)
          : String((row as any)[f.id] ?? "") === value;
      })
    );
  }, [isServer, data, filters, filterValues]);

  const sortingState = manualSorting ? server!.sorting ?? [] : sorting;

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting: sortingState,
      ...(isServer
        ? { pagination: { pageIndex: server!.pageIndex, pageSize: server!.pageSize } }
        : { globalFilter }),
    },
    onSortingChange: (updater) => {
      const next = typeof updater === "function" ? updater(sortingState) : updater;
      if (manualSorting) server!.onSortingChange!(next);
      else setSorting(next);
    },
    onGlobalFilterChange: isServer ? undefined : setGlobalFilter,
    manualPagination: isServer,
    manualSorting,
    manualFiltering: isServer,
    pageCount: isServer ? Math.max(1, Math.ceil(server!.total / server!.pageSize)) : undefined,
    getCoreRowModel: getCoreRowModel(),
    ...(manualSorting ? {} : { getSortedRowModel: getSortedRowModel() }),
    ...(isServer
      ? {}
      : {
          getFilteredRowModel: getFilteredRowModel(),
          getPaginationRowModel: getPaginationRowModel(),
          initialState: { pagination: { pageSize: initialPageSize } },
        }),
  });

  // Surface the post-search/post-filter rows (in sort order) to the parent —
  // e.g. so an "Export CSV" button can act on exactly the visible set.
  const filteredRows = isServer ? [] : table.getSortedRowModel().rows;
  useEffect(() => {
    if (!onFilteredDataChange || isServer) return;
    onFilteredDataChange(filteredRows.map((r) => r.original));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onFilteredDataChange, isServer, globalFilter, filterValues, sorting, data]);

  const pageSize = isServer ? server!.pageSize : table.getState().pagination.pageSize;
  const pageIndex = isServer ? server!.pageIndex : table.getState().pagination.pageIndex;
  const totalRows = isServer ? server!.total : table.getFilteredRowModel().rows.length;
  const pageCount = isServer
    ? Math.max(1, Math.ceil(server!.total / server!.pageSize))
    : table.getPageCount() || 1;
  const from = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const to = Math.min((pageIndex + 1) * pageSize, totalRows);

  const goToPage = (next: number) => {
    if (isServer) server!.onPaginationChange({ pageIndex: next, pageSize });
    else table.setPageIndex(next);
  };
  const changePageSize = (next: number) => {
    if (isServer) server!.onPaginationChange({ pageIndex: 0, pageSize: next });
    else table.setPageSize(next);
  };
  const canPrevious = pageIndex > 0;
  const canNext = pageIndex < pageCount - 1;

  const showBuiltInControls = !isServer && (enableSearch || (filters && filters.length > 0));
  const hasToolbar = !!toolbar || showBuiltInControls || !!toolbarActions;

  return (
    <div className={cn("space-y-4", className)}>
      {hasToolbar && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            {toolbar
              ? toolbar
              : showBuiltInControls && (
                  <>
                    {enableSearch && (
                      <div className="relative min-w-0 sm:max-w-xs sm:flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder={searchPlaceholder}
                          value={globalFilter}
                          onChange={(e) => {
                            setGlobalFilter(e.target.value);
                            table.setPageIndex(0);
                          }}
                          className="pl-9 bg-muted/50"
                        />
                      </div>
                    )}
                    {filters?.map((filter) => (
                      <Select
                        key={filter.id}
                        value={filterValues[filter.id] ?? "all"}
                        onValueChange={(v) => {
                          setFilterValues((prev) => ({ ...prev, [filter.id]: v }));
                          table.setPageIndex(0);
                        }}
                      >
                        <SelectTrigger className="w-full bg-muted/50 sm:w-[170px]">
                          <SelectValue placeholder={filter.label} />
                        </SelectTrigger>
                        <SelectContent>
                          {filter.options.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ))}
                  </>
                )}
          </div>
          {toolbarActions && (
            <div className="flex items-center gap-2">{toolbarActions}</div>
          )}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-b border-border bg-muted/60 hover:bg-muted/60"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      "h-11 px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground",
                      (header.column.columnDef.meta as any)?.className
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center">
                  <div className="flex items-center justify-center text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-b border-border/60 transition-colors hover:bg-muted/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn("px-4 py-3", (cell.column.columnDef.meta as any)?.className)}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                      <Search className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-medium">{emptyMessage}</p>
                    <p className="text-xs">Try adjusting your search or filters.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {!hideFooter && (
      <div className="flex flex-col items-center justify-between gap-4 pt-2 sm:flex-row">
        <div className="order-2 flex items-center gap-4 sm:order-1">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{from}</span> to{" "}
            <span className="font-semibold text-foreground">{to}</span> of{" "}
            <span className="font-semibold text-foreground">{totalRows}</span>
          </p>

          {!hidePageSize && (
            <>
              <div className="hidden h-4 w-[1px] bg-border sm:block" />

              <div className="flex items-center gap-2">
                <span className="hidden text-xs text-muted-foreground lg:inline">Rows per page:</span>
                <Select
                  value={pageSize.toString()}
                  onValueChange={(v) => changePageSize(parseInt(v))}
                >
                  <SelectTrigger className="h-8 w-20 border-border bg-transparent text-xs shadow-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {pageSizeOptions.map((opt) => (
                      <SelectItem key={opt} value={opt.toString()}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>

        <div className="order-1 flex items-center gap-3 sm:order-2">
          <div className="mr-2 flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Page</span>
            <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
              {pageIndex + 1}
            </span>
            <span className="text-xs text-muted-foreground">of {pageCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-md border-border bg-background"
              onClick={() => goToPage(pageIndex - 1)}
              disabled={!canPrevious}
            >
              <ChevronLeft className="h-4 w-4 text-muted-foreground" />
              <span className="sr-only">Previous page</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-md border-border bg-background"
              onClick={() => goToPage(pageIndex + 1)}
              disabled={!canNext}
            >
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <span className="sr-only">Next page</span>
            </Button>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}

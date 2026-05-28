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
import { Loader2, AlertCircle, Inbox, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { useAnnotations, type Annotation } from "@/lib/api/admin-marking";
import { AnnotationDrawer } from "@/components/marking/AnnotationDrawer";

const PAGE_SIZE = 25;

export default function AdminMarkingQueuePage() {
  const [nameFilter, setNameFilter] = useState("");
  const [agreementFilter, setAgreementFilter] = useState<"all" | "agreed" | "overridden">("all");
  const [dateFilter, setDateFilter] = useState<"all" | "7d" | "30d" | "90d">("all");
  const [page, setPage] = useState(1);
  const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | null>(null);

  const { data, isLoading, error, refetch } = useAnnotations();

  const filtered = useMemo(() => {
    if (!data) return [];
    let result = data;

    if (nameFilter.trim()) {
      const q = nameFilter.toLowerCase();
      result = result.filter((a) => a.teacherName.toLowerCase().includes(q));
    }

    if (agreementFilter !== "all") {
      result = result.filter((a) =>
        agreementFilter === "agreed" ? a.agreementWithModel : !a.agreementWithModel
      );
    }

    if (dateFilter !== "all") {
      const days = dateFilter === "7d" ? 7 : dateFilter === "30d" ? 30 : 90;
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      result = result.filter((a) => new Date(a.createdAt) >= cutoff);
    }

    return result;
  }, [data, nameFilter, agreementFilter, dateFilter]);

  useEffect(() => setPage(1), [nameFilter, agreementFilter, dateFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const exportCSV = () => {
    const headers = ["Annotation ID", "Teacher", "Submission", "Agreement", "Error Tags", "Created"];
    const rows = filtered.map((a) => [
      a.id,
      a.teacherName,
      a.submissionId,
      a.agreementWithModel ? "Agreed" : "Overridden",
      a.errorTags.join("; "),
      new Date(a.createdAt).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "annotations.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const hasFilters = nameFilter.trim() || agreementFilter !== "all" || dateFilter !== "all";

  const clearFilters = () => {
    setNameFilter("");
    setAgreementFilter("all");
    setDateFilter("all");
  };

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

      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Filter by teacher name..."
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          className="max-w-xs"
        />

        <Select value={agreementFilter} onValueChange={(v) => setAgreementFilter(v as typeof agreementFilter)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Agreement" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All outcomes</SelectItem>
            <SelectItem value="agreed">Agreed only</SelectItem>
            <SelectItem value="overridden">Overridden only</SelectItem>
          </SelectContent>
        </Select>

        <Select value={dateFilter} onValueChange={(v) => setDateFilter(v as typeof dateFilter)}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Date range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All time</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="outline" size="sm" onClick={clearFilters}>
            Clear filters
          </Button>
        )}

        <Button variant="outline" size="sm" className="ml-auto" onClick={exportCSV} disabled={filtered.length === 0}>
          <Download className="mr-1.5 h-3.5 w-3.5" />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Inbox className="h-4 w-4" />
            Annotations ({filtered.length}{data && filtered.length !== data.length ? ` of ${data.length}` : ""})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {hasFilters ? "No annotations match the current filters." : "No annotations found."}
            </p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Annotation ID</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Submission</TableHead>
                    <TableHead>Agreement</TableHead>
                    <TableHead>Error Tags</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((ann) => (
                    <TableRow key={ann.id}>
                      <TableCell className="font-mono text-xs">{ann.id}</TableCell>
                      <TableCell>{ann.teacherName}</TableCell>
                      <TableCell className="font-mono text-xs">{ann.submissionId}</TableCell>
                      <TableCell>
                        <Badge variant={ann.agreementWithModel ? "default" : "destructive"}>
                          {ann.agreementWithModel ? "Agreed" : "Overridden"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {ann.errorTags.length === 0 ? (
                            <span className="text-muted-foreground text-xs">—</span>
                          ) : (
                            ann.errorTags.map((t) => (
                              <Badge key={t} variant="outline" className="text-xs">
                                {t}
                              </Badge>
                            ))
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(ann.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedAnnotation(ann)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {page} of {totalPages} · {filtered.length} results
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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
      <AnnotationDrawer
        annotation={selectedAnnotation}
        onClose={() => setSelectedAnnotation(null)}
      />
    </div>
  );
}

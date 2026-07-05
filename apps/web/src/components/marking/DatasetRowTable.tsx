"use client";
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/dashboard/ui/table";
import { Badge } from "@/components/dashboard/ui/badge";
import { Button } from "@/components/dashboard/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { DatasetRow, SplitTag } from "@/lib/types/dataset";

const SPLIT_VARIANT: Record<SplitTag, "default" | "secondary" | "outline"> = {
  train: "default",
  val: "secondary",
  test: "outline",
};

interface Props {
  rows: DatasetRow[];
  total: number;
  page: number;
  pageSize: number;
  loading?: boolean;
  onPageChange: (page: number) => void;
}

export function DatasetRowTable({
  rows,
  total,
  page,
  pageSize,
  loading,
  onPageChange,
}: Props) {
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-3">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Row ID</TableHead>
            <TableHead>Question ID</TableHead>
            <TableHead>Answer Hash</TableHead>
            <TableHead>Error Tags</TableHead>
            <TableHead>Split</TableHead>
            <TableHead>Note</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                Loading...
              </TableCell>
            </TableRow>
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                No rows found.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-mono text-xs">{row.id}</TableCell>
                <TableCell className="font-mono text-xs">{row.questionId}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {row.studentAnswerHash.slice(0, 8)}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {row.errorTags.length === 0 ? (
                      <span className="text-muted-foreground text-xs">—</span>
                    ) : (
                      row.errorTags.map((t) => (
                        <Badge key={t} variant="outline" className="text-xs">
                          {t}
                        </Badge>
                      ))
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={SPLIT_VARIANT[row.splitTag]} className="capitalize">
                    {row.splitTag}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate">
                  {row.teacherNote ?? "—"}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {page} of {totalPages} ({total} rows)
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

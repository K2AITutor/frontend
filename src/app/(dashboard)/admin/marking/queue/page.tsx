"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/dashboard/ui/card";
import { Badge } from "@/components/dashboard/ui/badge";
import { Button } from "@/components/dashboard/ui/button";
import { Input } from "@/components/dashboard/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/dashboard/ui/table";
import { Loader2, AlertCircle, ExternalLink, Inbox } from "lucide-react";
import { useAnnotations } from "@/lib/api/admin-marking";

export default function AdminMarkingQueuePage() {
  const [teacherFilter, setTeacherFilter] = useState("");
  const { data, isLoading, error } = useAnnotations({
    teacherId: teacherFilter || undefined,
  });

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

      <div className="flex items-center gap-3">
        <Input
          placeholder="Filter by teacher ID..."
          value={teacherFilter}
          onChange={(e) => setTeacherFilter(e.target.value)}
          className="max-w-xs"
        />
        {teacherFilter && (
          <Button variant="outline" size="sm" onClick={() => setTeacherFilter("")}>
            Clear
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Inbox className="h-4 w-4" />
            Annotations ({data?.length ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data?.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No annotations found.
            </p>
          ) : (
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
                {data?.map((ann) => (
                  <TableRow key={ann.id}>
                    <TableCell className="font-mono text-xs">{ann.id}</TableCell>
                    <TableCell>{ann.teacherName}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {ann.submissionId}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={ann.agreementWithModel ? "default" : "destructive"}
                      >
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
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/teacher/review/${ann.submissionId}`}>
                          <ExternalLink className="mr-1 h-3.5 w-3.5" />
                          Workbench
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePageTitle } from "@/lib/usePageTitle";
import { useContributorTasks } from "@/lib/api/contributor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/dashboard/ui/card";
import { Button } from "@/components/dashboard/ui/button";
import { Skeleton } from "@/components/dashboard/ui/skeleton";
import { Badge } from "@/components/dashboard/ui/badge";
import { ClipboardList, FilePlus2, Library } from "lucide-react";

function statusVariant(status: string) {
  switch (status) {
    case "DONE":
      return "default";
    case "IN_REVIEW":
      return "secondary";
    case "BLOCKED":
      return "destructive";
    default:
      return "outline";
  }
}

export default function ContributorTasksPage() {
  usePageTitle("Contributor Tasks");
  const { data, isLoading, isError } = useContributorTasks();

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-48" />
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Failed to load contributor tasks</p>
      </div>
    );
  }

  const hasTasks = data.length > 0;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">My Tasks</h1>
        <p className="text-muted-foreground">
          Track assigned question-entry, rubric, annotation, and QA work.
        </p>
      </div>

      {!hasTasks ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-lg font-semibold">No tasks assigned yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              This page will become your structured work queue once task assignment is active.
              For now, you can still contribute by creating question drafts and building rubrics.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild>
                <Link href="/contributor/questions/new">
                  <FilePlus2 className="mr-2 h-4 w-4" />
                  Create Question Draft
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/contributor/rubrics">
                  <Library className="mr-2 h-4 w-4" />
                  View Rubric Drafts
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {data.map((task) => (
            <Card key={task.id}>
              <CardHeader className="pb-2">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ClipboardList className="h-5 w-5" />
                      {task.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant={statusVariant(task.status) as any}>{task.status}</Badge>
                    <Badge variant="outline">{task.type}</Badge>
                    <Badge variant="outline">Priority {task.priority}</Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>Task ID: {task.id}</p>
                {task.questionId ? <p>Question ID: {task.questionId}</p> : null}
                {task.dueAt ? <p>Due: {new Date(task.dueAt).toLocaleString()}</p> : <p>No due date</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
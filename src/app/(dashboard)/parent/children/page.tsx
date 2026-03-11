"use client";


import { Card, CardContent, CardHeader, CardTitle } from "@/components/dashboard/ui/card";
import { Button } from "@/components/dashboard/ui/button";
import { Skeleton } from "@/components/dashboard/ui/skeleton";
import { ChildCard } from "@/components/dashboard/ChildCard";
import { Plus } from "lucide-react";
import { useChildren } from "@/lib/api/dashboard";

interface Subject {
  name: string;
  grade: string;
  progress: number;
}

interface Child {
  id: string;
  name: string;
  grade: string;
  avatar: string;
  overallProgress: number;
  averageGrade: string;
  lastActive: string;
  subjects: Subject[];
}

export default function ParentChildrenPage() {
  const { data: children = [], isLoading, isError } = useChildren();

  if (isLoading) {
    return <ParentChildrenSkeleton />;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Children</h1>
          <p className="text-muted-foreground">
            Manage and monitor your children&apos;s progress
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Child
        </Button>
      </div>

      {children.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {children.map((child) => (
            <ChildCard
              key={child.id}
              id={child.id}
              name={child.name}
              grade={child.grade}
              avatar={child.avatar}
              overallProgress={child.overallProgress}
              averageGrade={child.averageGrade}
              lastActive={child.lastActive}
              subjects={child.subjects}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="text-center space-y-2">
              <p className="text-lg font-medium">No children added yet</p>
              <p className="text-sm text-muted-foreground">
                Add your first child to start tracking their&apos;s progress
              </p>
              <Button className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Add Child
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ParentChildrenSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-24" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-80" />
        ))}
      </div>
    </div>
  );
}

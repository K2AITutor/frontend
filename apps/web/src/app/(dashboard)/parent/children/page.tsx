"use client";

import { Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/dashboard/ui/card";
import { Button } from "@/components/dashboard/ui/button";
import { ChildCard } from "@/components/dashboard/ChildCard";
import { useParentChildren } from "@/lib/api/parent";
import { usePageTitle } from "@/lib/usePageTitle";

export default function ParentChildrenPage() {
  usePageTitle("My Children");

  const { data: children, isLoading, error, refetch } = useParentChildren();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <AlertCircle className="h-10 w-10 text-red-500" />
        <p className="text-muted-foreground">Failed to load children</p>
        <Button variant="outline" onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Children</h1>
        <p className="text-muted-foreground">View and manage your children&apos;s accounts</p>
      </div>

      {children && children.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {children.map((child) => (
            <ChildCard key={child.id} child={child} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No children linked to your account yet.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

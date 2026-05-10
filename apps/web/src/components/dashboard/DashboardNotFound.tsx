"use client";

import Link from "next/link";
import { Button } from "@/components/dashboard/ui/button";
import { Card, CardContent } from "@/components/dashboard/ui/card";
import { FileQuestion, ArrowLeft, Home } from "lucide-react";

interface DashboardNotFoundProps {
  role: "admin" | "student";
}

export function DashboardNotFound({ role }: DashboardNotFoundProps) {
  const dashboardPath = `/${role}`;

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-6">
      <Card className="w-full max-w-md text-center border-dashed">
        <CardContent className="pt-10 pb-10 space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <FileQuestion className="h-10 w-10 text-muted-foreground" />
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">404</h1>
            <p className="text-muted-foreground text-base">
              This page doesn't exist or you don't have permission to view it.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={dashboardPath}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go to Dashboard
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

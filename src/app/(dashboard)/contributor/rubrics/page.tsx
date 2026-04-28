"use client";

import Link from "next/link";
import { usePageTitle } from "@/lib/usePageTitle";
import { useContributorRubricDrafts } from "@/lib/api/contributor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/dashboard/ui/card";
import { Button } from "@/components/dashboard/ui/button";
import { Skeleton } from "@/components/dashboard/ui/skeleton";
import { Badge } from "@/components/dashboard/ui/badge";
import { FilePlus2, Library, BookOpen } from "lucide-react";

export default function ContributorRubricsPage() {
    usePageTitle("Rubric Drafts");
    const { data, isLoading, isError } = useContributorRubricDrafts();

    if (isLoading) {
        return (
            <div className="space-y-6 p-6">
                <Skeleton className="h-8 w-48" />
                {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-28" />
                ))}
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <p className="text-muted-foreground">Failed to load rubric drafts</p>
            </div>
        );
    }

    const hasRubrics = data.length > 0;

    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-2xl font-bold">Rubric Drafts</h1>
                <p className="text-muted-foreground">
                    Build and manage lightweight rubrics linked to contributor question drafts.
                </p>
            </div>

            {!hasRubrics ? (
                <Card>
                    <CardContent className="p-8 text-center">
                        <p className="text-lg font-semibold">No rubric drafts yet</p>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Rubrics are usually created after you have drafted a question. Open a question draft and build its rubric.
                        </p>
                        <div className="mt-6 flex flex-wrap justify-center gap-3">
                            <Button asChild>
                                <Link href="/contributor/questions">
                                    <BookOpen className="mr-2 h-4 w-4" />
                                    View Question Drafts
                                </Link>
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href="/contributor/questions/new">
                                    <FilePlus2 className="mr-2 h-4 w-4" />
                                    New Question Draft
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {data.map((rubric) => (
                        <Card key={rubric.id}>
                            <CardHeader className="pb-2">
                                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Library className="h-5 w-5" />
                                            Rubric #{rubric.id}
                                        </CardTitle>
                                        <p className="text-sm text-muted-foreground">
                                            Linked to Question ID: {rubric.questionId}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {rubric.rubricKey ? <Badge variant="outline">{rubric.rubricKey}</Badge> : null}
                                        <Badge variant="outline">{rubric.maxMarks} marks</Badge>
                                        <Badge>{rubric.status}</Badge>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                <p className="text-sm text-muted-foreground">
                                    Last updated: {rubric.updatedAt ? new Date(rubric.updatedAt).toLocaleString() : "-"}
                                </p>

                                <Button variant="outline" asChild>
                                    <Link href={`/contributor/rubrics/${rubric.questionId}`}>Open Builder</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
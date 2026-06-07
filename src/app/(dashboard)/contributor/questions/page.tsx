"use client";

import Link from "next/link";
import { useState } from "react";
import { usePageTitle } from "@/lib/usePageTitle";
import {
    submitQuestionDraftForReview,
    useContributorQuestionDrafts,
} from "@/lib/api/questions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/dashboard/ui/card";
import { Button } from "@/components/dashboard/ui/button";
import { Skeleton } from "@/components/dashboard/ui/skeleton";
import { Badge } from "@/components/dashboard/ui/badge";
import { BookOpen, FilePlus2, Library } from "lucide-react";

export default function ContributorQuestionsPage() {
    usePageTitle("Question Drafts");
    const { data, isLoading, isError, refetch } = useContributorQuestionDrafts();
    const [submittingId, setSubmittingId] = useState<number | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    async function handleSubmitForReview(id: number) {
        setSubmittingId(id);
        setMessage(null);

        try {
            await submitQuestionDraftForReview(id);
            await refetch();
            setMessage(`Question draft #${id} submitted for review.`);
        } catch (error: any) {
            setMessage(error?.message || "Failed to submit draft for review");
        } finally {
            setSubmittingId(null);
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-6 p-6">
                <Skeleton className="h-8 w-52" />
                {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-28" />
                ))}
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <p className="text-muted-foreground">Failed to load question drafts</p>
            </div>
        );
    }

    const hasDrafts = data.length > 0;

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Question Drafts</h1>
                    <p className="text-muted-foreground">
                        Review, manage, and submit contributor-created question drafts.
                    </p>
                </div>

                <Button asChild>
                    <Link href="/contributor/questions/new">
                        <FilePlus2 className="mr-2 h-4 w-4" />
                        New Question Draft
                    </Link>
                </Button>
            </div>

            {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}

            {!hasDrafts ? (
                <Card>
                    <CardContent className="p-8 text-center">
                        <p className="text-lg font-semibold">No question drafts yet</p>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Start by creating a new draft question with valid topic and skill codes.
                        </p>
                        <div className="mt-6">
                            <Button asChild>
                                <Link href="/contributor/questions/new">Create First Draft</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {data.map((question) => (
                        <Card key={question.id}>
                            <CardHeader className="pb-2">
                                <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                                    <div className="space-y-2">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <BookOpen className="h-5 w-5" />
                                            Question #{question.id}
                                        </CardTitle>
                                        <p className="text-sm text-muted-foreground">
                                            {question.questionText}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {question.subjectCode ? <Badge variant="outline">{question.subjectCode}</Badge> : null}
                                        {question.topicCode ? <Badge variant="outline">{question.topicCode}</Badge> : null}
                                        {question.skillCode ? <Badge variant="outline">{question.skillCode}</Badge> : null}
                                        <Badge>{question.status}</Badge>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4 text-sm text-muted-foreground">
                                <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
                                    <p><span className="font-medium text-foreground">Answer Type:</span> {question.answerType ?? "-"}</p>
                                    <p><span className="font-medium text-foreground">Marks:</span> {question.marks ?? "-"}</p>
                                    <p className="md:col-span-2 xl:col-span-2">
                                        <span className="font-medium text-foreground">Source:</span>{" "}
                                        {[question.sourceBook, question.sourceChapter, question.sourceQuestionRef]
                                            .filter(Boolean)
                                            .join(" / ") || "-"}
                                    </p>
                                </div>

                                <p>
                                    <span className="font-medium text-foreground">Last updated:</span>{" "}
                                    {question.updatedAt ? new Date(question.updatedAt).toLocaleString() : "-"}
                                </p>

                                <div className="flex flex-wrap gap-2 pt-2">
                                    {question.status === "DRAFT" ? (
                                        <Button
                                            variant="outline"
                                            onClick={() => handleSubmitForReview(question.id)}
                                            disabled={submittingId === question.id}
                                        >
                                            {submittingId === question.id ? "Submitting..." : "Submit for Review"}
                                        </Button>
                                    ) : null}

                                    <Button variant="outline" asChild>
                                        <Link href={`/contributor/rubrics/${question.id}`}>
                                            <Library className="mr-2 h-4 w-4" />
                                            Build Rubric
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
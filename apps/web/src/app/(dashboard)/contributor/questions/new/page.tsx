"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePageTitle } from "@/lib/usePageTitle";
import { createQuestionDraft } from "@/lib/api/questions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/dashboard/ui/card";
import { Button } from "@/components/dashboard/ui/button";
import { Input } from "@/components/dashboard/ui/input";
import { Label } from "@/components/dashboard/ui/label";
import { Textarea } from "@/components/dashboard/ui/textarea";


export default function NewContributorQuestionPage() {
    usePageTitle("New Question Draft");
    const router = useRouter();

    const [form, setForm] = useState({
        subject: "Math Methods",
        topicCode: "",
        skillCode: "",
        prompt: "",
        answerType: "EXPRESSION",
        marks: 1,
        correctAnswer: "",
        sourceBook: "VCAA / Cambridge",
        sourceChapter: "",
        sourceQuestionRef: "",
        solutionSteps: "",
        misconceptions: "",
    });

    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        setMessage(null);

        try {
            await createQuestionDraft({
                subject: form.subject,
                topicCode: form.topicCode,
                skillCode: form.skillCode,
                prompt: form.prompt,
                questionText: form.prompt,
                answerType: form.answerType,
                marks: Number(form.marks),
                correctAnswer: form.correctAnswer,
                sourceBook: form.sourceBook,
                sourceChapter: form.sourceChapter,
                sourceQuestionRef: form.sourceQuestionRef,
                solutionSteps: form.solutionSteps,
                misconceptions: form.misconceptions,
            });

            router.push("/contributor/questions");
        } catch (error: any) {
            setMessage(error?.message || "Failed to save draft");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-2xl font-bold">New Question Draft</h1>
                <p className="text-muted-foreground">
                    Enter structured Math Methods content from VCAA or Cambridge sources.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Question Draft Form</CardTitle>
                </CardHeader>

                <CardContent>
                    <form className="space-y-6" onSubmit={onSubmit}>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="subject">Subject</Label>
                                <Input
                                    id="subject"
                                    value={form.subject}
                                    onChange={(e) => update("subject", e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="marks">Marks</Label>
                                <Input
                                    id="marks"
                                    type="number"
                                    min={1}
                                    value={form.marks}
                                    onChange={(e) => update("marks", Number(e.target.value))}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="topicCode">Topic Code</Label>
                                <Input
                                    id="topicCode"
                                    value={form.topicCode}
                                    onChange={(e) => update("topicCode", e.target.value)}
                                    placeholder="e.g. MM_CALC_DIFF_BASICS"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="skillCode">Skill Code</Label>
                                <Input
                                    id="skillCode"
                                    value={form.skillCode}
                                    onChange={(e) => update("skillCode", e.target.value)}
                                    placeholder="e.g. DIFF_POWER_RULE"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="answerType">Answer Type</Label>
                                <Input
                                    id="answerType"
                                    value={form.answerType}
                                    onChange={(e) => update("answerType", e.target.value)}
                                    placeholder="EXPRESSION / NUMERIC / INTERVAL / TEXT / MCQ"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="sourceBook">Source</Label>
                                <Input
                                    id="sourceBook"
                                    value={form.sourceBook}
                                    onChange={(e) => update("sourceBook", e.target.value)}
                                    placeholder="VCAA 2025 Exam 1 / Cambridge Ch 5"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="sourceChapter">Source Chapter</Label>
                                <Input
                                    id="sourceChapter"
                                    value={form.sourceChapter}
                                    onChange={(e) => update("sourceChapter", e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="sourceQuestionRef">Question Reference</Label>
                                <Input
                                    id="sourceQuestionRef"
                                    value={form.sourceQuestionRef}
                                    onChange={(e) => update("sourceQuestionRef", e.target.value)}
                                    placeholder="Q3(a), Ex 5.2 #7"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="prompt">Question Prompt</Label>
                            <Textarea
                                id="prompt"
                                rows={4}
                                value={form.prompt}
                                onChange={(e) => update("prompt", e.target.value)}
                                placeholder="Enter the full question text"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="correctAnswer">Correct Answer</Label>
                            <Textarea
                                id="correctAnswer"
                                rows={2}
                                value={form.correctAnswer}
                                onChange={(e) => update("correctAnswer", e.target.value)}
                                placeholder="Enter exact/expected answer"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="solutionSteps">Solution Steps</Label>
                            <Textarea
                                id="solutionSteps"
                                rows={4}
                                value={form.solutionSteps}
                                onChange={(e) => update("solutionSteps", e.target.value)}
                                placeholder="Enter worked solution outline, one step per line"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="misconceptions">Common Misconceptions</Label>
                            <Textarea
                                id="misconceptions"
                                rows={3}
                                value={form.misconceptions}
                                onChange={(e) => update("misconceptions", e.target.value)}
                                placeholder="Enter common errors, one per line"
                            />
                        </div>

                        {message ? <p className="text-sm text-red-600">{message}</p> : null}

                        <div className="flex gap-3">
                            <Button
                                type="submit"
                                disabled={
                                    submitting ||
                                    !form.prompt.trim() ||
                                    !form.topicCode.trim() ||
                                    !form.skillCode.trim()
                                }
                            >
                                {submitting ? "Saving..." : "Save Draft"}
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push("/contributor/questions")}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
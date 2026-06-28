"use client";

import { useEffect, useMemo, useState, use } from "react";
import { useRouter } from "next/navigation";
import { usePageTitle } from "@/lib/usePageTitle";
import {
    createRubricDraft,
    getRubricByQuestionId,
    updateRubricDraft,
} from "@/lib/api/contributor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/dashboard/ui/card";
import { Button } from "@/components/dashboard/ui/button";
import { Input } from "@/components/dashboard/ui/input";
import { Label } from "@/components/dashboard/ui/label";
import { Textarea } from "@/components/dashboard/ui/textarea";
import { Badge } from "@/components/dashboard/ui/badge";
import { Library, Plus, AlertCircle, CheckCircle2 } from "lucide-react";

type CriterionRow = {
    id?: number;
    criterionCode: string;
    description: string;
    marks: number;
    sortOrder: number;
};

export default function ContributorRubricBuilderPage({
    params,
}: {
    params: Promise<{ questionId: string }>;
}) {
    const resolvedParams = use(params);
    const { questionId } = resolvedParams;
    usePageTitle(`Rubric Builder #${questionId}`);
    const router = useRouter();

    const [loadingExisting, setLoadingExisting] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [rubricId, setRubricId] = useState<number | null>(null);

    const [form, setForm] = useState({
        questionId: Number(questionId),
        rubricKey: "",
        maxMarks: 1,
        modelAnswer: "",
        markingNotes: "",
        commonErrorsText: "",
        criteria: [
            {
                criterionCode: "c1",
                description: "",
                marks: 1,
                sortOrder: 1,
            },
        ] as CriterionRow[],
    });

    useEffect(() => {
        async function loadExisting() {
            try {
                const existing: any = await getRubricByQuestionId(questionId);

                if (existing) {
                    setRubricId(existing.id ?? null);
                    setForm({
                        questionId: Number(questionId),
                        rubricKey: existing.rubricKey || "",
                        maxMarks: existing.maxMarks || 1,
                        modelAnswer: existing.modelAnswer || "",
                        markingNotes: existing.markingNotes || "",
                        commonErrorsText: Array.isArray(existing.commonErrors)
                            ? existing.commonErrors.join("\n")
                            : "",
                        criteria:
                            existing.criteria?.length > 0
                                ? existing.criteria.map((c: any, idx: number) => ({
                                    id: c.id,
                                    criterionCode: c.criterionCode || `c${idx + 1}`,
                                    description: c.description || "",
                                    marks: Number(c.marks || 1),
                                    sortOrder: Number(c.sortOrder || idx + 1),
                                }))
                                : [
                                    {
                                        criterionCode: "c1",
                                        description: "",
                                        marks: 1,
                                        sortOrder: 1,
                                    },
                                ],
                    });
                }
            } catch {
                // no existing rubric yet
            } finally {
                setLoadingExisting(false);
            }
        }

        loadExisting();
    }, [questionId]);

    function updateField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    function updateCriterion(index: number, key: keyof CriterionRow, value: string | number) {
        setForm((prev) => ({
            ...prev,
            criteria: prev.criteria.map((criterion, i) =>
                i === index ? { ...criterion, [key]: value } : criterion
            ),
        }));
    }

    function addCriterion() {
        setForm((prev) => ({
            ...prev,
            criteria: [
                ...prev.criteria,
                {
                    criterionCode: `c${prev.criteria.length + 1}`,
                    description: "",
                    marks: 1,
                    sortOrder: prev.criteria.length + 1,
                },
            ],
        }));
    }

    function removeCriterion(index: number) {
        setForm((prev) => ({
            ...prev,
            criteria: prev.criteria.filter((_, i) => i !== index),
        }));
    }

    const totalCriterionMarks = useMemo(() => {
        return form.criteria.reduce((sum, c) => sum + Number(c.marks || 0), 0);
    }, [form.criteria]);

    const marksMatch = totalCriterionMarks === Number(form.maxMarks);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        setMessage(null);

        const payload = {
            questionId: form.questionId,
            rubricKey: form.rubricKey || undefined,
            maxMarks: Number(form.maxMarks),
            modelAnswer: form.modelAnswer || undefined,
            markingNotes: form.markingNotes || undefined,
            commonErrors: form.commonErrorsText
                .split("\n")
                .map((x) => x.trim())
                .filter(Boolean),
            criteria: form.criteria.map((c) => ({
                criterionCode: c.criterionCode,
                description: c.description,
                marks: Number(c.marks),
                sortOrder: Number(c.sortOrder),
            })),
        };

        try {
            if (rubricId) {
                await updateRubricDraft(rubricId, payload);
            } else {
                const created: any = await createRubricDraft(payload);
                if (created?.id) setRubricId(created.id);
            }

            setMessage("Rubric draft saved successfully.");
            router.push("/contributor/rubrics");
        } catch (error: any) {
            setMessage(error?.message || "Failed to save rubric draft");
        } finally {
            setSubmitting(false);
        }
    }

    if (loadingExisting) {
        return (
            <div className="space-y-6 p-6">
                <div className="h-8 w-56 animate-pulse rounded bg-muted" />
                <div className="h-[520px] animate-pulse rounded bg-muted" />
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Rubric Builder</h1>
                    <p className="text-muted-foreground">
                        Build a lightweight criterion-based rubric for question #{questionId}.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">Question #{questionId}</Badge>
                    <Badge>{rubricId ? "Existing Draft" : "New Draft"}</Badge>
                </div>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Library className="h-5 w-5" />
                        Rubric authoring guide
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-lg border p-4">
                        <p className="font-medium">1. Define the overall rubric</p>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Set a rubric key, total marks, model answer, and any short marking notes.
                        </p>
                    </div>

                    <div className="rounded-lg border p-4">
                        <p className="font-medium">2. Add criteria</p>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Break the marks into small criteria that explain exactly what earns credit.
                        </p>
                    </div>

                    <div className="rounded-lg border p-4">
                        <p className="font-medium">3. Check mark consistency</p>
                        <p className="mt-2 text-sm text-muted-foreground">
                            The criterion marks should sum to the rubric max marks before saving.
                        </p>
                    </div>
                </CardContent>
            </Card>

            <form className="space-y-6" onSubmit={onSubmit}>
                <div className="grid gap-6 xl:grid-cols-3">
                    <Card className="xl:col-span-2">
                        <CardHeader>
                            <CardTitle>Rubric Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="rubricKey">Rubric Key</Label>
                                    <Input
                                        id="rubricKey"
                                        value={form.rubricKey}
                                        onChange={(e) => updateField("rubricKey", e.target.value)}
                                        placeholder="e.g. mm_stationary_q1"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="maxMarks">Max Marks</Label>
                                    <Input
                                        id="maxMarks"
                                        type="number"
                                        min={1}
                                        value={form.maxMarks}
                                        onChange={(e) => updateField("maxMarks", Number(e.target.value))}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="modelAnswer">Model Answer</Label>
                                <Textarea
                                    id="modelAnswer"
                                    rows={5}
                                    value={form.modelAnswer}
                                    onChange={(e) => updateField("modelAnswer", e.target.value)}
                                    placeholder="Write a short model answer or solution outline."
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="markingNotes">Marking Notes</Label>
                                <Textarea
                                    id="markingNotes"
                                    rows={4}
                                    value={form.markingNotes}
                                    onChange={(e) => updateField("markingNotes", e.target.value)}
                                    placeholder="Accepted methods, partial-mark guidance, or interpretation notes."
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="commonErrorsText">Common Errors (one per line)</Label>
                                <Textarea
                                    id="commonErrorsText"
                                    rows={5}
                                    value={form.commonErrorsText}
                                    onChange={(e) => updateField("commonErrorsText", e.target.value)}
                                    placeholder={`Only gives one root\nSign error\nIncorrect classification`}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Rubric Check</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="rounded-lg border p-4">
                                <p className="text-sm text-muted-foreground">Question ID</p>
                                <p className="text-lg font-semibold">{questionId}</p>
                            </div>

                            <div className="rounded-lg border p-4">
                                <p className="text-sm text-muted-foreground">Max Marks</p>
                                <p className="text-lg font-semibold">{form.maxMarks}</p>
                            </div>

                            <div className="rounded-lg border p-4">
                                <p className="text-sm text-muted-foreground">Criterion Total</p>
                                <p className="text-lg font-semibold">{totalCriterionMarks}</p>
                            </div>

                            <div className="rounded-lg border p-4">
                                <div className="flex items-center gap-2">
                                    {marksMatch ? (
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                                    )}
                                    <p className="font-medium">
                                        {marksMatch ? "Marks match" : "Marks do not match"}
                                    </p>
                                </div>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    {marksMatch
                                        ? "Your criterion totals match the rubric marks."
                                        : "Update the criteria so the total equals the rubric max marks."}
                                </p>
                            </div>

                            {message ? (
                                <div className="rounded-lg border p-4 text-sm text-muted-foreground">
                                    {message}
                                </div>
                            ) : null}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Criteria</CardTitle>
                        <Button type="button" variant="outline" onClick={addCriterion}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Criterion
                        </Button>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {form.criteria.map((criterion, index) => (
                            <div key={`${criterion.criterionCode}-${index}`} className="rounded-lg border p-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <p className="font-medium">Criterion {index + 1}</p>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => removeCriterion(index)}
                                        disabled={form.criteria.length === 1}
                                    >
                                        Remove
                                    </Button>
                                </div>

                                <div className="grid gap-4 md:grid-cols-4">
                                    <div className="space-y-2">
                                        <Label>Criterion Code</Label>
                                        <Input
                                            value={criterion.criterionCode}
                                            onChange={(e) => updateCriterion(index, "criterionCode", e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Marks</Label>
                                        <Input
                                            type="number"
                                            min={0}
                                            value={criterion.marks}
                                            onChange={(e) => updateCriterion(index, "marks", Number(e.target.value))}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Sort Order</Label>
                                        <Input
                                            type="number"
                                            min={1}
                                            value={criterion.sortOrder}
                                            onChange={(e) => updateCriterion(index, "sortOrder", Number(e.target.value))}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Preview</Label>
                                        <div className="flex h-10 items-center rounded-md border px-3 text-sm text-muted-foreground">
                                            {criterion.criterionCode || `c${index + 1}`}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Textarea
                                        rows={3}
                                        value={criterion.description}
                                        onChange={(e) => updateCriterion(index, "description", e.target.value)}
                                        placeholder="Describe exactly what this criterion awards marks for."
                                    />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <div className="flex flex-wrap gap-3">
                    <Button type="submit" disabled={submitting}>
                        {submitting
                            ? "Saving..."
                            : rubricId
                                ? "Update Rubric Draft"
                                : "Save Rubric Draft"}
                    </Button>

                    <Button type="button" variant="outline" onClick={() => router.push("/contributor/rubrics")}>
                        Cancel
                    </Button>

                    <Button type="button" variant="outline" asChild>
                        <a href={`/contributor/questions`}>Back to Question Drafts</a>
                    </Button>
                </div>
            </form>
        </div>
    );
}
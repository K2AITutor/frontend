"use client";

import { useState } from "react";
import { FileQuestion, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import AdminContentListPage, {
  formatDate,
  StatusBadge,
} from "../_components/AdminContentListPage";
import type { AdminQuestion } from "@/lib/api/admin-content";
import { useSubjectOptions, useTopicOptions, useSkillOptions } from "@/lib/api/admin-content";
import {
  getQuestionForEdit,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  type DatasetQaReview,
} from "@/lib/api/questions-admin";
import { useAdminToken } from "@/lib/api/useAdminToken";
import {
  QUESTION_TYPE_OPTIONS,
  DIFFICULTY_OPTIONS,
  EXAM_STYLE_OPTIONS,
  ANSWER_TYPE_OPTIONS,
  CONTENT_STATUS_OPTIONS,
} from "@/lib/constants/question-enums";
import { Button } from "@/components/dashboard/ui/button";
import { Input } from "@/components/dashboard/ui/input";
import { Textarea } from "@/components/dashboard/ui/textarea";
import { Combobox } from "@/components/dashboard/ui/combobox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/dashboard/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/dashboard/ui/dialog";
import { toast } from "@/components/dashboard/ui/sonner";

type QuestionForm = {
  subjectCode: string;
  topicCode: string;
  skillCode: string;
  title: string;
  questionText: string;
  questionType: string;
  difficultyLevel: string;
  examStyleType: string;
  answerType: string;
  marks: number;
  correctAnswer: string;
  solutionSteps: string;
  misconceptions: string;
  status: string;
  tags: string;
  sourceBook: string;
  sourceChapter: string;
  sourceSection: string;
  sourceExercise: string;
  sourceQuestionRef: string;
};

const EMPTY_FORM: QuestionForm = {
  subjectCode: "",
  topicCode: "",
  skillCode: "",
  title: "",
  questionText: "",
  questionType: "",
  difficultyLevel: "",
  examStyleType: "",
  answerType: "EXPRESSION",
  marks: 1,
  correctAnswer: "",
  solutionSteps: "",
  misconceptions: "",
  status: "DRAFT",
  tags: "",
  sourceBook: "",
  sourceChapter: "",
  sourceSection: "",
  sourceExercise: "",
  sourceQuestionRef: "",
};

function jsonToLines(value: unknown): string {
  if (Array.isArray(value)) return value.map((v) => String(v)).join("\n");
  if (typeof value === "string") return value;
  return "";
}

function EnumSelect({
  value,
  onChange,
  options,
  placeholder,
  allowEmpty = true,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  placeholder: string;
  allowEmpty?: boolean;
}) {
  return (
    <Select
      value={value || (allowEmpty ? "__none" : value)}
      onValueChange={(v) => onChange(v === "__none" ? "" : v)}
    >
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {allowEmpty && <SelectItem value="__none">None</SelectItem>}
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default function AdminContentQuestionsPage() {
  const token = useAdminToken();
  const queryClient = useQueryClient();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<AdminQuestion | null>(null);
  const [form, setForm] = useState<QuestionForm>(EMPTY_FORM);
  const [reviewInfo, setReviewInfo] = useState<DatasetQaReview | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingForm, setIsLoadingForm] = useState(false);

  const { options: subjectOptions } = useSubjectOptions();
  const { options: topicOptions } = useTopicOptions(form.subjectCode || undefined);
  const { options: skillOptions } = useSkillOptions(
    form.subjectCode || undefined,
    form.topicCode || undefined
  );

  function refresh() {
    queryClient.invalidateQueries({ queryKey: ["admin", "content", "questions"] });
  }

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setReviewInfo(null);
    setIsDialogOpen(true);
  }

  async function openEdit(question: AdminQuestion) {
    if (!token) {
      toast.error("Admin session is not ready");
      return;
    }
    setEditingId(question.id);
    setForm(EMPTY_FORM);
    setReviewInfo(null);
    setIsDialogOpen(true);
    setIsLoadingForm(true);
    try {
      const detail = await getQuestionForEdit(question.id, token);
      setReviewInfo(detail.datasetQa ?? null);
      setForm({
        subjectCode: detail.subjectCode,
        topicCode: detail.topicCode,
        skillCode: detail.skillCode,
        title: detail.title ?? "",
        questionText: detail.questionText,
        questionType: detail.questionType ?? "",
        difficultyLevel: detail.difficultyLevel ?? "",
        examStyleType: detail.examStyleType ?? "",
        answerType: detail.answerType ?? "EXPRESSION",
        marks: detail.marks ?? 1,
        correctAnswer: detail.correctAnswer ?? "",
        solutionSteps: jsonToLines(detail.solutionSteps),
        misconceptions: jsonToLines(detail.misconceptions),
        status: detail.status ?? "ACTIVE",
        tags: (detail.tags ?? []).join(", "),
        sourceBook: detail.sourceBook ?? "",
        sourceChapter: detail.sourceChapter ?? "",
        sourceSection: detail.sourceSection ?? "",
        sourceExercise: detail.sourceExercise ?? "",
        sourceQuestionRef: detail.sourceQuestionRef ?? "",
      });
    } catch (err) {
      console.error("Failed to load question:", err);
      toast.error("Failed to load question");
      setIsDialogOpen(false);
    } finally {
      setIsLoadingForm(false);
    }
  }

  async function handleSave() {
    if (!token) {
      toast.error("Admin session is not ready");
      return;
    }
    if (!form.subjectCode || !form.topicCode || !form.skillCode || !form.questionText) return;

    const payload = {
      subjectCode: form.subjectCode,
      topicCode: form.topicCode,
      skillCode: form.skillCode,
      title: form.title,
      questionText: form.questionText,
      questionType: form.questionType || undefined,
      difficultyLevel: form.difficultyLevel || undefined,
      examStyleType: form.examStyleType || undefined,
      answerType: form.answerType,
      marks: form.marks,
      correctAnswer: form.correctAnswer,
      solutionSteps: form.solutionSteps,
      misconceptions: form.misconceptions,
      status: form.status,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      sourceBook: form.sourceBook,
      sourceChapter: form.sourceChapter,
      sourceSection: form.sourceSection,
      sourceExercise: form.sourceExercise,
      sourceQuestionRef: form.sourceQuestionRef,
    };

    setIsSubmitting(true);
    try {
      if (editingId) {
        await updateQuestion(editingId, payload, token);
      } else {
        await createQuestion(payload, token);
      }
      setIsDialogOpen(false);
      refresh();
      toast.success(editingId ? "Question updated successfully" : "Question created successfully");
    } catch (err) {
      console.error("Failed to save question:", err);
      toast.error(err instanceof Error ? err.message : "Failed to save question");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleting || !token) return;
    setIsSubmitting(true);
    try {
      await deleteQuestion(deleting.id, token);
      setIsDeleteOpen(false);
      refresh();
      toast.success("Question deleted successfully");
    } catch (err) {
      console.error("Failed to delete question:", err);
      toast.error(err instanceof Error ? err.message : "Failed to delete question");
    } finally {
      setIsSubmitting(false);
      setDeleting(null);
    }
  }

  return (
    <>
      <AdminContentListPage<AdminQuestion>
        title="Questions"
        description="Manage canonical and contributor-authored questions."
        kind="questions"
        icon={<FileQuestion className="h-4 w-4" />}
        filters={[
          { key: "subject", label: "Subject", source: "subjects", placeholder: "All subjects" },
          {
            key: "topicCode",
            label: "Topic",
            source: "topics",
            dependsOn: "subject",
            placeholder: "All topics",
          },
          {
            key: "skillCode",
            label: "Skill",
            source: "skills",
            dependsOn: "topicCode",
            placeholder: "All skills",
          },
          { key: "status", label: "Status", type: "select", options: CONTENT_STATUS_OPTIONS },
          { key: "examStyle", label: "Exam Style", type: "select", options: EXAM_STYLE_OPTIONS },
        ]}
        toolbarActions={
          <Button size="sm" onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Question
          </Button>
        }
        rowActions={(item) => (
          <div className="flex items-center justify-end gap-1">
            <Button variant="ghost" size="sm" onClick={() => openEdit(item)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-600"
              onClick={() => {
                setDeleting(item);
                setIsDeleteOpen(true);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
        columns={[
          { key: "id", label: "ID", render: (item) => <span className="font-mono text-xs">#{item.id}</span> },
          {
            key: "question",
            label: "Question",
            className: "max-w-[320px]",
            render: (item) => (
              <div className="space-y-1">
                <p className="truncate font-medium">{item.title || item.questionText}</p>
                <p className="truncate text-xs text-muted-foreground">{item.sourceQuestionRef ?? item.topic?.name ?? "-"}</p>
              </div>
            ),
          },
          { key: "topic", label: "Topic", render: (item) => <span className="font-mono text-xs">{item.topicCode}</span> },
          { key: "skill", label: "Skill", render: (item) => <span className="font-mono text-xs">{item.skillCode}</span> },
          { key: "style", label: "Style", render: (item) => item.examStyleType ?? "-" },
          { key: "marks", label: "Marks", render: (item) => item.marks },
          { key: "status", label: "Status", render: (item) => <StatusBadge value={item.status} /> },
          { key: "rubric", label: "Rubric", render: (item) => item.rubric ? <StatusBadge value={item.rubric.status} /> : "-" },
          { key: "review", label: "Review", render: (item) => item.reviewStatus ? <StatusBadge value={item.reviewStatus} /> : "-" },
          { key: "updated", label: "Updated", render: (item) => formatDate(item.updatedAt) },
        ]}
      />

      {/* Question Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Question" : "Add Question"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Update the question details." : "Create a new question."}
            </DialogDescription>
          </DialogHeader>

          {isLoadingForm ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid gap-4 py-4 sm:grid-cols-2">
              {reviewInfo && (
                <div className="rounded-md border border-border bg-muted/40 p-3 sm:col-span-2">
                  <p className="mb-2 text-sm font-semibold">Contributor review</p>
                  <div className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
                    <p>
                      <span className="text-muted-foreground">Status: </span>
                      {reviewInfo.status || "-"}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Reviewer: </span>
                      {reviewInfo.reviewerName || "-"}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Reviewed at: </span>
                      {reviewInfo.reviewedAt ? formatDate(reviewInfo.reviewedAt) : "-"}
                    </p>
                  </div>
                  {reviewInfo.notes ? (
                    <p className="mt-2 whitespace-pre-wrap text-sm">
                      <span className="text-muted-foreground">Notes: </span>
                      {reviewInfo.notes}
                    </p>
                  ) : null}
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <Combobox
                  options={subjectOptions}
                  value={form.subjectCode}
                  onChange={(value) =>
                    setForm({ ...form, subjectCode: value, topicCode: "", skillCode: "" })
                  }
                  placeholder="Select subject"
                  searchPlaceholder="Search subjects..."
                  allowClear={false}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Topic</label>
                <Combobox
                  options={topicOptions}
                  value={form.topicCode}
                  onChange={(value) => setForm({ ...form, topicCode: value, skillCode: "" })}
                  placeholder="Select topic"
                  searchPlaceholder="Search topics..."
                  disabled={!form.subjectCode}
                  allowClear={false}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Skill</label>
                <Combobox
                  options={skillOptions}
                  value={form.skillCode}
                  onChange={(value) => setForm({ ...form, skillCode: value })}
                  placeholder="Select skill"
                  searchPlaceholder="Search skills..."
                  disabled={!form.topicCode}
                  allowClear={false}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Optional title"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium">Question Text</label>
                <Textarea
                  value={form.questionText}
                  onChange={(e) => setForm({ ...form, questionText: e.target.value })}
                  placeholder="Enter the question"
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Question Type</label>
                <EnumSelect
                  value={form.questionType}
                  onChange={(value) => setForm({ ...form, questionType: value })}
                  options={QUESTION_TYPE_OPTIONS}
                  placeholder="Select type"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Difficulty</label>
                <EnumSelect
                  value={form.difficultyLevel}
                  onChange={(value) => setForm({ ...form, difficultyLevel: value })}
                  options={DIFFICULTY_OPTIONS}
                  placeholder="Select difficulty"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Exam Style</label>
                <EnumSelect
                  value={form.examStyleType}
                  onChange={(value) => setForm({ ...form, examStyleType: value })}
                  options={EXAM_STYLE_OPTIONS}
                  placeholder="Select exam style"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Answer Type</label>
                <EnumSelect
                  value={form.answerType}
                  onChange={(value) => setForm({ ...form, answerType: value })}
                  options={ANSWER_TYPE_OPTIONS}
                  placeholder="Select answer type"
                  allowEmpty={false}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Marks</label>
                <Input
                  type="number"
                  min={1}
                  value={form.marks}
                  onChange={(e) => setForm({ ...form, marks: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <EnumSelect
                  value={form.status}
                  onChange={(value) => setForm({ ...form, status: value })}
                  options={CONTENT_STATUS_OPTIONS}
                  placeholder="Select status"
                  allowEmpty={false}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium">Correct Answer</label>
                <Input
                  value={form.correctAnswer}
                  onChange={(e) => setForm({ ...form, correctAnswer: e.target.value })}
                  placeholder="Expected answer"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium">Solution Steps</label>
                <Textarea
                  value={form.solutionSteps}
                  onChange={(e) => setForm({ ...form, solutionSteps: e.target.value })}
                  placeholder="One step per line"
                  rows={3}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium">Misconceptions</label>
                <Textarea
                  value={form.misconceptions}
                  onChange={(e) => setForm({ ...form, misconceptions: e.target.value })}
                  placeholder="One misconception per line"
                  rows={3}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium">Tags</label>
                <Input
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="Comma-separated tags"
                />
              </div>

              <div className="sm:col-span-2">
                <p className="mb-3 text-sm font-semibold text-muted-foreground">Source (optional)</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Book</label>
                    <Input
                      value={form.sourceBook}
                      onChange={(e) => setForm({ ...form, sourceBook: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Chapter</label>
                    <Input
                      value={form.sourceChapter}
                      onChange={(e) => setForm({ ...form, sourceChapter: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Section</label>
                    <Input
                      value={form.sourceSection}
                      onChange={(e) => setForm({ ...form, sourceSection: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Exercise</label>
                    <Input
                      value={form.sourceExercise}
                      onChange={(e) => setForm({ ...form, sourceExercise: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-sm font-medium">Question Reference</label>
                    <Input
                      value={form.sourceQuestionRef}
                      onChange={(e) => setForm({ ...form, sourceQuestionRef: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                isSubmitting ||
                isLoadingForm ||
                !form.subjectCode ||
                !form.topicCode ||
                !form.skillCode ||
                !form.questionText
              }
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete question{" "}
              <span className="font-mono">#{deleting?.id}</span>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

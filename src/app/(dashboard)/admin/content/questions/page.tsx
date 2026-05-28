"use client";

import { FileQuestion } from "lucide-react";
import AdminContentListPage, {
  formatDate,
  StatusBadge,
} from "../_components/AdminContentListPage";
import type { AdminQuestion } from "@/lib/api/admin-content";

const CONTENT_STATUS_OPTIONS = [
  { label: "Draft", value: "DRAFT" },
  { label: "Review", value: "REVIEW" },
  { label: "Active", value: "ACTIVE" },
  { label: "Archived", value: "ARCHIVED" },
];

const EXAM_STYLE_OPTIONS = [
  { label: "Topic", value: "TOPIC" },
  { label: "Exam 1", value: "EXAM1" },
  { label: "Exam 2", value: "EXAM2" },
  { label: "Mixed", value: "MIXED" },
  { label: "Mock", value: "MOCK" },
];

export default function AdminContentQuestionsPage() {
  return (
    <AdminContentListPage<AdminQuestion>
      title="Questions"
      description="Read-only view of canonical and contributor-authored questions."
      kind="questions"
      icon={<FileQuestion className="h-4 w-4" />}
      filters={[
        { key: "subject", label: "Subject", placeholder: "MATH_METHODS" },
        { key: "topicCode", label: "Topic Code", placeholder: "MM_FUNC" },
        { key: "skillCode", label: "Skill Code", placeholder: "SKILL_CODE" },
        { key: "status", label: "Status", type: "select", options: CONTENT_STATUS_OPTIONS },
        { key: "examStyle", label: "Exam Style", type: "select", options: EXAM_STYLE_OPTIONS },
      ]}
      columns={[
        { key: "id", label: "ID", render: (item) => <span className="font-mono text-xs">#{item.id}</span> },
        {
          key: "question",
          label: "Question",
          className: "max-w-[320px]",
          render: (item) => (
            <div className="space-y-1">
              <p className="truncate font-medium">{item.title || item.questionText || item.prompt}</p>
              <p className="truncate text-xs text-muted-foreground">{item.sourceRef ?? item.topic?.name ?? "-"}</p>
            </div>
          ),
        },
        { key: "topic", label: "Topic", render: (item) => <span className="font-mono text-xs">{item.topicCode}</span> },
        { key: "skill", label: "Skill", render: (item) => <span className="font-mono text-xs">{item.skillCode}</span> },
        { key: "style", label: "Style", render: (item) => item.examStyleType ?? item.examStyle ?? "-" },
        { key: "marks", label: "Marks", render: (item) => item.marks },
        { key: "status", label: "Status", render: (item) => <StatusBadge value={item.status} /> },
        { key: "rubric", label: "Rubric", render: (item) => item.rubric ? <StatusBadge value={item.rubric.status} /> : "-" },
        { key: "updated", label: "Updated", render: (item) => formatDate(item.updatedAt) },
      ]}
    />
  );
}

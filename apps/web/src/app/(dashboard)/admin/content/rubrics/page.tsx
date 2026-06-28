"use client";

import { ClipboardCheck } from "lucide-react";
import AdminContentListPage, {
  formatDate,
  StatusBadge,
} from "../_components/AdminContentListPage";
import type { AdminRubric } from "@/lib/api/admin-content";

const CONTENT_STATUS_OPTIONS = [
  { label: "Draft", value: "DRAFT" },
  { label: "Review", value: "REVIEW" },
  { label: "Active", value: "ACTIVE" },
  { label: "Archived", value: "ARCHIVED" },
];

export default function AdminContentRubricsPage() {
  return (
    <AdminContentListPage<AdminRubric>
      title="Rubrics"
      description="Read-only view of rubrics and their linked questions."
      kind="rubrics"
      icon={<ClipboardCheck className="h-4 w-4" />}
      filters={[
        { key: "questionId", label: "Question ID", placeholder: "123" },
        { key: "status", label: "Status", type: "select", options: CONTENT_STATUS_OPTIONS },
      ]}
      columns={[
        { key: "id", label: "Rubric", render: (item) => <span className="font-mono text-xs">#{item.id}</span> },
        { key: "questionId", label: "Question", render: (item) => <span className="font-mono text-xs">#{item.questionId}</span> },
        {
          key: "question",
          label: "Question Preview",
          className: "max-w-[360px]",
          render: (item) => (
            <div className="space-y-1">
              <p className="truncate font-medium">
                {item.question?.title || item.question?.questionText || "-"}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {item.question?.topicCode ?? "-"} / {item.question?.skillCode ?? "-"}
              </p>
            </div>
          ),
        },
        { key: "key", label: "Key", render: (item) => item.rubricKey ?? "-" },
        { key: "marks", label: "Marks", render: (item) => item.maxMarks },
        { key: "criteria", label: "Criteria", render: (item) => item._count?.criteria ?? 0 },
        { key: "status", label: "Status", render: (item) => <StatusBadge value={item.status} /> },
        { key: "updated", label: "Updated", render: (item) => formatDate(item.updatedAt) },
      ]}
    />
  );
}

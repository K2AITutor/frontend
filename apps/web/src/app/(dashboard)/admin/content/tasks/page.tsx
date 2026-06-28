"use client";

import { ClipboardList } from "lucide-react";
import AdminContentListPage, {
  formatDate,
  formatUserName,
  StatusBadge,
} from "../_components/AdminContentListPage";
import type { AdminContributorTask } from "@/lib/api/admin-content";

const TASK_TYPE_OPTIONS = [
  { label: "Question Entry", value: "QUESTION_ENTRY" },
  { label: "Rubric Build", value: "RUBRIC_BUILD" },
  { label: "Annotation", value: "ANNOTATION" },
  { label: "AI QA", value: "AI_QA" },
  { label: "Dataset Check", value: "DATASET_CHECK" },
];

const TASK_STATUS_OPTIONS = [
  { label: "Todo", value: "TODO" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "In Review", value: "IN_REVIEW" },
  { label: "Done", value: "DONE" },
  { label: "Blocked", value: "BLOCKED" },
];

export default function AdminContentTasksPage() {
  return (
    <AdminContentListPage<AdminContributorTask>
      title="Contributor Tasks"
      description="Read-only view of internal content operation tasks."
      kind="tasks"
      icon={<ClipboardList className="h-4 w-4" />}
      filters={[
        { key: "type", label: "Type", type: "select", options: TASK_TYPE_OPTIONS },
        { key: "status", label: "Status", type: "select", options: TASK_STATUS_OPTIONS },
        { key: "assignee", label: "Assignee", placeholder: "name or email" },
      ]}
      columns={[
        { key: "id", label: "ID", render: (item) => <span className="font-mono text-xs">#{item.id}</span> },
        {
          key: "title",
          label: "Task",
          className: "max-w-[360px]",
          render: (item) => (
            <div className="space-y-1">
              <p className="truncate font-medium">{item.title}</p>
              <p className="truncate text-xs text-muted-foreground">{item.description ?? "-"}</p>
            </div>
          ),
        },
        { key: "type", label: "Type", render: (item) => <StatusBadge value={item.type} /> },
        { key: "status", label: "Status", render: (item) => <StatusBadge value={item.status} /> },
        { key: "priority", label: "Priority", render: (item) => item.priority },
        { key: "assignee", label: "Assignee", render: (item) => formatUserName(item.assignedTo) },
        { key: "question", label: "Question", render: (item) => item.questionId ? <span className="font-mono text-xs">#{item.questionId}</span> : "-" },
        { key: "due", label: "Due", render: (item) => formatDate(item.dueAt) },
        { key: "updated", label: "Updated", render: (item) => formatDate(item.updatedAt) },
      ]}
    />
  );
}

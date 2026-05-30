"use client";

import { BookOpen } from "lucide-react";
import AdminContentListPage, {
  formatDate,
  StatusBadge,
} from "../_components/AdminContentListPage";
import type { AdminTopic } from "@/lib/api/admin-content";

export default function AdminContentTopicsPage() {
  return (
    <AdminContentListPage<AdminTopic>
      title="Topics"
      description="Read-only view of the curriculum topic catalogue."
      kind="topics"
      icon={<BookOpen className="h-4 w-4" />}
      filters={[
        { key: "subjectCode", label: "Subject", placeholder: "MATH_METHODS" },
        { key: "topicCode", label: "Topic Code", placeholder: "MM_FUNC" },
        {
          key: "isActive",
          label: "Status",
          type: "select",
          options: [
            { label: "Active", value: "true" },
            { label: "Inactive", value: "false" },
          ],
        },
      ]}
      columns={[
        { key: "code", label: "Topic Code", render: (item) => <span className="font-mono text-xs">{item.topicCode}</span> },
        { key: "name", label: "Name", render: (item) => <span className="font-medium">{item.name}</span> },
        { key: "subject", label: "Subject", render: (item) => item.subjectCode },
        { key: "strand", label: "Strand", render: (item) => item.strandName },
        { key: "questions", label: "Questions", render: (item) => item._count?.questions ?? 0 },
        { key: "status", label: "Status", render: (item) => <StatusBadge value={item.isActive} /> },
        { key: "updated", label: "Updated", render: (item) => formatDate(item.updatedAt) },
      ]}
    />
  );
}

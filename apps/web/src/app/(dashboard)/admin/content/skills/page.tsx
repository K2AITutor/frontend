"use client";

import { ListChecks } from "lucide-react";
import AdminContentListPage, {
  formatDate,
} from "../_components/AdminContentListPage";
import type { AdminSkill } from "@/lib/api/admin-content";

export default function AdminContentSkillsPage() {
  return (
    <AdminContentListPage<AdminSkill>
      title="Skills"
      description="Read-only view of skills mapped to subjects and topics."
      kind="skills"
      icon={<ListChecks className="h-4 w-4" />}
      filters={[
        { key: "subjectCode", label: "Subject", placeholder: "MATH_METHODS" },
        { key: "topicCode", label: "Topic Code", placeholder: "MM_FUNC" },
      ]}
      columns={[
        { key: "skill", label: "Skill Code", render: (item) => <span className="font-mono text-xs">{item.skillCode}</span> },
        { key: "name", label: "Name", render: (item) => <span className="font-medium">{item.name}</span> },
        { key: "subject", label: "Subject", render: (item) => item.subjectCode },
        { key: "topic", label: "Topic", render: (item) => <span className="font-mono text-xs">{item.topicCode}</span> },
        { key: "difficulty", label: "Difficulty", render: (item) => item.difficultyBand ?? "-" },
        { key: "updated", label: "Updated", render: (item) => formatDate(item.updatedAt) },
      ]}
    />
  );
}

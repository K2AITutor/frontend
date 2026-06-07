"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/apiClient";
import { useAdminToken } from "@/lib/api/useAdminToken";

export type AdminContentKind = "topics" | "skills" | "questions" | "rubrics" | "tasks";

export interface AdminContentListResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AdminTopic {
  id: number;
  subjectCode: string;
  topicCode: string;
  name: string;
  strandCode: string;
  strandName: string;
  unitLabel: string | null;
  sortOrder: number;
  isActive: boolean;
  updatedAt: string;
  _count?: { questions: number };
}

export interface AdminSkill {
  id: number;
  subjectCode: string;
  topicCode: string;
  skillCode: string;
  name: string;
  difficultyBand: string | null;
  updatedAt: string;
}

export interface AdminQuestion {
  id: number;
  subject: string;
  subjectCode: string | null;
  topicCode: string;
  skillCode: string;
  examStyle: string | null;
  examStyleType: string | null;
  status: string;
  title: string | null;
  prompt: string;
  questionText: string | null;
  difficulty: string | null;
  difficultyLevel: string | null;
  marks: number;
  isMarkable: boolean;
  sourceQuestionRef: string | null;
  createdAt: string;
  updatedAt: string;
  topic?: { name: string } | null;
  rubric?: { id: number; status: string; maxMarks: number } | null;
}

export interface AdminRubric {
  id: number;
  questionId: number;
  rubricKey: string | null;
  maxMarks: number;
  status: string;
  approvedAt: string | null;
  updatedAt: string;
  question?: {
    subject: string;
    subjectCode: string | null;
    topicCode: string;
    skillCode: string;
    prompt: string;
    questionText: string | null;
    title: string | null;
  } | null;
  _count?: { criteria: number };
}

export interface AdminContentUserRef {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
}

export interface AdminContributorTask {
  id: number;
  type: string;
  status: string;
  priority: number;
  title: string;
  description: string | null;
  questionId: number | null;
  dueAt: string | null;
  createdAt: string;
  updatedAt: string;
  assignedTo?: AdminContentUserRef | null;
  createdBy?: AdminContentUserRef | null;
}

export type AdminContentItem =
  | AdminTopic
  | AdminSkill
  | AdminQuestion
  | AdminRubric
  | AdminContributorTask;

export interface AdminContentFilters {
  page?: number;
  pageSize?: number;
  subjectCode?: string;
  subject?: string;
  topicCode?: string;
  skillCode?: string;
  status?: string;
  examStyle?: string;
  isActive?: string;
  questionId?: string;
  type?: string;
  assignee?: string;
}

export function useAdminContentList<T extends AdminContentItem>(
  kind: AdminContentKind,
  filters: AdminContentFilters
) {
  const token = useAdminToken();
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    params.set(key, String(value));
  });

  const query = params.toString();

  return useQuery({
    queryKey: ["admin", "content", kind, filters, token],
    queryFn: () =>
      apiGet<AdminContentListResponse<T>>(
        `/admin/content/${kind}${query ? `?${query}` : ""}`,
        token
      ),
    enabled: !!token,
  });
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/apiClient";
import { useAdminToken } from "@/lib/api/useAdminToken";
import { fetchSubjects } from "@/lib/api/subjects";

export interface ComboboxOption {
  label: string;
  value: string;
}

// Fetch many records so the combobox can filter client-side (revisit if >500/subject).
const OPTION_PAGE_SIZE = 500;

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
  subjectCode: string;
  topicCode: string;
  skillCode: string;
  examStyleType: string | null;
  status: string;
  title: string | null;
  questionText: string;
  difficultyLevel: string | null;
  marks: number;
  isMarkable: boolean;
  sourceQuestionRef: string | null;
  createdAt: string;
  updatedAt: string;
  topic?: { name: string } | null;
  rubric?: { id: number; status: string; maxMarks: number } | null;
  /** Contributor QA status (markingMeta.datasetQa.status); null if not reviewed yet. */
  reviewStatus?: string | null;
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
    subjectCode: string;
    topicCode: string;
    skillCode: string;
    questionText: string;
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

// ==================== Option hooks for dropdown-from-list filters/forms ====================

export function useSubjectOptions() {
  const query = useQuery({
    queryKey: ["admin", "options", "subjects"],
    queryFn: () => fetchSubjects(),
    staleTime: 5 * 60 * 1000,
  });

  const options: ComboboxOption[] = (query.data ?? [])
    .filter((subject) => !!subject.code)
    .map((subject) => ({ label: subject.name, value: subject.code as string }));

  return { ...query, options };
}

export function useTopicOptions(subjectCode?: string) {
  const token = useAdminToken();
  const params = new URLSearchParams({ pageSize: String(OPTION_PAGE_SIZE) });
  if (subjectCode) params.set("subjectCode", subjectCode);

  const query = useQuery({
    queryKey: ["admin", "options", "topics", subjectCode, token],
    queryFn: () =>
      apiGet<AdminContentListResponse<AdminTopic>>(
        `/admin/content/topics?${params.toString()}`,
        token
      ),
    enabled: !!token,
    staleTime: 60 * 1000,
  });

  const options: ComboboxOption[] = (query.data?.items ?? []).map((topic) => ({
    label: `${topic.topicCode} — ${topic.name}`,
    value: topic.topicCode,
  }));

  return { ...query, options };
}

export function useSkillOptions(subjectCode?: string, topicCode?: string) {
  const token = useAdminToken();
  const params = new URLSearchParams({ pageSize: String(OPTION_PAGE_SIZE) });
  if (subjectCode) params.set("subjectCode", subjectCode);
  if (topicCode) params.set("topicCode", topicCode);

  const query = useQuery({
    queryKey: ["admin", "options", "skills", subjectCode, topicCode, token],
    queryFn: () =>
      apiGet<AdminContentListResponse<AdminSkill>>(
        `/admin/content/skills?${params.toString()}`,
        token
      ),
    enabled: !!token,
    staleTime: 60 * 1000,
  });

  const options: ComboboxOption[] = (query.data?.items ?? []).map((skill) => ({
    label: `${skill.skillCode} — ${skill.name}`,
    value: skill.skillCode,
  }));

  return { ...query, options };
}

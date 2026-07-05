import { useQuery } from "@tanstack/react-query";
import { PATH } from "@aitutor/shared";
import { apiGet, apiPost, apiPut, apiDelete } from "../apiClient";
import type {
  Subject,
  CreateSubjectDto,
  UpdateSubjectDto,
} from "@aitutor/shared";

export type { Subject, CreateSubjectDto, UpdateSubjectDto };

export async function fetchSubjects(): Promise<Subject[]> {
  return apiGet<Subject[]>(PATH.subjects.list);
}

export async function fetchSubjectById(id: number): Promise<Subject> {
  return apiGet<Subject>(PATH.subjects.byId(id));
}

export async function createSubject(dto: CreateSubjectDto, token?: string): Promise<Subject> {
  return apiPost<Subject>(PATH.admin.subjects, dto, token);
}

export async function updateSubject(id: number, dto: UpdateSubjectDto, token?: string): Promise<Subject> {
  return apiPut<Subject>(PATH.admin.subjectById(id), dto, token);
}

export async function deleteSubject(id: number, token?: string): Promise<void> {
  return apiDelete<void>(PATH.admin.subjectById(id), token);
}

export type SubjectStatus = "active" | "coming";

export interface PracticeSubjectPersonalized {
  code: string;
  name: string;
  slug: string;
  icon: string | null;
  status: SubjectStatus;
  order: number;
  progressPercent: number;
  questionsAttempted: number;
  averageScore: number;
  recommended: boolean;
}

export interface PracticeSubjectsResponse {
  subjects: PracticeSubjectPersonalized[];
}

export function usePracticeSubjects() {
  return useQuery({
    queryKey: ["practice-subjects"],
    queryFn: () =>
      apiGet<PracticeSubjectsResponse>("/student/practice-subjects"),
  });
}

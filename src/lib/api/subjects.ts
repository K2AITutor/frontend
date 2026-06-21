import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/apiClient";

const API_BASE_RAW =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:4000";

const API_BASE = (() => {
  const clean = String(API_BASE_RAW).replace(/\/+$/, "");
  return clean.endsWith("/api") ? clean : `${clean}/api`;
})();

export interface Subject {
  id: number;
  code?: string;
  name: string;
  description?: string;
  icon?: string;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSubjectDto {
  name: string;
  code?: string;
  description?: string;
  icon?: string;
}

export interface UpdateSubjectDto {
  name?: string;
  description?: string;
  icon?: string;
}

export async function fetchSubjects(): Promise<Subject[]> {
  const res = await fetch(`${API_BASE}/subjects`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch subjects");
  return res.json();
}

export async function fetchSubjectById(id: number): Promise<Subject> {
  const res = await fetch(`${API_BASE}/subjects/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch subject");
  return res.json();
}

export async function createSubject(dto: CreateSubjectDto, token?: string): Promise<Subject> {
  const res = await fetch(`${API_BASE}/admin/subjects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(dto),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to create subject");
  return res.json();
}

export async function updateSubject(id: number, dto: UpdateSubjectDto, token?: string): Promise<Subject> {
  const res = await fetch(`${API_BASE}/admin/subjects/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(dto),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to update subject");
  return res.json();
}

export async function deleteSubject(id: number, token?: string): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/subjects/${id}`, {
    method: "DELETE",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to delete subject");
}

/* =========================================================
   PRACTICE SUBJECTS (Phase 2) — student personalized catalog
   Contract: _workspace/01_architect_spec.md §2b
   Endpoint: GET /api/student/practice-subjects (JwtAuthGuard)
   Response is an OBJECT wrapper { subjects: [...] }, NOT a bare array.
   ========================================================= */

export type SubjectStatus = "active" | "coming";

export interface PracticeSubjectPersonalized {
  code: string; // "MATH_METHODS"
  name: string; // "Maths Methods"
  slug: string; // "math-methods"
  icon: string | null; // "Calculator" (lucide icon name, may be null)
  status: SubjectStatus; // "active" | "coming"
  order: number; // 1...

  // ----- Personalized (by userId from token) -----
  progressPercent: number; // 0..100, rounded. 0 if not started.
  questionsAttempted: number; // total StudentQuestionAttempt of user in subject
  averageScore: number; // 0..100, rounded. 0 if no question attempted.
  recommended: boolean; // true for exactly 1 subject "to keep practicing"; false otherwise
}

export interface PracticeSubjectsResponse {
  subjects: PracticeSubjectPersonalized[]; // sorted by order asc
}

/**
 * Fetches the personalized practice-subjects catalog for the logged-in student.
 * apiGet attaches the Bearer token from the NextAuth session automatically
 * (see apiClient.ts), so we must NOT pass userId from the client.
 */
export function usePracticeSubjects() {
  return useQuery({
    queryKey: ["practice-subjects"],
    queryFn: () =>
      apiGet<PracticeSubjectsResponse>("/student/practice-subjects"),
  });
}

import type {
  Subject,
  CreateSubjectDto,
  UpdateSubjectDto,
} from "@aitutor/shared";

const API_BASE_RAW =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:4000";

const API_BASE = (() => {
  const clean = String(API_BASE_RAW).replace(/\/+$/, "");
  return clean.endsWith("/api") ? clean : `${clean}/api`;
})();

export type { Subject, CreateSubjectDto, UpdateSubjectDto };

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

export async function createSubject(dto: CreateSubjectDto): Promise<Subject> {
  const res = await fetch(`${API_BASE}/subjects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dto),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to create subject");
  return res.json();
}

export async function updateSubject(id: number, dto: UpdateSubjectDto): Promise<Subject> {
  const res = await fetch(`${API_BASE}/subjects/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dto),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to update subject");
  return res.json();
}

export async function deleteSubject(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/subjects/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to delete subject");
}

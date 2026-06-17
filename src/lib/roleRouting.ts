export const roleHomeMap: Record<string, string> = {
  admin: "/admin",
  contributor: "/contributor",
  student: "/student",
  teacher: "/teacher/review",
  parent: "/parent",
};

export function normalizeRole(role: unknown): string {
  return String(role ?? "").trim().toLowerCase();
}

export function homeForRole(role: unknown, fallback = "/student") {
  return roleHomeMap[normalizeRole(role)] ?? fallback;
}

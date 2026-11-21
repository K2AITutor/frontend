export const roleHomeMap: Record<string, string> = {
  admin: "/admin",
  contributor: "/contributor",
  student: "/student",
  teacher: "/teacher/review",
  parent: "/parent",
};

// First path segment -> roles allowed to open anything under it.
// Single source of truth for the edge middleware and the server layout guards.
// Every key here must also be listed in the `config.matcher` of `middleware.ts`,
// otherwise the middleware never runs for that prefix.
export const routeAccessMap: Record<string, string[]> = {
  admin: ["admin"],
  contributor: ["admin", "contributor", "teacher"],
  student: ["student"],
  teacher: ["teacher"],
  parent: ["parent"],
  // Exam attempt pages (e.g. /exam/[attemptId]/review) belong to the student exam flow.
  exam: ["student"],
  // Internal content tooling (e.g. /tools/pdf-cropper).
  tools: ["admin", "contributor"],
};

export function normalizeRole(role: unknown): string {
  return String(role ?? "").trim().toLowerCase();
}

export function homeForRole(role: unknown, fallback = "/student") {
  return roleHomeMap[normalizeRole(role)] ?? fallback;
}

// True when `role` may open `pathname`. Paths outside every protected prefix are allowed.
// Matching is per path segment, so "/exam" does not cover the public "/exams/*" assets.
export function isRoleAllowedForPath(pathname: string, role: unknown): boolean {
  for (const [prefix, allowedRoles] of Object.entries(routeAccessMap)) {
    if (pathname === `/${prefix}` || pathname.startsWith(`/${prefix}/`)) {
      return allowedRoles.includes(normalizeRole(role));
    }
  }
  return true;
}

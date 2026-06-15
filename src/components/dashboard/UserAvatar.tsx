"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/dashboard/ui/avatar";
import { cn } from "@/lib/utils";

// Deterministic gradient for avatar fallbacks so each user keeps a stable, distinct color.
const AVATAR_GRADIENTS = [
  "from-sky-500 to-blue-600",
  "from-violet-500 to-purple-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-600",
  "from-emerald-500 to-green-600",
  "from-cyan-500 to-teal-600",
  "from-indigo-500 to-blue-700",
  "from-fuchsia-500 to-pink-600",
];

export function avatarGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

/**
 * Shared user avatar: photo when available, otherwise a deterministic
 * gradient + initials. Used across admin (UserTable) and parent (ChildCard)
 * so a student looks identical everywhere.
 */
export function UserAvatar({
  name,
  src,
  className,
  fallbackClassName,
}: {
  name: string;
  src?: string | null;
  /** Sizing/ring overrides for the Avatar root (e.g. "h-9 w-9"). */
  className?: string;
  /** Extra classes for the fallback (e.g. text size for large avatars). */
  fallbackClassName?: string;
}) {
  return (
    <Avatar className={cn("ring-2 ring-white shadow-sm dark:ring-slate-800", className)}>
      <AvatarImage src={src ?? undefined} alt={name} />
      <AvatarFallback
        className={cn(
          "bg-gradient-to-br text-xs font-semibold text-white",
          avatarGradient(name),
          fallbackClassName
        )}
      >
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}

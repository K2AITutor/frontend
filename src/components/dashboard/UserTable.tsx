"use client";

import Link from "next/link";
import { Badge } from "@/components/dashboard/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/dashboard/ui/avatar";
import { Button } from "@/components/dashboard/ui/button";
import { DataTable, SortHeader } from "@/components/dashboard/DataTable";
import {
  CreditCard, ShieldCheck, Clock, CircleCheck, CircleX,
  MoreHorizontal, Eye, Power, Mail, Trash2, Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/dashboard/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
  yearLevel?: string | null;
  isActive?: boolean;
  emailVerified?: boolean;
  lastLoginAt?: string | null;
  joinedDate: string;
  status: string;
  avatar?: string | null;
  subscriptionStatus?: string | null;
}

interface UserTableProps {
  users: User[];
  className?: string;
  variant?: "students" | "staff";
  onView?: (userId: string) => void;
  onToggleActive?: (userId: string) => void;
  onResendVerification?: (userId: string) => void;
  onDeleteUser?: (userId: string) => void;
  loadingUserId?: string | null;
}

const columnHelper = createColumnHelper<User>();

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

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

function avatarGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

const ROLE_STYLES: Record<string, string> = {
  admin: "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900 dark:bg-purple-950/40 dark:text-purple-300",
  teacher: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300",
  contributor: "border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-900 dark:bg-cyan-950/40 dark:text-cyan-300",
  parent: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
};

// A small label + icon pill, easier to scan than a bare icon.
function StatusPill({
  ok,
  okLabel,
  badLabel,
  okIcon: OkIcon,
  badIcon: BadIcon,
  badTone = "red",
}: {
  ok: boolean;
  okLabel: string;
  badLabel: string;
  okIcon: typeof CircleCheck;
  badIcon: typeof CircleX;
  badTone?: "red" | "amber";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        ok
          ? "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300"
          : badTone === "amber"
            ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300"
            : "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
      )}
    >
      {ok ? <OkIcon className="h-3.5 w-3.5" /> : <BadIcon className="h-3.5 w-3.5" />}
      {ok ? okLabel : badLabel}
    </span>
  );
}

export interface UserColumnsOptions {
  variant?: "students" | "staff";
  /** When provided, "View Profile" opens via this callback (drawer) instead of navigating. */
  onView?: (userId: string) => void;
  onToggleActive?: (userId: string) => void;
  onResendVerification?: (userId: string) => void;
  onDeleteUser?: (userId: string) => void;
  loadingUserId?: string | null;
}

/**
 * The user-directory column set, shared by the full directory (DataTable
 * server mode in AdminUsersDirectory) and the dashboard preview (UserTable).
 */
export function getUserColumns({
  variant = "students",
  onView,
  onToggleActive,
  onResendVerification,
  onDeleteUser,
  loadingUserId,
}: UserColumnsOptions): ColumnDef<User, any>[] {
  return [
    columnHelper.accessor("name", {
      header: SortHeader("User"),
      cell: (info) => {
        const user = info.row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 ring-2 ring-white shadow-sm dark:ring-slate-800">
              <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
              <AvatarFallback
                className={cn(
                  "bg-gradient-to-br text-xs font-semibold text-white",
                  avatarGradient(user.name)
                )}
              >
                {initials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
        );
      },
    }),
    ...(variant === "staff" ? [
      columnHelper.accessor("role", {
        header: "Role",
        cell: (info) => {
          const role = (info.getValue() || "").toLowerCase();
          return (
            <Badge
              variant="outline"
              className={cn("capitalize font-medium", ROLE_STYLES[role] ?? "")}
            >
              {info.getValue()}
            </Badge>
          );
        },
      }),
    ] : [
      columnHelper.accessor("subscriptionStatus", {
      header: SortHeader("Subscription"),
      cell: (info) => {
        const val = info.getValue();
        if (!val) return <span className="text-xs text-muted-foreground italic">None</span>;

        const isActive = val.toLowerCase() === 'active';
        return (
          <Badge variant="outline" className={cn(
            "gap-1 font-medium",
            isActive
              ? "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300"
              : "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-300"
          )}>
            <CreditCard className="h-3 w-3" />
            {val.charAt(0).toUpperCase() + val.slice(1)}
          </Badge>
        );
      },
      }),
      columnHelper.accessor("yearLevel", {
        header: "Year Level",
        cell: (info) => {
          const val = info.getValue();
          if (!val) return <span className="text-xs text-muted-foreground italic">-</span>;
          return (
            <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {val}
            </span>
          );
        },
      }),
    ]),
    columnHelper.accessor("isActive", {
      header: "Status",
      cell: (info) => (
        <StatusPill
          ok={!!info.getValue()}
          okLabel="Active"
          badLabel="Inactive"
          okIcon={CircleCheck}
          badIcon={CircleX}
        />
      ),
    }),
    ...(variant === "students" ? [
      columnHelper.accessor("emailVerified", {
      header: "Verified",
      cell: (info) => (
        <StatusPill
          ok={!!info.getValue()}
          okLabel="Verified"
          badLabel="Pending"
          okIcon={ShieldCheck}
          badIcon={Clock}
          badTone="amber"
        />
      ),
      }),
    ] : []),
    columnHelper.accessor("lastLoginAt", {
      header: SortHeader("Last Login"),
      cell: (info) => {
        const val = info.getValue();
        if (!val) return <span className="text-xs text-muted-foreground italic">Never</span>;
        return <span className="text-sm text-muted-foreground">{formatDate(val)}</span>;
      },
    }),
    columnHelper.accessor("joinedDate", {
      header: SortHeader("Joined"),
      cell: (info) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(info.getValue())}
        </span>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      enableSorting: false,
      cell: (info) => {
        const user = info.row.original;
        const isLoading = loadingUserId === user.id;

        return (
          <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MoreHorizontal className="h-4 w-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onView ? (
                <DropdownMenuItem onClick={() => onView(user.id)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Profile
                </DropdownMenuItem>
              ) : (
                <Link href={`/admin/students/${user.id}`}>
                  <DropdownMenuItem>
                    <Eye className="mr-2 h-4 w-4" />
                    View Profile
                  </DropdownMenuItem>
                </Link>
              )}
              <DropdownMenuItem onClick={() => onToggleActive?.(user.id)}>
                <Power className="mr-2 h-4 w-4" />
                {user.isActive ? "Deactivate" : "Activate"}
              </DropdownMenuItem>
              {!user.emailVerified && (
                <DropdownMenuItem onClick={() => onResendVerification?.(user.id)}>
                  <Mail className="mr-2 h-4 w-4" />
                  Resend Verification
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={() => onDeleteUser?.(user.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          </div>
        );
      },
    }),
  ];
}

/**
 * Lightweight, footer-less user table for embedded previews (e.g. the admin
 * dashboard). The full searchable/paginated directory uses DataTable directly.
 */
export function UserTable({
  users,
  className,
  variant = "students",
  onView,
  onToggleActive,
  onResendVerification,
  onDeleteUser,
  loadingUserId,
}: UserTableProps) {
  const columns = getUserColumns({
    variant,
    onView,
    onToggleActive,
    onResendVerification,
    onDeleteUser,
    loadingUserId,
  });

  return (
    <DataTable
      columns={columns}
      data={users}
      enableSearch={false}
      hideFooter
      emptyMessage="No users found."
      className={className}
    />
  );
}

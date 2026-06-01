"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/dashboard/ui/table";
import { Badge } from "@/components/dashboard/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/dashboard/ui/avatar";
import { Button } from "@/components/dashboard/ui/button";
import {
  ArrowUpDown, CreditCard, ShieldCheck, Clock, CircleCheck, CircleX,
  MoreHorizontal, Eye, Power, Mail, Trash2, Loader2, Search,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/dashboard/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
  getSortedRowModel,
} from "@tanstack/react-table";

interface User {
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

function SortHeader({ column, label }: { column: any; label: string }) {
  const sorted = column.getIsSorted();
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(sorted === "asc")}
      className={cn(
        "-ml-2 h-8 gap-1.5 px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground",
        sorted && "text-foreground"
      )}
    >
      {label}
      <ArrowUpDown className={cn("h-3.5 w-3.5", sorted ? "opacity-100" : "opacity-40")} />
    </Button>
  );
}

export function UserTable({
  users,
  className,
  variant = "students",
  onToggleActive,
  onResendVerification,
  onDeleteUser,
  loadingUserId,
}: UserTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = [
    columnHelper.accessor("name", {
      header: ({ column }) => <SortHeader column={column} label="User" />,
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
      header: ({ column }) => <SortHeader column={column} label="Subscription" />,
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
      header: ({ column }) => <SortHeader column={column} label="Last Login" />,
      cell: (info) => {
        const val = info.getValue();
        if (!val) return <span className="text-xs text-muted-foreground italic">Never</span>;
        return <span className="text-sm text-muted-foreground">{formatDate(val)}</span>;
      },
    }),
    columnHelper.accessor("joinedDate", {
      header: ({ column }) => <SortHeader column={column} label="Joined" />,
      cell: (info) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(info.getValue())}
        </span>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
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
              <Link href={`/admin/students/${user.id}`}>
                <DropdownMenuItem>
                  <Eye className="mr-2 h-4 w-4" />
                  View Profile
                </DropdownMenuItem>
              </Link>
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

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    onSortingChange: setSorting,
  });

  return (
    <div className={cn("overflow-hidden rounded-xl border border-border", className)}>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="border-b border-border bg-muted/60 hover:bg-muted/60"
            >
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="h-11 px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="border-b border-border/60 transition-colors hover:bg-muted/50"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-32 text-center">
                <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <Search className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-medium">No users found</p>
                  <p className="text-xs">Try adjusting your search or filters.</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

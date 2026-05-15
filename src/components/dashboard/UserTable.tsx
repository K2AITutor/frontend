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
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-0"
        >
          User
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: (info) => {
        const user = info.row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
              <AvatarFallback className="text-xs">
                {user.name.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
        );
      },
    }),
    ...(variant === "staff" ? [
      columnHelper.accessor("role", {
        header: "Role",
        cell: (info) => (
          <Badge variant="outline" className="capitalize">
            {info.getValue()}
          </Badge>
        ),
      }),
    ] : [
      columnHelper.accessor("subscriptionStatus", {
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-0"
        >
          Subscription
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: (info) => {
        const val = info.getValue();
        if (!val) return <span className="text-xs text-muted-foreground italic">None</span>;

        const isActive = val.toLowerCase() === 'active';
        return (
          <Badge variant="outline" className={cn(
            "gap-1",
            isActive
              ? "border-green-200 bg-green-50 text-green-700 font-medium"
              : "border-gray-200 bg-gray-50 text-gray-700"
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
          return <span className="text-sm">{val}</span>;
        },
      }),
    ]),
    columnHelper.accessor("isActive", {
      header: "Active",
      cell: (info) => {
        const active = info.getValue();
        return active ? (
          <CircleCheck className="h-4 w-4 text-green-500" />
        ) : (
          <CircleX className="h-4 w-4 text-red-500" />
        );
      },
    }),
    ...(variant === "students" ? [
      columnHelper.accessor("emailVerified", {
      header: "Verified",
      cell: (info) => {
        const verified = info.getValue();
        return verified ? (
          <ShieldCheck className="h-4 w-4 text-green-500" />
        ) : (
          <Clock className="h-4 w-4 text-amber-500" />
        );
      },
      }),
    ] : []),
    columnHelper.accessor("lastLoginAt", {
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-0"
        >
          Last Login
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: (info) => {
        const val = info.getValue();
        if (!val) return <span className="text-xs text-muted-foreground italic">Never</span>;
        return <span className="text-sm text-muted-foreground">{formatDate(val)}</span>;
      },
    }),
    columnHelper.accessor("joinedDate", {
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-0"
        >
          Joined
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: (info) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(info.getValue())}
        </span>
      ),
    }),
    columnHelper.display({
      id: "actions",
      cell: (info) => {
        const user = info.row.original;
        const isLoading = loadingUserId === user.id;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MoreHorizontal className="h-4 w-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <Link href={`/admin/users/${user.id}`}>
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
    <div className={cn("rounded-md border", className)}>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
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
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

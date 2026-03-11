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
import { MoreHorizontal, GraduationCap, Users, BookUser, ArrowUpDown, CreditCard } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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

type UserRole = "student" | "parent" | "teacher" | "admin";
type UserStatus = "active" | "pending" | "suspended";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  joinedDate: string;
  status: UserStatus;
  avatar?: string;
  subscriptionStatus?: string | null;
}

interface UserTableProps {
  users: User[];
  className?: string;
}

const columnHelper = createColumnHelper<User>();

const roleConfig: Record<
  UserRole,
  { icon: React.ReactNode; label: string; className: string }
> = {
  student: {
    icon: <GraduationCap className="h-3 w-3" />,
    label: "Student",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  },
  parent: {
    icon: <Users className="h-3 w-3" />,
    label: "Parent",
    className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  },
  teacher: {
    icon: <BookUser className="h-3 w-3" />,
    label: "Teacher",
    className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
  admin: {
    icon: null,
    label: "Admin",
    className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  },
};

const statusConfig: Record<UserStatus, { className: string }> = {
  active: {
    className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
  pending: {
    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  suspended: {
    className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  },
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function UserTable({ users, className }: UserTableProps) {
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
              <AvatarImage src={user.avatar} alt={user.name} />
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
    columnHelper.accessor("role", {
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-0"
        >
          Role
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: (info) => {
        const roleConf = roleConfig[info.getValue()];
        return (
          <Badge className={cn("gap-1", roleConf.className)}>
            {roleConf.icon}
            {roleConf.label}
          </Badge>
        );
      },
    }),
    columnHelper.accessor("status", {
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-0"
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: (info) => {
        const statusConf = statusConfig[info.getValue()];
        const status = info.getValue();
        return (
          <Badge variant="secondary" className={statusConf.className}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      },
    }),
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
      cell: (info) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View Profile</DropdownMenuItem>
            <Link href={`/admin/users/${info.row.original.id}/edit`}>
              <DropdownMenuItem>Edit User</DropdownMenuItem>
            </Link>
            <DropdownMenuItem className="text-red-600">
              Suspend User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
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

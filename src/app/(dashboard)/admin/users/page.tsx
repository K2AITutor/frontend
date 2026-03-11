"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/dashboard/ui/card";
import { Button } from "@/components/dashboard/ui/button";
import { Input } from "@/components/dashboard/ui/input";
import { UserTable } from "@/components/dashboard/UserTable";
import { useUsers } from "@/lib/api/users";
import {
  Users,
  Search,
  Filter,
  Plus,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Calendar,
  UserCheck,
  UserPlus,
  UserX,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/dashboard/ui/select";
import { cn } from "@/lib/utils";
import { StatsCard } from "@/components/dashboard/StatsCard";

type UserRole = "student" | "admin";
type UserStatus = "active" | "pending" | "suspended";

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data, isLoading, isError } = useUsers({
    page,
    limit,
    role: roleFilter,
    status: statusFilter,
    search: searchQuery,
    startDate,
    endDate
  });

  const users = data?.users || [];
  const totalUsers = data?.total || 0;
  const totalPages = data?.totalPages || 1;
  const globalStats = data?.stats || { total: 0, active: 0, pending: 0, suspended: 0 };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-screen flex-col gap-4 text-center p-6">
        <div className="bg-red-50 p-4 rounded-full">
          <UserX className="h-12 w-12 text-red-500" />
        </div>
        <h2 className="text-xl font-semibold">Error Loading Users</h2>
        <p className="text-muted-foreground max-w-sm">Failed to fetch users. Please check if the backend server is running and your network connection.</p>
        <Button onClick={() => window.location.reload()} variant="outline">Retry Connection</Button>
      </div>
    );
  }

  // Cast for component
  const formattedUsers = users.map(user => ({
    ...user,
    role: user.role as any,
    status: user.status as any
  }));

  return (
    <div className="space-y-6 p-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage your platform's user base, monitoring growth and activity.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/users/create">
            <Button className="shadow-sm">
              <Plus className="mr-2 h-4 w-4" />
              Add New User
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard
          title="Total Users"
          value={globalStats.total}
          subtitle="Registered Accounts"
          icon={Users}
          trend={{ value: 5.2, isPositive: true }}
        />

        <StatsCard
          title="Active Users"
          value={globalStats.active}
          subtitle="Working Accounts"
          icon={UserCheck}
          trend={{ value: 5.2, isPositive: true }}
        />

        <StatsCard
          title="Pending Users"
          value={globalStats.pending}
          subtitle="Awaiting Verification"
          icon={UserPlus}
          trend={{ value: 5.2, isPositive: true }}
        />

        <StatsCard
          title="Suspended Users"
          value={globalStats.suspended}
          subtitle="Inactive Accounts"
          icon={UserX}
          trend={{ value: 5.2, isPositive: true }}
        />
        {/* 
        <Card className="shadow-sm overflow-hidden border-none bg-green-50/30 dark:bg-green-900/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-green-500" />
              Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{globalStats.active}</div>
            <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
              Working Accounts
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm overflow-hidden border-none bg-amber-50/30 dark:bg-amber-900/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-amber-500" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{globalStats.pending}</div>
            <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
              Awaiting Verification
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm overflow-hidden border-none bg-red-50/30 dark:bg-red-900/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <UserX className="h-4 w-4 text-red-500" />
              Suspended
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{globalStats.suspended}</div>
            <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
              Access Restricted
            </div>
          </CardContent>
        </Card> */}
      </div>

      <Card className="shadow-sm border-slate-200/60 dark:border-slate-800">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg">User Directory</CardTitle>
              <p className="text-sm text-muted-foreground">Search and filter your platform members.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:flex items-center gap-3">
              <div className="relative md:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Name or Email..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="pl-9 bg-slate-50/50 dark:bg-slate-900"
                />
              </div>

              <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setPage(1); }}>
                <SelectTrigger className="w-full lg:w-[130px] bg-slate-50/50 dark:bg-slate-900">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Every Role</SelectItem>
                  <SelectItem value="student">Students</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                <SelectTrigger className="w-full lg:w-[130px] bg-slate-50/50 dark:bg-slate-900">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Every Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>

              {/* Date Filters */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Calendar className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                    className="pl-8 h-10 w-full lg:w-[140px] text-xs bg-slate-50/50 dark:bg-slate-900"
                  />
                </div>
                <span className="text-muted-foreground text-xs">-</span>
                <div className="relative">
                  <Calendar className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                    className="pl-8 h-10 w-full lg:w-[140px] text-xs bg-slate-50/50 dark:bg-slate-900"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <UserTable users={formattedUsers} className="border-none shadow-none" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-4 order-2 sm:order-1">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{(page - 1) * limit + 1}</span> to <span className="font-semibold text-foreground">{Math.min(page * limit, totalUsers)}</span> of <span className="font-semibold text-foreground">{totalUsers}</span>
              </p>

              <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 hidden sm:block" />

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground hidden lg:inline">Rows per page:</span>
                <Select value={limit.toString()} onValueChange={(v) => { setLimit(parseInt(v)); setPage(1); }}>
                  <SelectTrigger className="h-8 w-20 bg-transparent border-slate-200 shadow-none text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-3 order-1 sm:order-2">
              <div className="flex items-center gap-1.5 mr-2">
                <span className="text-xs text-muted-foreground">Page</span>
                <span className="text-xs font-bold text-foreground bg-primary/10 text-primary px-2 py-0.5 rounded">{page}</span>
                <span className="text-xs text-muted-foreground">of {totalPages}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-md bg-white dark:bg-slate-950 border-slate-200"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  <span className="sr-only">Previous page</span>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-md bg-white dark:bg-slate-950 border-slate-200"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  <span className="sr-only">Next page</span>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/dashboard/ui/card";
import { Button } from "@/components/dashboard/ui/button";
import { Input } from "@/components/dashboard/ui/input";
import { UserTable } from "@/components/dashboard/UserTable";
import { useUsers, useToggleUserActive, useResendVerification, useDeleteUser } from "@/lib/api/users";
import type { AdminUserRole, AdminUserRoleScope } from "@/lib/api/users";
import {
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Calendar,
  UserCheck,
  UserX,
  ShieldCheck,
  ShieldOff,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/dashboard/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/dashboard/ui/dialog";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { useAdminToken } from "@/lib/api/useAdminToken";
import { usePageTitle } from "@/lib/usePageTitle";
import { toast } from "@/components/dashboard/ui/sonner";

interface AdminUsersDirectoryProps {
  roleScope?: AdminUserRoleScope;
  title?: string;
  description?: string;
  directoryTitle?: string;
  directoryDescription?: string;
}

const staffRoles: Array<{ value: AdminUserRole | "all"; label: string }> = [
  { value: "all", label: "All Roles" },
  { value: "teacher", label: "Teachers" },
  { value: "admin", label: "Admins" },
  { value: "contributor", label: "Contributors" },
  { value: "parent", label: "Parents" },
];

export function AdminUsersDirectory({
  roleScope = "students",
  title = "Student Management",
  description = "Monitor your platform's student base, growth and activity.",
  directoryTitle = "Student Directory",
  directoryDescription = "Search and filter your platform students.",
}: AdminUsersDirectoryProps) {
  usePageTitle(title);
  const token = useAdminToken();
  const [searchQuery, setSearchQuery] = useState("");
  const [verifiedFilter, setVerifiedFilter] = useState<string>("all");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<AdminUserRole | "all">("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [toggleDialogOpen, setToggleDialogOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [pendingToggleId, setPendingToggleId] = useState<string | null>(null);
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);

  const { data, isLoading, isError } = useUsers({
    page,
    limit,
    search: searchQuery,
    verified: verifiedFilter,
    isActive: activeFilter,
    startDate,
    endDate,
    roleScope,
    role: roleScope === "staff" ? roleFilter : undefined,
    token,
  });

  const toggleActive = useToggleUserActive(token);
  const resendVerification = useResendVerification(token);
  const deleteUser = useDeleteUser(token);

  const users = data?.users || [];
  const totalUsers = data?.total || 0;
  const totalPages = data?.totalPages || 1;
  const globalStats = data?.stats || { total: 0, active: 0, inactive: 0, verified: 0, unverified: 0 };
  const isStaff = roleScope === "staff";

  const handleToggleActive = (userId: string) => {
    setPendingToggleId(userId);
    setToggleDialogOpen(true);
  };

  const confirmToggle = () => {
    if (!pendingToggleId) return;
    const isActive = pendingToggleUser?.isActive;
    setLoadingUserId(pendingToggleId);
    toggleActive.mutate(pendingToggleId, {
      onSuccess: () => {
        toast.success(isActive ? "User deactivated successfully" : "User activated successfully");
      },
      onError: () => {
        toast.error("Failed to update user status");
      },
      onSettled: () => {
        setLoadingUserId(null);
        setToggleDialogOpen(false);
        setPendingToggleId(null);
      },
    });
  };

  const handleResendVerification = (userId: string) => {
    setLoadingUserId(userId);
    resendVerification.mutate(userId, {
      onSuccess: () => {
        toast.success("Verification email sent successfully");
      },
      onError: () => {
        toast.error("Failed to send verification email");
      },
      onSettled: () => setLoadingUserId(null),
    });
  };

  const handleDeleteUser = (userId: string) => {
    setPendingDeleteId(userId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!pendingDeleteId) return;
    setLoadingUserId(pendingDeleteId);
    deleteUser.mutate(pendingDeleteId, {
      onSuccess: () => {
        toast.success("User deleted successfully");
      },
      onError: () => {
        toast.error("Failed to delete user");
      },
      onSettled: () => {
        setLoadingUserId(null);
        setDeleteDialogOpen(false);
        setPendingDeleteId(null);
      },
    });
  };

  const pendingDeleteUser = users.find(u => u.id === pendingDeleteId);
  const pendingToggleUser = users.find(u => u.id === pendingToggleId);

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

  return (
    <div className="space-y-6 p-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">
          {description}
        </p>
      </div>

      {/* Stats Cards Overview */}
      <div className={isStaff ? "grid gap-4 md:grid-cols-2" : "grid gap-4 md:grid-cols-3"}>
        <StatsCard
          title={isStaff ? "Total Staff" : "Total Students"}
          value={globalStats.total}
          subtitle="Registered Accounts"
          icon={Users}
        />

        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground mb-3">Account Status</p>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <UserCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{globalStats.active}</p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
              </div>
              <div className="h-10 w-px bg-slate-200 dark:bg-slate-700" />
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                  <UserX className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{globalStats.inactive}</p>
                  <p className="text-xs text-muted-foreground">Inactive</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {!isStaff && (
          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-muted-foreground mb-3">Email Verification</p>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                    <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{globalStats.verified}</p>
                    <p className="text-xs text-muted-foreground">Verified</p>
                  </div>
                </div>
                <div className="h-10 w-px bg-slate-200 dark:bg-slate-700" />
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                    <ShieldOff className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{globalStats.unverified}</p>
                    <p className="text-xs text-muted-foreground">Unverified</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Card className="shadow-sm border-slate-200/60 dark:border-slate-800">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="space-y-4">
            <div className="space-y-1">
              <CardTitle className="text-lg">{directoryTitle}</CardTitle>
              <p className="max-w-2xl text-sm text-muted-foreground">{directoryDescription}</p>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(220px,1.4fr)_repeat(2,minmax(150px,0.8fr))_minmax(300px,1.2fr)]">
              <div className="relative min-w-0">
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

              {isStaff && (
                <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v as AdminUserRole | "all"); setPage(1); }}>
                  <SelectTrigger className="w-full bg-slate-50/50 dark:bg-slate-900">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    {staffRoles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <Select value={activeFilter} onValueChange={(v) => { setActiveFilter(v); setPage(1); }}>
                <SelectTrigger className="w-full bg-slate-50/50 dark:bg-slate-900">
                  <SelectValue placeholder="Active Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>

              {!isStaff && (
                <Select value={verifiedFilter} onValueChange={(v) => { setVerifiedFilter(v); setPage(1); }}>
                  <SelectTrigger className="w-full bg-slate-50/50 dark:bg-slate-900">
                    <SelectValue placeholder="Verification" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Verified</SelectItem>
                    <SelectItem value="true">Verified</SelectItem>
                    <SelectItem value="false">Unverified</SelectItem>
                  </SelectContent>
                </Select>
              )}

              {/* Date Filters */}
              <div className={isStaff ? "flex min-w-0 items-center gap-2 md:col-span-2 xl:col-span-1" : "flex min-w-0 items-center gap-2"}>
                <div className="relative min-w-0 flex-1">
                  <Calendar className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                    className="h-10 w-full pl-8 text-xs bg-slate-50/50 dark:bg-slate-900"
                  />
                </div>
                <span className="text-muted-foreground text-xs">-</span>
                <div className="relative min-w-0 flex-1">
                  <Calendar className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                    className="h-10 w-full pl-8 text-xs bg-slate-50/50 dark:bg-slate-900"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <UserTable
            users={users}
            variant={roleScope}
            className="border-none shadow-none"
            onToggleActive={handleToggleActive}
            onResendVerification={handleResendVerification}
            onDeleteUser={handleDeleteUser}
            loadingUserId={loadingUserId}
          />

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

      {/* Toggle Active Confirmation Dialog */}
      <Dialog open={toggleDialogOpen} onOpenChange={setToggleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{pendingToggleUser?.isActive ? "Deactivate" : "Activate"} User</DialogTitle>
            <DialogDescription>
              Are you sure you want to {pendingToggleUser?.isActive ? "deactivate" : "activate"}{" "}
              <span className="font-semibold text-foreground">{pendingToggleUser?.name}</span> ({pendingToggleUser?.email})?
              {pendingToggleUser?.isActive
                ? " They will no longer be able to access the platform."
                : " They will regain access to the platform."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setToggleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmToggle} disabled={toggleActive.isPending}>
              {toggleActive.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {pendingToggleUser?.isActive ? "Deactivate" : "Activate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-semibold text-foreground">{pendingDeleteUser?.name}</span> ({pendingDeleteUser?.email})? This action cannot be undone and will remove all associated data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteUser.isPending}>
              {deleteUser.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

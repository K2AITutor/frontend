"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/dashboard/ui/card";
import { Button } from "@/components/dashboard/ui/button";
import { Badge } from "@/components/dashboard/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/dashboard/ui/avatar";
import { ConfirmDialog } from "@/components/dashboard/ui/confirm-dialog";
import {
  Loader2,
  Mail,
  Phone,
  Calendar,
  GraduationCap,
  ShieldCheck,
  ShieldOff,
  CircleCheck,
  CircleX,
  CreditCard,
  Clock,
  Power,
  Trash2,
} from "lucide-react";
import {
  useToggleUserActive,
  useResendVerification,
  useDeleteUser,
} from "@/lib/api/users";
import { useAdminToken } from "@/lib/api/useAdminToken";
import { apiGet } from "@/lib/apiClient";
import { toast } from "@/components/dashboard/ui/sonner";

export interface UserProfile {
  id: string;
  name: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  role: string;
  phone: string | null;
  avatar: string | null;
  yearLevel: string | null;
  vcaaStudentNumber: string | null;
  isActive: boolean;
  emailVerified: boolean;
  lastLoginAt: string | null;
  joinedDate: string;
  subscription: {
    status: string;
    plan: string | null;
    stripeSubscriptionId: string | null;
    currentPeriodEnd: string | null;
  } | null;
  recentAttempts: {
    id: number;
    score: number | null;
    createdAt: string;
  }[];
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface StudentProfileContentProps {
  userId: string;
  /** Called after the user is successfully deleted (page navigates away, drawer closes). */
  onDeleted?: () => void;
}

/**
 * Shared profile body for a single user — used both full-page (`/admin/students/[id]`)
 * and inside `StudentDetailDrawer`. Owns its own data fetch plus the toggle/resend/delete
 * actions (Rule 3: confirmations go through ConfirmDialog). See docs/CODING_STANDARDS.md.
 */
export function StudentProfileContent({ userId, onDeleted }: StudentProfileContentProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [toggleDialogOpen, setToggleDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const token = useAdminToken();
  const toggleActive = useToggleUserActive(token);
  const resendVerification = useResendVerification(token);
  const deleteUser = useDeleteUser(token);

  const fetchUser = useCallback(async () => {
    if (!token) return;
    try {
      const data = await apiGet<UserProfile>(`/admin/users/${userId}`, token);
      setUser(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [userId, token]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const confirmToggle = async () => {
    if (!user) return;
    const wasActive = user.isActive;
    try {
      await toggleActive.mutateAsync(user.id);
      fetchUser();
      toast.success(wasActive ? "User deactivated successfully" : "User activated successfully");
    } catch {
      toast.error("Failed to update user status");
    }
  };

  const handleResendVerification = () => {
    if (!user) return;
    resendVerification.mutate(user.id, {
      onSuccess: () => {
        fetchUser();
        toast.success("Verification email sent successfully");
      },
      onError: () => {
        toast.error("Failed to send verification email");
      },
    });
  };

  const confirmDelete = async () => {
    if (!user) return;
    try {
      await deleteUser.mutateAsync(user.id);
      toast.success("User deleted successfully");
      onDeleted?.();
    } catch {
      toast.error("Failed to delete user");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">{error || "User not found"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
              <AvatarFallback className="text-xl">
                {user.name.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold">{user.name}</h1>
                {user.isActive ? (
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-800">Inactive</Badge>
                )}
                {user.emailVerified ? (
                  <Badge variant="outline" className="gap-1 border-green-200 text-green-700">
                    <ShieldCheck className="h-3 w-3" /> Verified
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1 border-amber-200 text-amber-700">
                    <ShieldOff className="h-3 w-3" /> Unverified
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1"><Mail className="h-4 w-4" /> {user.email}</span>
                {user.phone && <span className="flex items-center gap-1"><Phone className="h-4 w-4" /> {user.phone}</span>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Student Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <DetailRow icon={GraduationCap} label="Year Level" value={user.yearLevel || "-"} />
            <DetailRow icon={GraduationCap} label="VCAA Student Number" value={user.vcaaStudentNumber || "-"} />
            <DetailRow icon={Calendar} label="Joined" value={formatDate(user.joinedDate)} />
            <DetailRow icon={Clock} label="Last Login" value={user.lastLoginAt ? formatDate(user.lastLoginAt) : "Never"} />
            <DetailRow
              icon={user.isActive ? CircleCheck : CircleX}
              label="Account Status"
              value={user.isActive ? "Active" : "Inactive"}
              iconColor={user.isActive ? "text-green-500" : "text-red-500"}
            />
            <DetailRow
              icon={user.emailVerified ? ShieldCheck : ShieldOff}
              label="Email Verified"
              value={user.emailVerified ? "Yes" : "No"}
              iconColor={user.emailVerified ? "text-green-500" : "text-amber-500"}
            />
          </CardContent>
        </Card>

        {/* Subscription */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            {user.subscription ? (
              <div className="space-y-3">
                <DetailRow icon={CreditCard} label="Status" value={user.subscription.status} />
                <DetailRow icon={CreditCard} label="Plan" value={user.subscription.plan || "-"} />
                <DetailRow icon={CreditCard} label="Stripe Subscription" value={user.subscription.stripeSubscriptionId || "-"} />
                {user.subscription.currentPeriodEnd && (
                  <DetailRow icon={Calendar} label="Current Period End" value={formatDate(user.subscription.currentPeriodEnd)} />
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No active subscription</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Attempts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Attempts</CardTitle>
        </CardHeader>
        <CardContent>
          {user.recentAttempts.length > 0 ? (
            <div className="space-y-2">
              {user.recentAttempts.map((attempt) => (
                <div key={attempt.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <span className="text-sm text-muted-foreground">{formatDate(attempt.createdAt)}</span>
                  <span className="text-sm font-medium">
                    {attempt.score !== null ? `${attempt.score}%` : "In progress"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">No attempts yet</p>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() => setToggleDialogOpen(true)}
          >
            <Power className="mr-2 h-4 w-4" />
            {user.isActive ? "Deactivate Account" : "Activate Account"}
          </Button>

          {!user.emailVerified && (
            <Button
              variant="outline"
              onClick={handleResendVerification}
              disabled={resendVerification.isPending}
            >
              {resendVerification.isPending
                ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                : <Mail className="mr-2 h-4 w-4" />}
              Resend Verification Email
            </Button>
          )}

          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete User
          </Button>
        </CardContent>
      </Card>

      {/* Toggle Active Confirmation */}
      <ConfirmDialog
        open={toggleDialogOpen}
        onOpenChange={setToggleDialogOpen}
        title={`${user.isActive ? "Deactivate" : "Activate"} User`}
        description={
          `Are you sure you want to ${user.isActive ? "deactivate" : "activate"} ${user.name} (${user.email})?` +
          (user.isActive
            ? " They will no longer be able to access the platform."
            : " They will regain access to the platform.")
        }
        confirmLabel={user.isActive ? "Deactivate" : "Activate"}
        variant={user.isActive ? "destructive" : "default"}
        loading={toggleActive.isPending}
        onConfirm={confirmToggle}
        icon={<Power className="h-4 w-4" />}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete User"
        description={`Are you sure you want to delete ${user.name} (${user.email})? This action cannot be undone and will remove all associated data.`}
        confirmLabel="Delete"
        variant="destructive"
        loading={deleteUser.isPending}
        onConfirm={confirmDelete}
        icon={<Trash2 className="h-4 w-4" />}
      />
    </div>
  );
}

export function DetailRow({
  icon: Icon,
  label,
  value,
  iconColor,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  iconColor?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className={`h-4 w-4 ${iconColor || ""}`} /> {label}
      </span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

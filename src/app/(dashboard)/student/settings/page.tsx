"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/dashboard/ui/card";
import { Button } from "@/components/dashboard/ui/button";
import { Input } from "@/components/dashboard/ui/input";
import { Label } from "@/components/dashboard/ui/label";
import { Separator } from "@/components/dashboard/ui/separator";
import { Badge } from "@/components/dashboard/ui/badge";
import {
  Lock,
  Moon,
  Sun,
  Monitor,
  Check,
  AlertCircle,
  CreditCard,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { fetchPlans, getSubscription, createCheckout, cancelSubscription, SubscriptionPlan, SubscriptionStatus } from "@/lib/api/billing";
import { getUserIdFromToken } from "@/lib/auth";

export default function StudentSettingsPage() {
  const { theme, setTheme } = useTheme();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Subscription State
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loadingBilling, setLoadingBilling] = useState(true);
  const [processingPlanId, setProcessingPlanId] = useState<number | null>(null);

  // Password State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // Fetch Billing Data
  useEffect(() => {
    const loadBilling = async () => {
      const userId = getUserIdFromToken();
      if (!userId) return;
      try {
        const [plansData, subData] = await Promise.all([
          fetchPlans(),
          getSubscription(userId)
        ]);
        setPlans(plansData);
        setSubscription(subData);
      } catch (error) {
        console.error("Failed to load billing data", error);
      } finally {
        setLoadingBilling(false);
      }
    };

    if (searchParams.get("payment_success")) {
      // Clear the param
      router.replace("/student/settings");
    }

    loadBilling();
  }, [searchParams, router]);

  const handleSubscribe = async (planId: number) => {
    const userId = getUserIdFromToken();
    if (!userId) return;
    setProcessingPlanId(planId);
    try {
      const { checkoutUrl } = await createCheckout(userId, planId);
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error(error);
      setProcessingPlanId(null);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel your subscription?")) return;

    const userId = getUserIdFromToken();
    if (!userId) return;
    setProcessingPlanId(-1); // Use -1 to indicate cancelling
    try {
      await cancelSubscription(userId);
      // Refresh
      const sub = await getSubscription(userId);
      setSubscription(sub);
    } catch (error) {
      console.error(error);
    } finally {
      setProcessingPlanId(null);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    try {
      const API_BASE = typeof window === "undefined"
        ? process.env.INTERNAL_API_BASE || "http://backend:4000/api"
        : process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";

      const res = await fetch(`${API_BASE}/auth/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.text();
        setPasswordError(error || "Failed to change password");
        return;
      }

      setPasswordSuccess("Password changed successfully");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setPasswordError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              <CardTitle>Change Password</CardTitle>
            </div>
            <CardDescription>
              Update your password to keep your account secure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                  }
                  required
                />
              </div>

              {passwordError && (
                <div className="flex items-center gap-2 text-sm text-red-500">
                  <AlertCircle className="h-4 w-4" />
                  <span>{passwordError}</span>
                </div>
              )}

              {passwordSuccess && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <Check className="h-4 w-4" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              <Button type="submit" className="w-full">
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              <CardTitle>Subscription Plan</CardTitle>
            </div>
            <CardDescription>
              Manage your subscription and billing details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {loadingBilling ? (
              <div className="flex justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                {/* Current Subscription Status */}
                <div className="rounded-lg border bg-muted/50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Current Plan</p>
                      <h3 className="text-xl font-bold">
                        {subscription?.hasSubscription ? subscription.subscription?.planName : "Free Plan"}
                      </h3>
                    </div>
                    {subscription?.hasSubscription && (
                      <Badge variant={subscription.subscription?.status === 'active' ? 'default' : 'secondary'}>
                        {subscription.subscription?.status.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                  {subscription?.hasSubscription && (
                    <div className="mt-4 pt-4 border-t flex justify-between items-center">
                      <p className="text-sm text-muted-foreground">
                        Renews/Ends: {new Date(subscription.subscription!.currentPeriodEnd).toLocaleDateString()}
                      </p>
                      <Button
                        variant="ghost"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 h-auto p-0"
                        onClick={handleCancel}
                        disabled={processingPlanId === -1 || subscription.subscription?.status === 'canceled'}
                      >
                        {processingPlanId === -1 ? (
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        ) : null}
                        Cancel Subscription
                      </Button>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Available Plans */}
                <div>
                  <h3 className="mb-4 text-lg font-medium">Available Plans</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {plans.map((plan) => {
                      const isCurrent = subscription?.hasSubscription && subscription.subscription?.planId === plan.id;
                      return (
                        <div
                          key={plan.id}
                          className={`
                              relative flex flex-col justify-between rounded-xl border-2 p-6 transition-all
                              ${isCurrent ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50'}
                            `}
                        >
                          {isCurrent && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs text-primary-foreground">
                              Current Plan
                            </div>
                          )}

                          <div className="space-y-2">
                            <h4 className="font-bold">{plan.name}</h4>
                            <div className="text-3xl font-bold">
                              ${(plan.price / 100).toFixed(2)}
                              <span className="text-sm font-medium text-muted-foreground">/mo</span>
                            </div>
                            {/* Add features list here if available in plan object */}
                          </div>

                          <Button
                            className="mt-6 w-full"
                            variant={isCurrent ? "outline" : "default"}
                            disabled={isCurrent || (processingPlanId !== null)}
                            onClick={() => handleSubscribe(plan.id)}
                          >
                            {processingPlanId === plan.id && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {isCurrent ? "Active" : "Subscribe"}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Theme</CardTitle>
            <CardDescription>
              Customize the appearance of your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => setTheme("light")}
                className={`
                  flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all
                  ${theme === "light" ? "border-primary bg-primary/5" : "border-transparent hover:bg-muted"}
                `}
              >
                <Sun className="h-6 w-6" />
                <span className="text-sm font-medium">Light</span>
              </button>

              <button
                onClick={() => setTheme("dark")}
                className={`
                  flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all
                  ${theme === "dark" ? "border-primary bg-primary/5" : "border-transparent hover:bg-muted"}
                `}
              >
                <Moon className="h-6 w-6" />
                <span className="text-sm font-medium">Dark</span>
              </button>

              <button
                onClick={() => setTheme("system")}
                className={`
                  flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all
                  ${theme === "system" ? "border-primary bg-primary/5" : "border-transparent hover:bg-muted"}
                `}
              >
                <Monitor className="h-6 w-6" />
                <span className="text-sm font-medium">System</span>
              </button>
            </div>

            <Separator />

            <div className="text-sm text-muted-foreground">
              <p>Choose how you want the application to look:</p>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li><strong>Light:</strong> Bright, clean interface</li>
                <li><strong>Dark:</strong> Easy on the eyes in low light</li>
                <li><strong>System:</strong> Follows your device settings</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

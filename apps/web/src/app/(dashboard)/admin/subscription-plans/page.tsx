"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/dashboard/ui/card";
import { Button } from "@/components/dashboard/ui/button";
import { Input } from "@/components/dashboard/ui/input";
import { DataTable, SortHeader } from "@/components/dashboard/DataTable";
import { createColumnHelper } from "@tanstack/react-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/dashboard/ui/dialog";
import { Badge } from "@/components/dashboard/ui/badge";
import {
  AdminSubscriptionPlan as SubscriptionPlan,
  fetchSubscriptionPlans,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
} from "@/lib/api/admin-subscription-plans";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  CreditCard,
  Users,
  DollarSign,
} from "lucide-react";
import { useAdminToken } from "@/lib/api/useAdminToken";
import { usePageTitle } from "@/lib/usePageTitle";
import { toast } from "@/components/dashboard/ui/sonner";

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

const columnHelper = createColumnHelper<SubscriptionPlan>();

export default function AdminSubscriptionPlansPage() {
  usePageTitle("Subscription Plans");
  const token = useAdminToken();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [deletingPlan, setDeletingPlan] = useState<SubscriptionPlan | null>(null);

  // Form states
  const [planForm, setPlanForm] = useState({
    name: "",
    price: "",
    stripePriceId: "",
    questionsPerDay: "-1",
    aiExplanationsPerDay: "-1",
    examAccess: "full",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (token) loadPlans();
  }, [token]);

  async function loadPlans() {
    if (!token) return;
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchSubscriptionPlans(token);
      setPlans(data);
    } catch (err) {
      setError("Failed to load subscription plans. Please check if the backend is running.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  function openDialog(plan?: SubscriptionPlan) {
    if (plan) {
      setEditingPlan(plan);
      setPlanForm({
        name: plan.name,
        price: (plan.price / 100).toString(),
        stripePriceId: plan.stripePriceId || "",
        questionsPerDay: plan.questionsPerDay.toString(),
        aiExplanationsPerDay: plan.aiExplanationsPerDay.toString(),
        examAccess: plan.examAccess,
      });
    } else {
      setEditingPlan(null);
      setPlanForm({
        name: "",
        price: "",
        stripePriceId: "",
        questionsPerDay: "-1",
        aiExplanationsPerDay: "-1",
        examAccess: "full",
      });
    }
    setIsDialogOpen(true);
  }

  function openDeleteDialog(plan: SubscriptionPlan) {
    setDeletingPlan(plan);
    setIsDeleteDialogOpen(true);
  }

  async function handleSavePlan() {
    if (!planForm.name || !planForm.price) return;

    const priceInCents = Math.round(parseFloat(planForm.price) * 100);
    if (isNaN(priceInCents) || priceInCents < 0) {
      toast.error("Please enter a valid price");
      return;
    }

    setIsSubmitting(true);
    try {
      const planData = {
        name: planForm.name,
        price: priceInCents,
        stripePriceId: planForm.stripePriceId || undefined,
        questionsPerDay: parseInt(planForm.questionsPerDay),
        aiExplanationsPerDay: parseInt(planForm.aiExplanationsPerDay),
        examAccess: planForm.examAccess,
      };

      if (editingPlan) {
        await updateSubscriptionPlan(editingPlan.id, planData, token!);
      } else {
        await createSubscriptionPlan(planData, token!);
      }
      setIsDialogOpen(false);
      loadPlans();
      toast.success(editingPlan ? "Plan updated successfully" : "Plan created successfully");
    } catch (err) {
      console.error("Failed to save plan:", err);
      toast.error("Failed to save plan");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeletePlan() {
    if (!deletingPlan) return;
    setIsSubmitting(true);
    try {
      await deleteSubscriptionPlan(deletingPlan.id, token!);
      setIsDeleteDialogOpen(false);
      loadPlans();
      toast.success("Plan deleted successfully");
    } catch (err: any) {
      console.error("Failed to delete plan:", err);
      toast.error(err.message || "Failed to delete plan");
    } finally {
      setIsSubmitting(false);
      setDeletingPlan(null);
    }
  }

  const totalSubscribers = plans.reduce(
    (sum, p) => sum + (p._count?.subscriptions || 0),
    0
  );

  const columns = [
      columnHelper.accessor("id", {
        header: SortHeader("ID"),
        enableGlobalFilter: false,
        cell: (info) => <span className="font-mono text-sm">{info.getValue()}</span>,
      }),
      columnHelper.accessor("name", {
        header: SortHeader("Name"),
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
      }),
      columnHelper.accessor("price", {
        header: SortHeader("Price"),
        enableGlobalFilter: false,
        cell: (info) => <Badge variant="secondary">{formatPrice(info.getValue())}/mo</Badge>,
      }),
      columnHelper.accessor("questionsPerDay", {
        header: SortHeader("Questions/Day"),
        enableGlobalFilter: false,
        cell: (info) => (
          <span className="text-sm">{info.getValue() === -1 ? "Unlimited" : info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("aiExplanationsPerDay", {
        header: SortHeader("AI/Day"),
        enableGlobalFilter: false,
        cell: (info) => (
          <span className="text-sm">{info.getValue() === -1 ? "Unlimited" : info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("examAccess", {
        header: SortHeader("Exam"),
        enableGlobalFilter: false,
        cell: (info) => (
          <Badge variant={info.getValue() === "full" ? "default" : "secondary"} className="capitalize">
            {info.getValue()}
          </Badge>
        ),
      }),
      columnHelper.accessor((row) => row._count?.subscriptions || 0, {
        id: "subscribers",
        header: SortHeader("Subscribers"),
        enableGlobalFilter: false,
        cell: (info) => <Badge variant="outline">{info.getValue()}</Badge>,
      }),
      columnHelper.display({
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        enableSorting: false,
        cell: (info) => {
          const plan = info.row.original;
          return (
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={() => openDialog(plan)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-600"
                onClick={() => openDeleteDialog(plan)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      }),
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen flex-col gap-4 text-center p-6">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h2 className="text-xl font-semibold">Error Loading Subscription Plans</h2>
        <p className="text-muted-foreground max-w-sm">{error}</p>
        <Button onClick={loadPlans} variant="outline">Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Subscription Plans</h1>
        <p className="text-muted-foreground">
          Manage subscription plans and pricing.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{plans.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubscribers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Price Range</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {plans.length > 0
                ? `${formatPrice(Math.min(...plans.map((p) => p.price)))} - ${formatPrice(Math.max(...plans.map((p) => p.price)))}`
                : "N/A"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={plans}
        searchPlaceholder="Search plans..."
        filters={[
          {
            id: "examAccess",
            label: "Exam Access",
            options: [
              { label: "All Access", value: "all" },
              { label: "Full", value: "full" },
              { label: "Limited", value: "limited" },
            ],
          },
        ]}
        emptyMessage="No subscription plans yet."
        toolbarActions={
          <Button size="sm" onClick={() => openDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Plan
          </Button>
        }
      />

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPlan ? "Edit Plan" : "Add Plan"}</DialogTitle>
            <DialogDescription>
              {editingPlan
                ? "Update the subscription plan details."
                : "Create a new subscription plan."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={planForm.name}
                onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                placeholder="e.g. Basic, Pro, Premium"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Price (AUD per month)</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={planForm.price}
                onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })}
                placeholder="e.g. 9.99"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Stripe Price ID (optional)</label>
              <Input
                value={planForm.stripePriceId}
                onChange={(e) =>
                  setPlanForm({ ...planForm, stripePriceId: e.target.value })
                }
                placeholder="e.g. price_1234abc..."
              />
              <p className="text-xs text-muted-foreground">
                Required for paid plans. Leave empty for free plans.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Questions / Day</label>
                <Input
                  type="number"
                  value={planForm.questionsPerDay}
                  onChange={(e) => setPlanForm({ ...planForm, questionsPerDay: e.target.value })}
                  placeholder="-1 for unlimited"
                />
                <p className="text-xs text-muted-foreground">-1 = unlimited</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">AI Explanations / Day</label>
                <Input
                  type="number"
                  value={planForm.aiExplanationsPerDay}
                  onChange={(e) => setPlanForm({ ...planForm, aiExplanationsPerDay: e.target.value })}
                  placeholder="-1 for unlimited"
                />
                <p className="text-xs text-muted-foreground">-1 = unlimited</p>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Exam Access</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={planForm.examAccess}
                onChange={(e) => setPlanForm({ ...planForm, examAccess: e.target.value })}
              >
                <option value="limited">Limited</option>
                <option value="full">Full</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSavePlan}
              disabled={isSubmitting || !planForm.name || !planForm.price}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the plan &quot;{deletingPlan?.name}&quot;?
              {(deletingPlan?._count?.subscriptions || 0) > 0 && (
                <span className="block mt-2 text-red-500 font-medium">
                  This plan has {deletingPlan?._count?.subscriptions} active subscriber(s)
                  and cannot be deleted.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeletePlan}
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { AlertCircle, CreditCard, DollarSign, Loader2, RefreshCw, Search, ShieldAlert, Users } from "lucide-react";
import { Badge } from "@/components/dashboard/ui/badge";
import { Button } from "@/components/dashboard/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/dashboard/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/dashboard/ui/dialog";
import { Input } from "@/components/dashboard/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/dashboard/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/dashboard/ui/tabs";
import { DataTable, type DataTableServer } from "@/components/dashboard/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import {
  AdminBillingPaymentEvent,
  fetchAdminBillingOverview,
  fetchAdminBillingPaymentEvents,
  fetchAdminBillingSubscriptions,
  type AdminBillingOverview,
  type AdminBillingPaymentEventsResponse,
  type AdminBillingSubscription,
  type AdminBillingListResponse,
} from "@/lib/api/admin-billing";
import { useAdminToken } from "@/lib/api/useAdminToken";
import { usePageTitle } from "@/lib/usePageTitle";

function formatMoney(cents: number | null) {
  if (cents === null) return "N/A";
  return `$${(cents / 100).toFixed(2)}`;
}

function formatDate(value: string | null) {
  if (!value) return "N/A";
  return new Intl.DateTimeFormat("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function statusVariant(status: string | null): "default" | "secondary" | "outline" {
  if (status === "active" || status === "paid") return "default";
  if (status === "canceling" || status === "open") return "secondary";
  return "outline";
}

// These tables are read-only and server-paginated, so columns are render-only
// (no client sorting); the shared DataTable provides consistent chrome.
const subscriptionColumns: ColumnDef<AdminBillingSubscription, any>[] = [
  {
    id: "user",
    header: "User",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.userName}</div>
        <div className="text-xs text-muted-foreground">{row.original.userEmail}</div>
      </div>
    ),
  },
  {
    id: "plan",
    header: "Plan",
    cell: ({ row }) => (
      <div>
        <div>{row.original.planName}</div>
        <div className="text-xs text-muted-foreground">{formatMoney(row.original.planPrice)}/mo</div>
      </div>
    ),
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => <Badge variant={statusVariant(row.original.status)}>{row.original.status}</Badge>,
  },
  {
    id: "stripeSubscription",
    header: "Stripe Subscription",
    meta: { className: "max-w-[220px] truncate font-mono text-xs" },
    cell: ({ row }) => row.original.stripeSubscriptionId ?? "N/A",
  },
  {
    id: "periodEnd",
    header: "Period End",
    cell: ({ row }) => formatDate(row.original.currentPeriodEnd),
  },
  {
    id: "updated",
    header: "Updated",
    cell: ({ row }) => formatDate(row.original.updatedAt),
  },
];

function getEventColumns(
  onSelectEvent: (event: AdminBillingPaymentEvent) => void,
): ColumnDef<AdminBillingPaymentEvent, any>[] {
  return [
    {
      id: "event",
      header: "Event",
      meta: { className: "max-w-[180px] truncate font-mono text-xs" },
      cell: ({ row }) => row.original.stripeEventId,
    },
    {
      id: "type",
      header: "Type",
      cell: ({ row }) => <Badge variant="outline">{row.original.type}</Badge>,
    },
    {
      id: "created",
      header: "Created",
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      id: "invoice",
      header: "Invoice",
      meta: { className: "max-w-[140px] truncate font-mono text-xs" },
      cell: ({ row }) => row.original.invoiceId ?? "N/A",
    },
    {
      id: "subscription",
      header: "Subscription",
      meta: { className: "max-w-[140px] truncate font-mono text-xs" },
      cell: ({ row }) => row.original.subscriptionId ?? "N/A",
    },
    {
      id: "amount",
      header: "Amount",
      cell: ({ row }) => formatMoney(row.original.amount),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => <Badge variant={statusVariant(row.original.status)}>{row.original.status ?? "N/A"}</Badge>,
    },
    {
      id: "detail",
      header: "Detail",
      meta: { className: "w-[90px]" },
      cell: ({ row }) => (
        <Button variant="ghost" size="sm" onClick={() => onSelectEvent(row.original)}>
          View
        </Button>
      ),
    },
  ];
}

export default function AdminBillingPage() {
  usePageTitle("Billing Health");
  const token = useAdminToken();
  const [overview, setOverview] = useState<AdminBillingOverview | null>(null);
  const [subscriptions, setSubscriptions] = useState<AdminBillingListResponse<AdminBillingSubscription> | null>(null);
  const [paymentEvents, setPaymentEvents] = useState<AdminBillingPaymentEventsResponse | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<AdminBillingPaymentEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [subscriptionFilters, setSubscriptionFilters] = useState({
    page: 1,
    pageSize: 20,
    search: "",
    status: "all",
    planId: "",
    hasStripeSubscription: "all",
  });
  const [eventFilters, setEventFilters] = useState({
    page: 1,
    pageSize: 20,
    search: "",
    type: "all",
    startDate: "",
    endDate: "",
  });

  const loadBillingData = useCallback(async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      setError(null);
      const [overviewData, subscriptionData, eventData] = await Promise.all([
        fetchAdminBillingOverview(token),
        fetchAdminBillingSubscriptions(token, subscriptionFilters),
        fetchAdminBillingPaymentEvents(token, eventFilters),
      ]);
      setOverview(overviewData);
      setSubscriptions(subscriptionData);
      setPaymentEvents(eventData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load billing health data");
    } finally {
      setIsLoading(false);
    }
  }, [token, subscriptionFilters, eventFilters]);

  useEffect(() => {
    loadBillingData();
  }, [loadBillingData]);

  const invoiceEvents = useMemo(
    () => (paymentEvents?.items ?? []).filter((event) => event.type.startsWith("invoice.")),
    [paymentEvents],
  );

  if (isLoading && !overview) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !overview) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h2 className="text-xl font-semibold">Error Loading Billing Health</h2>
        <p className="max-w-md text-muted-foreground">{error}</p>
        <Button variant="outline" onClick={loadBillingData}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 pb-20">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Billing Health</h1>
          <p className="text-muted-foreground">
            Read-only view of subscriptions, webhook payment events, and invoice health.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadBillingData} disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Refresh
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <HealthCard title="Active Subscriptions" value={overview?.subscriptions.active ?? 0} icon={<CreditCard className="h-4 w-4 text-muted-foreground" />} />
        <HealthCard title="Paid Subscribers" value={overview?.subscribers.paid ?? 0} icon={<DollarSign className="h-4 w-4 text-muted-foreground" />} />
        <HealthCard title="Stripe Linked" value={overview?.subscriptions.withStripeSubscription ?? 0} icon={<Users className="h-4 w-4 text-muted-foreground" />} />
        <HealthCard title="Recent Failed Payments" value={overview?.payments.recentFailedEvents ?? 0} icon={<ShieldAlert className="h-4 w-4 text-muted-foreground" />} tone={(overview?.payments.recentFailedEvents ?? 0) > 0 ? "text-red-600" : undefined} />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <SmallMetric label="Canceling" value={overview?.subscriptions.canceling ?? 0} />
        <SmallMetric label="Canceled" value={overview?.subscriptions.canceled ?? 0} />
        <SmallMetric label="Inactive" value={overview?.subscriptions.inactive ?? 0} />
        <SmallMetric label="Recent Events (30d)" value={overview?.payments.recentEvents ?? 0} />
      </div>

      <Tabs defaultValue="subscriptions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="events">Payment Events</TabsTrigger>
          <TabsTrigger value="invoices">Invoice Health</TabsTrigger>
        </TabsList>

        <TabsContent value="subscriptions">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Subscriptions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-5">
                <div className="relative md:col-span-2">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="Search email or name"
                    value={subscriptionFilters.search}
                    onChange={(event) => setSubscriptionFilters((prev) => ({ ...prev, page: 1, search: event.target.value }))}
                  />
                </div>
                <Select value={subscriptionFilters.status} onValueChange={(value) => setSubscriptionFilters((prev) => ({ ...prev, page: 1, status: value }))}>
                  <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="canceling">Canceling</SelectItem>
                    <SelectItem value="canceled">Canceled</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Plan ID"
                  value={subscriptionFilters.planId}
                  onChange={(event) => setSubscriptionFilters((prev) => ({ ...prev, page: 1, planId: event.target.value }))}
                />
                <Select value={subscriptionFilters.hasStripeSubscription} onValueChange={(value) => setSubscriptionFilters((prev) => ({ ...prev, page: 1, hasStripeSubscription: value }))}>
                  <SelectTrigger><SelectValue placeholder="Stripe link" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stripe states</SelectItem>
                    <SelectItem value="true">Has Stripe sub</SelectItem>
                    <SelectItem value="false">No Stripe sub</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <SubscriptionsTable
                data={subscriptions}
                server={{
                  total: subscriptions?.total ?? 0,
                  pageIndex: subscriptionFilters.page - 1,
                  pageSize: subscriptionFilters.pageSize,
                  onPaginationChange: ({ pageIndex }) =>
                    setSubscriptionFilters((prev) => ({ ...prev, page: pageIndex + 1 })),
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payment Events</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-5">
                <Input
                  placeholder="Search Stripe event ID"
                  value={eventFilters.search}
                  onChange={(event) => setEventFilters((prev) => ({ ...prev, page: 1, search: event.target.value }))}
                />
                <Select value={eventFilters.type} onValueChange={(value) => setEventFilters((prev) => ({ ...prev, page: 1, type: value }))}>
                  <SelectTrigger><SelectValue placeholder="Event type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All event types</SelectItem>
                    {(paymentEvents?.types ?? []).map((item) => (
                      <SelectItem key={item.type} value={item.type}>{item.type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input type="date" value={eventFilters.startDate} onChange={(event) => setEventFilters((prev) => ({ ...prev, page: 1, startDate: event.target.value }))} />
                <Input type="date" value={eventFilters.endDate} onChange={(event) => setEventFilters((prev) => ({ ...prev, page: 1, endDate: event.target.value }))} />
                <Button variant="outline" onClick={() => setEventFilters({ page: 1, pageSize: 20, search: "", type: "all", startDate: "", endDate: "" })}>
                  Clear
                </Button>
              </div>
              <PaymentEventsTable
                events={paymentEvents?.items ?? []}
                onSelectEvent={setSelectedEvent}
                server={{
                  total: paymentEvents?.total ?? 0,
                  pageIndex: eventFilters.page - 1,
                  pageSize: eventFilters.pageSize,
                  onPaginationChange: ({ pageIndex }) =>
                    setEventFilters((prev) => ({ ...prev, page: pageIndex + 1 })),
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Invoice Health</CardTitle>
            </CardHeader>
            <CardContent>
              <PaymentEventsTable events={invoiceEvents} onSelectEvent={setSelectedEvent} emptyText="No invoice events found for the current filters." />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={Boolean(selectedEvent)} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Payment Event Detail</DialogTitle>
            <DialogDescription>{selectedEvent?.stripeEventId}</DialogDescription>
          </DialogHeader>
          <pre className="max-h-[60vh] overflow-auto rounded-md bg-muted p-4 text-xs">
            {JSON.stringify(selectedEvent?.payload ?? {}, null, 2)}
          </pre>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function HealthCard({ title, value, icon, tone }: { title: string; value: number; icon: ReactNode; tone?: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${tone ?? ""}`}>{value}</div>
      </CardContent>
    </Card>
  );
}

function SmallMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border bg-card px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  );
}

function SubscriptionsTable({
  data,
  server,
}: {
  data: AdminBillingListResponse<AdminBillingSubscription> | null;
  server: DataTableServer;
}) {
  return (
    <DataTable
      columns={subscriptionColumns}
      data={data?.items ?? []}
      hidePageSize
      emptyMessage="No subscriptions match the current filters."
      server={server}
    />
  );
}

function PaymentEventsTable({
  events,
  onSelectEvent,
  emptyText = "No payment events match the current filters.",
  server,
}: {
  events: AdminBillingPaymentEvent[];
  onSelectEvent: (event: AdminBillingPaymentEvent) => void;
  emptyText?: string;
  server?: DataTableServer;
}) {
  return (
    <DataTable
      columns={getEventColumns(onSelectEvent)}
      data={events}
      hidePageSize
      hideFooter={!server}
      emptyMessage={emptyText}
      server={server}
    />
  );
}

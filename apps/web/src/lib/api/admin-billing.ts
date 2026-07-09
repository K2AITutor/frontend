import { PATH } from "@aitutor/shared";
import { apiGet } from "@/lib/apiClient";

// ... (keep interfaces)

export interface AdminBillingPaymentEvent {
  id: number;
  stripeEventId: string;
  type: string;
  createdAt: string;
  invoiceId: string | null;
  subscriptionId: string | null;
  customerId: string | null;
  amount: number | null;
  status: string | null;
  payload?: unknown;
}

export interface AdminBillingOverview {
  subscriptions: {
    active: number;
    canceling: number;
    canceled: number;
    inactive: number;
    total: number;
    withStripeSubscription: number;
  };
  subscribers: {
    paid: number;
    free: number;
  };
  payments: {
    recentEvents: number;
    recentFailedEvents: number;
    failedPaymentTypes: string[];
    recent: AdminBillingPaymentEvent[];
  };
}

export interface AdminBillingSubscription {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  stripeCustomerId: string | null;
  planId: number;
  planName: string;
  planPrice: number;
  status: string;
  stripeSubscriptionId: string | null;
  hasStripeSubscription: boolean;
  currentPeriodEnd: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminBillingListResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AdminBillingPaymentEventsResponse
  extends AdminBillingListResponse<AdminBillingPaymentEvent> {
  types: Array<{ type: string; count: number }>;
}

function toQuery(params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "" && value !== "all") {
      query.set(key, String(value));
    }
  });
  const value = query.toString();
  return value ? `?${value}` : "";
}

export function fetchAdminBillingOverview(token: string) {
  return apiGet<AdminBillingOverview>(PATH.admin.billing.overview, token);
}

export function fetchAdminBillingSubscriptions(
  token: string,
  params: {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
    planId?: string;
    hasStripeSubscription?: string;
  },
) {
  return apiGet<AdminBillingListResponse<AdminBillingSubscription>>(
    `${PATH.admin.billing.subscriptions}${toQuery(params)}`,
    token,
  );
}

export function fetchAdminBillingPaymentEvents(
  token: string,
  params: {
    page?: number;
    pageSize?: number;
    type?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  },
) {
  return apiGet<AdminBillingPaymentEventsResponse>(
    `${PATH.admin.billing.paymentEvents}${toQuery(params)}`,
    token,
  );
}

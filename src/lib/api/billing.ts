
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";

export interface SubscriptionPlan {
    id: number;
    name: string;
    price: number;
    stripePriceId: string;
    features?: string[];
}

export interface SubscriptionStatus {
    hasSubscription: boolean;
    subscription?: {
        planId: number;
        planName: string;
        price: number;
        status: string;
        currentPeriodEnd: Date;
        stripeSubscriptionId: string;
    };
    message?: string;
}

export interface Invoice {
    id: string;
    amount: number;
    currency: string;
    status: string;
    created: Date;
    hostedInvoiceUrl: string;
    invoicePdf: string;
}

/* ---------------- Fetch Plans ---------------- */
export async function fetchPlans(): Promise<SubscriptionPlan[]> {
    const res = await fetch(`${API_BASE}/billing/plans`, { cache: 'no-store' });

    if (!res.ok) {
        throw new Error("Failed to fetch subscription plans");
    }

    return res.json();
}

/* ---------------- Get My Subscription ---------------- */
export async function getSubscription(userId: number): Promise<SubscriptionStatus> {
    const res = await fetch(`${API_BASE}/billing/me/${userId}`, { cache: 'no-store' });

    if (!res.ok) {
        if (res.status === 404) {
            return { hasSubscription: false, message: 'User not found' };
        }
        throw new Error("Failed to fetch subscription status");
    }

    return res.json();
}

/* ---------------- Create Checkout Session ---------------- */
export async function createCheckout(userId: number, planId: number) {
    const res = await fetch(`${API_BASE}/billing/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, planId }),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to create checkout session");
    }

    return res.json();
}

/* ---------------- Cancel Subscription ---------------- */
export async function cancelSubscription(userId: number) {
    const res = await fetch(`${API_BASE}/billing/cancel/${userId}`, {
        method: "POST",
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to cancel subscription");
    }

    return res.json();
}

/* ---------------- Get Invoices ---------------- */
export async function getInvoices(userId: number): Promise<{ invoices: Invoice[] }> {
    const res = await fetch(`${API_BASE}/billing/invoices/${userId}`, { cache: 'no-store' });

    if (!res.ok) {
        throw new Error("Failed to fetch invoices");
    }

    return res.json();
}

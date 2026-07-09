'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import {
    fetchPlans,
    getSubscription,
    cancelSubscription,
    createCheckout,
    getInvoices,
    getUsage,
    SubscriptionPlan,
    SubscriptionStatus,
    UsageStatus,
    Invoice
} from '@/lib/api/billing';
import { Button } from '@/components/dashboard/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/dashboard/ui/card';
import { Badge } from '@/components/dashboard/ui/badge';
import {
    FileText, CreditCard, Zap, TrendingUp, AlertTriangle,
    Clock, Check, Infinity
} from 'lucide-react';
import { toast } from '@/components/dashboard/ui/sonner';
import { ConfirmDialog } from '@/components/dashboard/ui/confirm-dialog';
import { usePageTitle } from '@/lib/usePageTitle';
import { cn } from '@/lib/utils';

function UsageBar({ label, used, limit }: { label: string; used: number; limit: number }) {
    const isUnlimited = limit === -1;
    const percentage = isUnlimited ? 0 : Math.min((used / limit) * 100, 100);
    const isNearLimit = !isUnlimited && percentage >= 80;

    return (
        <div className="space-y-2">
            <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium">
                    {isUnlimited
                        ? <span className="flex items-center gap-1">{used} / <Infinity className="h-3 w-3" /></span>
                        : `${used} / ${limit}`}
                </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                    className={cn(
                        'h-full rounded-full transition-all',
                        isUnlimited ? 'bg-green-500 w-0' : isNearLimit ? 'bg-orange-500' : 'bg-primary'
                    )}
                    style={{ width: isUnlimited ? '0%' : `${percentage}%` }}
                />
            </div>
        </div>
    );
}

function getPlanFeatures(plan: SubscriptionPlan): string[] {
    const features: string[] = [];
    features.push(plan.questionsPerDay === -1 ? 'Unlimited Practice Questions' : `${plan.questionsPerDay} Questions / Day`);
    features.push(plan.aiExplanationsPerDay === -1 ? 'Unlimited AI Explanations' : `${plan.aiExplanationsPerDay} AI Explanations / Day`);
    features.push(plan.examAccess === 'full' ? 'Full Exam Access' : 'Limited Exam Access');
    features.push('Progress Tracking');
    if (plan.price > 0) features.push('Priority Support');
    return features;
}

export default function SubscriptionPage() {
    usePageTitle('Subscription & Billing');
    const { data: session } = useSession();
    const searchParams = useSearchParams();

    const [status, setStatus] = useState<SubscriptionStatus | null>(null);
    const [usage, setUsage] = useState<UsageStatus | null>(null);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);
    const [processing, setProcessing] = useState<number | null>(null);
    const [showCancelDialog, setShowCancelDialog] = useState(false);

    const accessToken = (session?.user as any)?.accessToken as string | undefined;
    const userId = Number((session?.user as any)?.id) || 0;

    const paymentSuccess = searchParams.get('payment_success') === 'true';

    useEffect(() => {
        if (session?.user && accessToken) loadData();
    }, [session, accessToken]);

    useEffect(() => {
        if (paymentSuccess) toast.success('Payment successful! Your subscription is now active.');
    }, [paymentSuccess]);

    async function loadData() {
        try {
            if (!userId || !accessToken) return;
            const [subData, usageData, invoiceData, plansData] = await Promise.all([
                getSubscription(userId, accessToken),
                getUsage(userId, accessToken),
                getInvoices(userId, accessToken),
                fetchPlans(),
            ]);
            setStatus(subData);
            setUsage(usageData);
            setInvoices(invoiceData.invoices);
            setPlans(plansData);
        } catch {
            toast.error('Failed to load subscription details.');
        } finally {
            setLoading(false);
        }
    }

    const handleCancel = async () => {
        setCancelling(true);
        try {
            await cancelSubscription(userId, accessToken!);
            await loadData();
            toast.success('Subscription cancelled. You will be downgraded to Free at the end of the billing period.');
        } catch {
            toast.error('Failed to cancel subscription. Please try again.');
        } finally {
            setCancelling(false);
        }
    };

    const handleSubscribe = async (plan: SubscriptionPlan) => {
        if (!userId || !accessToken) return;
        if (plan.price === 0) return;
        setProcessing(plan.id);
        try {
            const { checkoutUrl } = await createCheckout(userId, plan.id, accessToken);
            window.location.href = checkoutUrl;
        } catch {
            toast.error('Failed to start checkout. Please try again.');
            setProcessing(null);
        }
    };

    const isFreePlan = !status?.hasSubscription || status.subscription?.price === 0;
    const isPaidPlan = status?.hasSubscription && !isFreePlan;
    const isCanceling = status?.subscription?.status === 'canceling';

    // The paid plan to show for upgrade (all non-free plans)
    const paidPlans = plans.filter(p => p.price > 0);
    const currentPlanId = status?.subscription?.planId;

    if (loading) {
        return (
            <div className="p-8 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Subscription & Billing</h1>
                <p className="text-muted-foreground mt-2">Manage your plan and view payment history.</p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                {/* Current Plan */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Current Plan
                        </CardTitle>
                        <CardDescription>Your active subscription details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {status?.hasSubscription && status.subscription ? (
                            <>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-2xl font-bold">{status.subscription.planName}</h3>
                                        <p className="text-muted-foreground">
                                            {isFreePlan ? 'Free' : `$${(status.subscription.price / 100).toFixed(2)} / month`}
                                        </p>
                                    </div>
                                    <Badge
                                        variant={status.subscription.status === 'active' ? 'default' : 'secondary'}
                                        className={cn('capitalize', isCanceling && 'border-orange-500 text-orange-600 bg-orange-50 dark:bg-orange-900/20')}
                                    >
                                        {isCanceling ? 'Canceling' : status.subscription.status}
                                    </Badge>
                                </div>

                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between py-2 border-b">
                                        <span className="text-muted-foreground">Exam Access</span>
                                        <span className="font-medium capitalize">{status.subscription.limits?.examAccess || 'limited'}</span>
                                    </div>
                                    {isPaidPlan && status.subscription.currentPeriodEnd && (
                                        <div className="flex justify-between py-2 border-b">
                                            <span className="text-muted-foreground">
                                                {isCanceling ? 'Access Until' : 'Renewal Date'}
                                            </span>
                                            <span className="font-medium">
                                                {format(new Date(status.subscription.currentPeriodEnd), 'PPP')}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {isCanceling && status.subscription.currentPeriodEnd && (
                                    <div className="rounded-lg border border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20 p-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Clock className="h-4 w-4 text-orange-600" />
                                            <span className="font-medium text-sm text-orange-700 dark:text-orange-400">Subscription ending</span>
                                        </div>
                                        <p className="text-xs text-orange-600 dark:text-orange-400/80">
                                            Full access until {format(new Date(status.subscription.currentPeriodEnd), 'PPP')}. After that, you&apos;ll be downgraded to Free.
                                        </p>
                                    </div>
                                )}

                                {isPaidPlan && !isCanceling && (
                                    <Button
                                        variant="destructive"
                                        onClick={() => setShowCancelDialog(true)}
                                        className="w-full"
                                    >
                                        Cancel Subscription
                                    </Button>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-6">
                                <p className="text-muted-foreground">You are on the Free plan.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Daily Usage */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Zap className="h-5 w-5" />
                            Today&apos;s Usage
                        </CardTitle>
                        <CardDescription>Your daily usage resets at midnight</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {usage?.limits ? (
                            <>
                                <UsageBar
                                    label="Questions Attempted"
                                    used={usage.questionsUsed}
                                    limit={usage.limits.questionsPerDay}
                                />
                                <UsageBar
                                    label="AI Explanations"
                                    used={usage.aiExplanationsUsed}
                                    limit={usage.limits.aiExplanationsPerDay}
                                />
                            </>
                        ) : (
                            <p className="text-center text-muted-foreground py-6">No usage data available.</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Upgrade Section — shown when Free or Canceling */}
            {(isFreePlan || isCanceling) && paidPlans.length > 0 && (
                <div>
                    <div className="mb-4">
                        <h2 className="text-xl font-semibold">
                            {isCanceling ? 'Resubscribe' : 'Upgrade Your Plan'}
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            {isCanceling
                                ? 'Re-activate your subscription before it expires.'
                                : 'Unlock unlimited access and supercharge your VCE preparation.'}
                        </p>
                    </div>

                    <div className={cn(
                        "grid gap-6",
                        paidPlans.length === 1 ? "max-w-sm" : "md:grid-cols-2"
                    )}>
                        {paidPlans.map((plan) => {
                            const isCurrent = currentPlanId === plan.id && !isCanceling;
                            const features = getPlanFeatures(plan);
                            return (
                                <Card key={plan.id} className="relative border-primary/40 shadow-sm">
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                        <Badge className="bg-primary text-primary-foreground px-3">
                                            Recommended
                                        </Badge>
                                    </div>
                                    <CardHeader className="pt-6">
                                        <CardTitle className="text-xl">{plan.name}</CardTitle>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-3xl font-bold">
                                                ${(plan.price / 100).toFixed(2)}
                                            </span>
                                            <span className="text-muted-foreground text-sm">/month</span>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <ul className="space-y-2">
                                            {features.map((f, i) => (
                                                <li key={i} className="flex items-center gap-2 text-sm">
                                                    <Check className="h-4 w-4 text-primary shrink-0" />
                                                    <span>{f}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <Button
                                            className="w-full"
                                            disabled={isCurrent || processing === plan.id}
                                            onClick={() => handleSubscribe(plan)}
                                        >
                                            {processing === plan.id
                                                ? 'Processing...'
                                                : isCurrent
                                                    ? 'Current Plan'
                                                    : isCanceling
                                                        ? 'Resubscribe'
                                                        : 'Upgrade Now'}
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Billing History */}
            {isPaidPlan && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Billing History
                        </CardTitle>
                        <CardDescription>View your past invoices and receipts</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {invoices.length > 0 ? (
                            <div className="space-y-3">
                                {invoices.map((invoice) => (
                                    <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                        <div className="flex flex-col gap-1">
                                            <span className="font-medium text-sm">
                                                {format(new Date(invoice.created), 'MMM d, yyyy')}
                                            </span>
                                            <span className="text-xs text-muted-foreground uppercase">
                                                {invoice.currency} ${(invoice.amount / 100).toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="capitalize text-xs">
                                                {invoice.status}
                                            </Badge>
                                            {invoice.hostedInvoiceUrl && (
                                                <Button variant="ghost" size="icon" asChild title="View Invoice">
                                                    <a href={invoice.hostedInvoiceUrl} target="_blank" rel="noopener noreferrer">
                                                        <FileText className="h-4 w-4" />
                                                    </a>
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-muted-foreground py-6">No invoices found.</p>
                        )}
                    </CardContent>
                </Card>
            )}

            <ConfirmDialog
                open={showCancelDialog}
                onOpenChange={setShowCancelDialog}
                title="Cancel Subscription"
                description="Are you sure you want to cancel? You will keep access until the end of the current billing period, then be downgraded to the Free plan."
                confirmLabel="Yes, Cancel"
                cancelLabel="Keep Subscription"
                variant="destructive"
                loading={cancelling}
                onConfirm={handleCancel}
                icon={<AlertTriangle className="h-5 w-5 text-destructive" />}
            />
        </div>
    );
}

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import {
    getSubscription,
    cancelSubscription,
    getInvoices,
    getUsage,
    SubscriptionStatus,
    UsageStatus,
    Invoice
} from '@/lib/api/billing';
import { Button } from '@/components/dashboard/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/dashboard/ui/card';
import { Badge } from '@/components/dashboard/ui/badge';
import { FileText, CreditCard, Zap, TrendingUp, AlertTriangle, Clock } from 'lucide-react';
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
                    {isUnlimited ? `${used} / Unlimited` : `${used} / ${limit}`}
                </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all ${isUnlimited ? 'bg-green-500 w-0' : isNearLimit ? 'bg-orange-500' : 'bg-primary'}`}
                    style={{ width: isUnlimited ? '0%' : `${percentage}%` }}
                />
            </div>
        </div>
    );
}

export default function SubscriptionPage() {
    usePageTitle('Subscription & Billing');
    const { data: session } = useSession();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<SubscriptionStatus | null>(null);
    const [usage, setUsage] = useState<UsageStatus | null>(null);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);
    const [showCancelDialog, setShowCancelDialog] = useState(false);

    const paymentSuccess = searchParams.get('payment_success') === 'true';
    const accessToken = (session?.user as any)?.accessToken as string | undefined;

    useEffect(() => {
        if (session?.user && accessToken) {
            loadData();
        }
    }, [session, accessToken]);

    useEffect(() => {
        if (paymentSuccess) {
            toast.success('Payment successful! Your subscription is now active.');
        }
    }, [paymentSuccess]);

    async function loadData() {
        try {
            const userId = Number((session?.user as any)?.id);
            if (!userId || !accessToken) return;

            const [subData, usageData, invoiceData] = await Promise.all([
                getSubscription(userId, accessToken),
                getUsage(userId, accessToken),
                getInvoices(userId, accessToken)
            ]);

            setStatus(subData);
            setUsage(usageData);
            setInvoices(invoiceData.invoices);
        } catch (error) {
            console.error('Failed to load subscription data:', error);
            toast.error('Failed to load subscription details.');
        } finally {
            setLoading(false);
        }
    }

    const handleCancel = async () => {
        setCancelling(true);
        try {
            const userId = Number((session?.user as any)?.id);
            if (!userId || !accessToken) return;

            await cancelSubscription(userId, accessToken);
            await loadData();
            toast.success('Subscription cancelled. You will be downgraded to Free at the end of the billing period.');
        } catch (error) {
            console.error('Failed to cancel:', error);
            toast.error('Failed to cancel subscription. Please try again.');
        } finally {
            setCancelling(false);
        }
    };

    const isFreePlan = status?.subscription?.price === 0;
    const isPaidPlan = status?.hasSubscription && !isFreePlan;
    const isCanceling = status?.subscription?.status === 'canceling';

    if (loading) {
        return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
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
                                        <span className="text-muted-foreground">Status</span>
                                        <span className="font-medium capitalize">{status.subscription.status}</span>
                                    </div>
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
                                            You still have full access until {format(new Date(status.subscription.currentPeriodEnd), 'PPP')}. After that, you'll be downgraded to the Free plan.
                                        </p>
                                    </div>
                                )}

                                {isFreePlan ? (
                                    <Button asChild className="w-full">
                                        <a href="/pricing">Upgrade Plan</a>
                                    </Button>
                                ) : isCanceling ? (
                                    <Button asChild className="w-full">
                                        <a href="/pricing">Resubscribe</a>
                                    </Button>
                                ) : status.subscription.status === 'active' ? (
                                    <Button
                                        variant="destructive"
                                        onClick={() => setShowCancelDialog(true)}
                                        className="w-full"
                                    >
                                        Cancel Subscription
                                    </Button>
                                ) : null}
                            </>
                        ) : (
                            <div className="text-center py-6">
                                <p className="text-muted-foreground mb-4">You don't have an active subscription.</p>
                                <Button asChild>
                                    <a href="/pricing">View Plans</a>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Daily Usage */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Zap className="h-5 w-5" />
                            Today's Usage
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

                                {isFreePlan && (
                                    <div className="rounded-lg border border-dashed border-primary/50 bg-primary/5 p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <TrendingUp className="h-4 w-4 text-primary" />
                                            <span className="font-medium text-sm">Want unlimited access?</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mb-3">
                                            Upgrade to Pro for unlimited questions, AI explanations, and full exam access.
                                        </p>
                                        <Button size="sm" asChild>
                                            <a href="/pricing">Upgrade Now</a>
                                        </Button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <p className="text-center text-muted-foreground py-6">No usage data available.</p>
                        )}
                    </CardContent>
                </Card>
            </div>

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
                            <div className="space-y-4">
                                {invoices.map((invoice) => (
                                    <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                        <div className="flex flex-col gap-1">
                                            <span className="font-medium">
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
                description="Are you sure you want to cancel your subscription? You will keep access until the end of the current billing period, then be downgraded to the Free plan."
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

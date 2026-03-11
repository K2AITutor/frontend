'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import {
    getSubscription,
    cancelSubscription,
    getInvoices,
    SubscriptionStatus,
    Invoice
} from '@/lib/api/billing';
import { Button } from '@/components/dashboard/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/dashboard/ui/card';
import { Badge } from '@/components/dashboard/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/dashboard/ui/alert';
import { CheckCircle2, AlertCircle, FileText, CreditCard } from 'lucide-react';

export default function SubscriptionPage() {
    const { data: session } = useSession();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<SubscriptionStatus | null>(null);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const paymentSuccess = searchParams.get('payment_success') === 'true';

    useEffect(() => {
        if (session?.user) {
            loadData();
        }
    }, [session]);

    useEffect(() => {
        if (paymentSuccess) {
            setMessage({ type: 'success', text: 'Payment successful! Your subscription is now active.' });
        }
    }, [paymentSuccess]);

    async function loadData() {
        try {
            const userId = Number((session?.user as any)?.id);
            if (!userId) return;

            const [subData, invoiceData] = await Promise.all([
                getSubscription(userId),
                getInvoices(userId)
            ]);

            setStatus(subData);
            setInvoices(invoiceData.invoices);
        } catch (error) {
            console.error('Failed to load subscription data:', error);
            setMessage({ type: 'error', text: 'Failed to load subscription details.' });
        } finally {
            setLoading(false);
        }
    }

    const handleCancel = async () => {
        if (!confirm('Are you sure you want to cancel your subscription? You will lose access at the end of the current billing period.')) {
            return;
        }

        setCancelling(true);
        try {
            const userId = Number((session?.user as any)?.id);
            if (!userId) return;

            await cancelSubscription(userId);
            await loadData(); // Refresh data
            setMessage({ type: 'success', text: 'Subscription cancelled successfully.' });
        } catch (error) {
            console.error('Failed to cancel:', error);
            setMessage({ type: 'error', text: 'Failed to cancel subscription. Please try again.' });
        } finally {
            setCancelling(false);
        }
    };

    if (loading) {
        return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
    }

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Subscription & Billing</h1>
                <p className="text-muted-foreground mt-2">Manage your plan and view payment history.</p>
            </div>

            {message && (
                <Alert variant={message.type === 'error' ? 'destructive' : 'default'} className={message.type === 'success' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : ''}>
                    {message.type === 'success' ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <AlertCircle className="h-4 w-4" />}
                    <AlertTitle>{message.type === 'success' ? 'Success' : 'Error'}</AlertTitle>
                    <AlertDescription>{message.text}</AlertDescription>
                </Alert>
            )}

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
                                            ${(status.subscription.price / 100).toFixed(2)} / month
                                        </p>
                                    </div>
                                    <Badge variant={status.subscription.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                                        {status.subscription.status}
                                    </Badge>
                                </div>

                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between py-2 border-b">
                                        <span className="text-muted-foreground">Status</span>
                                        <span className="font-medium capitalize">{status.subscription.status}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b">
                                        <span className="text-muted-foreground">Renewal Date</span>
                                        <span className="font-medium">
                                            {format(new Date(status.subscription.currentPeriodEnd), 'PPP')}
                                        </span>
                                    </div>
                                </div>

                                {status.subscription.status === 'active' && (
                                    <Button
                                        variant="destructive"
                                        onClick={handleCancel}
                                        disabled={cancelling}
                                        className="w-full"
                                    >
                                        {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
                                    </Button>
                                )}
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

                {/* Billing History */}
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
            </div>
        </div>
    );
}

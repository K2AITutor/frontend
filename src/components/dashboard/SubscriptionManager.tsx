'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

interface Plan {
    id: number;
    name: string;
    price: number;
    stripePriceId: string;
}

interface Subscription {
    planId: number;
    planName: string;
    status: string;
    currentPeriodEnd: string;
    price?: number;
}

interface Invoice {
    id: string;
    amount: number;
    currency: string;
    status: string;
    created: string;
    hostedInvoiceUrl: string;
    invoicePdf: string;
}

interface SubscriptionManagerProps {
    userId: string;
    token: string;
}

export default function SubscriptionManager({ userId, token }: SubscriptionManagerProps) {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [checkoutLoading, setCheckoutLoading] = useState<number | null>(null);
    const [canceling, setCanceling] = useState(false);

    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4001';

    useEffect(() => {
        const fetchBillingData = async () => {
            try {
                // Fetch Plans
                const plansRes = await fetch(`${apiBase}/api/billing/plans`);
                if (plansRes.ok) setPlans(await plansRes.json());

                // Fetch Subscription
                const subRes = await fetch(`${apiBase}/api/billing/me/${userId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (subRes.ok) {
                    const subData = await subRes.json();
                    if (subData.hasSubscription) {
                        setSubscription(subData.subscription);
                    }
                }

                // Fetch Invoices
                const invRes = await fetch(`${apiBase}/api/billing/invoices/${userId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (invRes.ok) {
                    const invData = await invRes.json();
                    setInvoices(invData.invoices || []);
                }

            } catch (error) {
                console.error('Failed to fetch billing data', error);
                toast.error('Failed to load billing information');
            } finally {
                setLoading(false);
            }
        };

        if (userId && token) {
            fetchBillingData();
        }
    }, [userId, token, apiBase]);

    const handleCheckout = async (planId: number) => {
        setCheckoutLoading(planId);
        try {
            const res = await fetch(`${apiBase}/api/billing/checkout`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ userId: Number(userId), planId }),
            });

            if (!res.ok) throw new Error('Checkout failed');

            const { checkoutUrl } = await res.json();
            window.location.href = checkoutUrl;
        } catch (error) {
            console.error('Checkout error:', error);
            toast.error('Failed to start checkout. Please try again.');
            setCheckoutLoading(null);
        }
    };

    const handleCancel = async () => {
        if (!confirm('Are you sure you want to cancel your subscription? You will retain access until the end of your current period.')) {
            return;
        }

        setCanceling(true);
        try {
            const res = await fetch(`${apiBase}/api/billing/cancel/${userId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Cancellation failed');

            const data = await res.json();
            toast.success(data.message || 'Subscription cancelled successfully');
            
            // Update local state to reflect cancellation status
            if (subscription) {
                setSubscription({
                    ...subscription,
                    status: 'canceling' // or 'canceled' depending on backend response
                });
            }
        } catch (error) {
            console.error('Cancel error:', error);
            toast.error('Failed to cancel subscription');
        } finally {
            setCanceling(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-400">Loading billing details...</div>;

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold">Subscription & Billing</h2>

            {/* Current Subscription Status Panel */}
            {subscription && (
                <div className="bg-slate-800 rounded-lg border border-indigo-500/50 p-6 shadow-lg">
                    <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-1">
                                Current Plan: <span className="text-indigo-400">{subscription.planName}</span>
                            </h3>
                            <div className="flex items-center gap-3 text-sm text-gray-300">
                                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                                    subscription.status === 'active' ? 'bg-green-900/50 text-green-400 border border-green-800' : 
                                    subscription.status === 'canceling' ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-800' :
                                    'bg-red-900/50 text-red-400 border border-red-800'
                                }`}>
                                    {subscription.status}
                                </span>
                                <span>
                                    {subscription.status === 'canceling' ? 'Expires on: ' : 'Renews on: '}
                                    {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                        {subscription.status === 'active' && (
                            <button 
                                onClick={handleCancel}
                                disabled={canceling}
                                className="text-red-400 hover:text-red-300 text-sm underline disabled:opacity-50"
                            >
                                {canceling ? 'Processing...' : 'Cancel Subscription'}
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Free Tier Card */}
                <div className={`bg-slate-800 p-6 rounded-lg border ${!subscription ? 'border-green-500/50' : 'border-gray-700'}`}>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="font-bold text-xl text-white">Free Plan</h3>
                            <p className="text-gray-400 text-sm">Limited Access</p>
                        </div>
                        <span className="text-2xl font-bold text-white">$0</span>
                    </div>
                    <ul className="space-y-2 mb-6 text-sm text-gray-300">
                        <li className="flex items-center">✓ 5 Practice Questions/day</li>
                        <li className="flex items-center">✓ Basic Progress Tracking</li>
                    </ul>
                    <button 
                        disabled={!subscription}
                        className={`w-full py-2 rounded text-sm font-medium transition-colors ${
                            !subscription 
                                ? 'bg-green-600/20 text-green-400 cursor-default border border-green-600/50'
                                : 'bg-slate-700 text-white hover:bg-slate-600'
                        }`}
                    >
                        {!subscription ? 'Current Plan' : 'Downgrade to Free'}
                    </button>
                </div>

                {/* Paid Plans from API */}
                {plans.map((plan) => {
                    const isCurrentPlan = subscription?.planId === plan.id;
                    
                    return (
                        <div key={plan.id} className={`bg-slate-800 p-6 rounded-lg border relative overflow-hidden transition-all ${isCurrentPlan ? 'border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'border-indigo-500/30 hover:border-indigo-500/60'}`}>
                            {plan.name.includes('Pro') && !isCurrentPlan && (
                                <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs px-2 py-1 rounded-bl shadow-sm">
                                    RECOMMENDED
                                </div>
                            )}
                            {isCurrentPlan && (
                                <div className="absolute top-0 right-0 bg-green-600 text-white text-xs px-2 py-1 rounded-bl shadow-sm">
                                    ACTIVE
                                </div>
                            )}
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-xl text-white">{plan.name}</h3>
                                    <p className="text-gray-400 text-sm">Full Access</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-bold text-white">${(plan.price / 100).toFixed(2)}</span>
                                    <span className="text-xs text-gray-400 block">/month</span>
                                </div>
                            </div>
                            <ul className="space-y-2 mb-6 text-sm text-gray-300">
                                <li className="flex items-center">✓ Unlimited Practice</li>
                                <li className="flex items-center">✓ AI Tutor Access</li>
                                <li className="flex items-center">✓ Detailed Analytics</li>
                            </ul>
                            <button 
                                onClick={() => !isCurrentPlan && handleCheckout(plan.id)}
                                disabled={checkoutLoading === plan.id || isCurrentPlan}
                                className={`w-full py-2 rounded text-sm font-medium transition-all ${
                                    isCurrentPlan 
                                        ? 'bg-green-600/20 text-green-400 cursor-default border border-green-600/50'
                                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/20'
                                }`}
                            >
                                {checkoutLoading === plan.id 
                                    ? 'Processing...' 
                                    : isCurrentPlan 
                                        ? 'Current Plan' 
                                        : `Upgrade to ${plan.name}`}
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Billing History Table */}
            {invoices.length > 0 && (
                <div className="bg-slate-900 rounded-lg border border-gray-800 overflow-hidden">
                    <div className="p-4 border-b border-gray-800">
                        <h3 className="text-lg font-semibold text-white">Billing History</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-400">
                            <thead className="text-xs text-gray-500 uppercase bg-slate-800/50">
                                <tr>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3">Amount</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-right">Invoice</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map((invoice) => (
                                    <tr key={invoice.id} className="border-b border-gray-800 hover:bg-slate-800/30">
                                        <td className="px-6 py-4">
                                            {new Date(invoice.created).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-white">
                                            ${(invoice.amount / 100).toFixed(2)} {invoice.currency.toUpperCase()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 rounded text-xs capitalize ${
                                                invoice.status === 'paid' ? 'bg-green-900/30 text-green-400' : 'bg-gray-700 text-gray-400'
                                            }`}>
                                                {invoice.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {invoice.hostedInvoiceUrl ? (
                                                <a 
                                                    href={invoice.hostedInvoiceUrl} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="text-indigo-400 hover:text-indigo-300 hover:underline"
                                                >
                                                    Download
                                                </a>
                                            ) : (
                                                <span className="text-gray-600">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

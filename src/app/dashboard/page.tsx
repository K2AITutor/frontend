'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Notification {
    id: number;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
}

interface Plan {
    id: number;
    name: string;
    price: number;
    stripePriceId: string;
}

export default function DashboardPage() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [checkoutLoading, setCheckoutLoading] = useState<number | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');

            if (!token || !userId) {
                router.push('/auth/login');
                return;
            }

            const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4001';

            try {
                // Fetch Notifications
                const notifRes = await fetch(`${apiBase}/api/internal/notifications/${userId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (notifRes.ok) setNotifications(await notifRes.json());

                // Fetch Plans
                const plansRes = await fetch(`${apiBase}/api/billing/plans`);
                if (plansRes.ok) setPlans(await plansRes.json());

            } catch (error) {
                console.error('Failed to fetch dashboard data', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [router]);

    const markAsRead = async (id: number) => {
        try {
            const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4001';
            await fetch(`${apiBase}/api/internal/notifications/${id}/read`, { method: 'POST' });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error('Failed to mark as read', error);
        }
    };

    const handleCheckout = async (planId: number) => {
        setCheckoutLoading(planId);
        try {
            const userId = localStorage.getItem('userId');
            const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4001';
            
            const res = await fetch(`${apiBase}/api/billing/checkout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: Number(userId), planId }),
            });

            if (!res.ok) throw new Error('Checkout failed');

            const { checkoutUrl } = await res.json();
            // Redirect to Stripe (or mock URL)
            window.location.href = checkoutUrl;
        } catch (error) {
            console.error('Checkout error:', error);
            alert('Failed to start checkout. Please try again.');
            setCheckoutLoading(null);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <main className="min-h-screen p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Student Dashboard</h1>
                <div className="text-sm text-gray-400">
                    Welcome back!
                </div>
            </div>

            {/* Notifications Section */}
            <div className="mb-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                    Notifications 
                    {unreadCount > 0 && (
                        <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                            {unreadCount} new
                        </span>
                    )}
                </h2>
                
                {notifications.length === 0 ? (
                    <p className="text-gray-400">No new notifications.</p>
                ) : (
                    <div className="space-y-3">
                        {notifications.map((notification) => (
                            <div 
                                key={notification.id} 
                                className={`p-4 rounded border transition-colors ${
                                    notification.isRead 
                                        ? 'bg-gray-800 border-gray-700 opacity-50' 
                                        : 'bg-gray-750 border-indigo-500/50 shadow-sm'
                                }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-medium text-white">{notification.title}</h4>
                                        <p className="text-sm text-gray-300 mt-1">{notification.message}</p>
                                        <span className="text-xs text-gray-500 mt-2 block">
                                            {new Date(notification.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    {!notification.isRead && (
                                        <button 
                                            onClick={() => markAsRead(notification.id)}
                                            className="text-xs text-indigo-400 hover:text-indigo-300 underline"
                                        >
                                            Mark as Read
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-slate-900 p-6 rounded border border-gray-800 hover:border-indigo-500/30 transition-colors">
                    <h3 className="font-semibold mb-2 text-lg text-indigo-400">Practice</h3>
                    <p className="text-slate-400 text-sm">
                        Start a new practice session based on your current topics.
                    </p>
                    <button className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded text-sm font-medium">
                        Start Practice
                    </button>
                </div>

                <div className="bg-slate-900 p-6 rounded border border-gray-800 hover:border-indigo-500/30 transition-colors">
                    <h3 className="font-semibold mb-2 text-lg text-indigo-400">AI Tutor</h3>
                    <p className="text-slate-400 text-sm">
                        Ask questions and get instant, step-by-step explanations.
                    </p>
                </div>

                <div className="bg-slate-900 p-6 rounded border border-gray-800 hover:border-indigo-500/30 transition-colors">
                    <h3 className="font-semibold mb-2 text-lg text-indigo-400">Progress</h3>
                    <p className="text-slate-400 text-sm">
                        View your mastery levels and identify weak areas.
                    </p>
                </div>
            </div>

            {/* Billing Section */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold mb-6">Subscription & Billing</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Free Tier Card */}
                    <div className="bg-slate-800 p-6 rounded-lg border border-gray-700">
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
                        <button disabled className="w-full bg-gray-700 text-gray-400 py-2 rounded text-sm font-medium cursor-default">
                            Current Plan
                        </button>
                    </div>

                    {/* Paid Plans from API */}
                    {plans.map((plan) => (
                        <div key={plan.id} className="bg-slate-800 p-6 rounded-lg border border-indigo-500/30 relative overflow-hidden">
                            {plan.name.includes('Pro') && (
                                <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs px-2 py-1 rounded-bl">
                                    RECOMMENDED
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
                                onClick={() => handleCheckout(plan.id)}
                                disabled={checkoutLoading === plan.id}
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white py-2 rounded text-sm font-medium transition-all"
                            >
                                {checkoutLoading === plan.id ? 'Processing...' : `Upgrade to ${plan.name}`}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import SubscriptionManager from '@/components/dashboard/SubscriptionManager';

interface Notification {
    id: number;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
}

export default function DashboardPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
            <DashboardContent />
        </Suspense>
    );
}

function DashboardContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [authData, setAuthData] = useState<{ userId: string; token: string } | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            let token = localStorage.getItem('token');
            let userId = localStorage.getItem('userId');

            if (!token || !userId) {
                if (process.env.NEXT_PUBLIC_ENABLE_AUTH_BYPASS === 'true') {
                    // BYPASS: Use mock credentials for testing/demo (Dev only)
                    console.warn('Authentication bypassed: Using mock user (ID: 1)');
                    token = 'mock_token_bypass';
                    userId = '1';
                    
                    localStorage.setItem('token', token);
                    localStorage.setItem('userId', userId);
                } else {
                    router.push('/auth/signin');
                    return;
                }
            }

            setAuthData({ userId, token });

            const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4001';

            try {
                // Fetch Notifications
                const notifRes = await fetch(`${apiBase}/api/internal/notifications/${userId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (notifRes.ok) setNotifications(await notifRes.json());
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
            await fetch(`${apiBase}/api/internal/notifications/${id}/read`, { 
                method: 'POST',
                headers: { 'Authorization': `Bearer ${authData?.token}` }
            });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error('Failed to mark as read', error);
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

            {/* Subscription Section */}
            {authData && (
                <SubscriptionManager userId={authData.userId} token={authData.token} />
            )}
        </main>
    );
}
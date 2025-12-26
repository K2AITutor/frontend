'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import SubscriptionManager from '@/components/dashboard/SubscriptionManager';

export default function SubscriptionPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
            <SubscriptionContent />
        </Suspense>
    );
}

function SubscriptionContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [authData, setAuthData] = useState<{ userId: string; token: string } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = () => {
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
            setLoading(false);
        };

        checkAuth();
    }, [router]);

    // Handle Mock Payment Success Redirect
    useEffect(() => {
        if (searchParams.get('payment_success') === 'true') {
            // In a real app, we might verify with backend here, 
            // but the mock flow just redirects back to this page.
            // We can clear the params to clean the URL.
            router.replace('/dashboard/subscription');
        }
    }, [searchParams, router]);

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <main className="min-h-screen p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <button 
                    onClick={() => router.push('/dashboard')}
                    className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center mb-4"
                >
                    ← Back to Dashboard
                </button>
                <h1 className="text-3xl font-bold">Subscription & Billing</h1>
                <p className="text-gray-400 mt-2">Manage your plan, billing history, and payment methods.</p>
            </div>

            {authData && (
                <SubscriptionManager userId={authData.userId} token={authData.token} />
            )}
        </main>
    );
}

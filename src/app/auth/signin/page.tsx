'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-toastify';

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">Loading...</div>}>
            <LoginContent />
        </Suspense>
    );
}

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (searchParams.get('registered') === 'true') {
            toast.success('Registration successful! Please sign in.');
        }
    }, [searchParams]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
            const res = await fetch(`${apiBase}/api/auth/signin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Invalid email or password');
            }

            const data = await res.json();
            // Save JWT token
            localStorage.setItem('token', data.access_token);
            // Save user info if available
            if (data.userId) localStorage.setItem('userId', data.userId);

            toast.success('Login successful!');
            // Redirect to dashboard
            router.push('/dashboard');
        } catch (err: any) {
            toast.error(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-900 p-4">
            <div className="w-full max-w-md space-y-8 rounded-lg bg-gray-800 p-8 shadow-lg">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
                    <p className="mt-2 text-sm text-gray-400">Sign in to your account</p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                placeholder="you@example.com"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="flex items-center">
                                <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Signing In...
                            </span>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                <div className="text-center text-sm text-gray-400">
                    Don't have an account?{' '}
                    <Link href="/auth/signup" className="font-medium text-indigo-400 hover:text-indigo-300">
                        Sign up
                    </Link>
                </div>
            </div>
        </div>
    );
}

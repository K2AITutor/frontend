'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import DashboardShell from '@/components/layout/DashboardShell';
import MasteryRadarChart from '@/components/dashboard/MasteryRadarChart';
import StudentActivityHeatmap from '@/components/dashboard/StudentActivityHeatmap';
import { 
  PlayCircle, 
  ArrowRight, 
  TrendingUp, 
  Target, 
  Award,
  Zap
} from 'lucide-react';

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
        <DashboardShell>
            <Suspense fallback={<div className="p-8 text-center">Loading dashboard...</div>}>
                <DashboardContent />
            </Suspense>
        </DashboardShell>
    );
}

function DashboardContent() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [authData, setAuthData] = useState<{ userId: string; token: string } | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            let token = localStorage.getItem('token');
            let userId = localStorage.getItem('userId');

            if (!token || !userId) {
                if (process.env.NEXT_PUBLIC_ENABLE_MOCK_MODE === 'true') {
                    console.warn('Authentication bypassed (Mock Mode): Using mock user (ID: 1)');
                    token = 'mock_token_bypass';
                    userId = '1';
                    localStorage.setItem('token', token);
                    localStorage.setItem('userId', userId);
                    localStorage.setItem('userRole', 'STUDENT');
                } else {
                    router.push('/auth/signin');
                    return;
                }
            }

            setAuthData({ userId, token });
            const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4002';

            try {
                const notifRes = await fetch(`${apiBase}/api/notifications/me/${userId}`, {
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
            const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4002';
            await fetch(`${apiBase}/api/notifications/${id}/read/${authData?.userId}`, { 
                method: 'POST',
                headers: { 'Authorization': `Bearer ${authData?.token}` }
            });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error('Failed to mark as read', error);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500 font-medium">Loading your learning workspace...</div>;

    const unreadNotifications = notifications.filter(n => !n.isRead);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Top Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Score" value="1,240" trend="+15%" icon={TrendingUp} color="blue" />
                <StatCard title="Daily Streak" value="5 Days" trend="New Personal Best" icon={Zap} color="orange" />
                <StatCard title="Topic Mastery" value="68%" trend="+4% this week" icon={Target} color="green" />
                <StatCard title="Achievements" value="12" trend="Next: Calculus King" icon={Award} color="purple" />
            </div>

            {/* Main Bento Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* primary Action - Smart Resume (Span 8) */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
                        <div className="relative z-10">
                            <h2 className="text-2xl font-bold mb-2">Continue your learning</h2>
                            <p className="text-blue-100 mb-6 max-w-md">You were working on <span className="font-bold underline decoration-blue-300">Functions & Graphs</span>. Keep the momentum going!</p>
                            <button 
                                onClick={() => router.push('/practice')}
                                className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-50 transition-all active:scale-95 shadow-lg shadow-white/10"
                            >
                                <PlayCircle size={20} />
                                Resume Practice
                            </button>
                        </div>
                        {/* Abstract background shape */}
                        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                    </div>

                    {/* Chart Card */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm min-h-[400px]">
                        <MasteryRadarChart />
                    </div>
                </div>

                {/* Secondary Cards (Span 4) */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Heatmap Card */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                        <StudentActivityHeatmap />
                    </div>

                    {/* Notifications Bento Card */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col h-[calc(100%-240px)] min-h-[300px]">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-800">Recent Updates</h3>
                            {unreadNotifications.length > 0 && (
                                <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                                    {unreadNotifications.length} NEW
                                </span>
                            )}
                        </div>
                        
                        <div className="flex-1 space-y-3 overflow-y-auto pr-2">
                            {notifications.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center py-8">
                                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-2">
                                        <Bell size={24} />
                                    </div>
                                    <p className="text-sm text-slate-400">All caught up!</p>
                                </div>
                            ) : (
                                notifications.map((n) => (
                                    <div 
                                        key={n.id} 
                                        onClick={() => !n.isRead && markAsRead(n.id)}
                                        className={`group p-3 rounded-xl border transition-all cursor-pointer ${
                                            n.isRead 
                                                ? 'bg-slate-50 border-slate-100 opacity-60' 
                                                : 'bg-white border-blue-100 hover:border-blue-300 shadow-sm'
                                        }`}
                                    >
                                        <h4 className="text-xs font-bold text-slate-800">{n.title}</h4>
                                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{n.message}</p>
                                        <div className="mt-2 flex justify-between items-center">
                                            <span className="text-[9px] font-medium text-slate-400">
                                                {new Date(n.createdAt).toLocaleDateString()}
                                            </span>
                                            {!n.isRead && <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        
                        <button className="mt-4 w-full py-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-1">
                            View All Notifications
                            <ArrowRight size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, trend, icon: Icon, color }: any) {
    const colors: any = {
        blue: 'text-blue-600 bg-blue-50',
        orange: 'text-orange-600 bg-orange-50',
        green: 'text-green-600 bg-green-50',
        purple: 'text-purple-600 bg-purple-50'
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-200 transition-all hover:shadow-md group cursor-default">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-xl transition-colors ${colors[color] || colors.blue}`}>
                    <Icon size={20} />
                </div>
                <span className="text-[10px] font-bold text-slate-400 group-hover:text-blue-500 transition-colors uppercase tracking-wider">
                    Live Data
                </span>
            </div>
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wide mb-1">{title}</h3>
            <p className="text-2xl font-black text-slate-800">{value}</p>
            <p className="text-[10px] text-slate-400 mt-2 font-medium">{trend}</p>
        </div>
    );
}

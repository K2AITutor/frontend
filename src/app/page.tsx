"use client";

import DashboardStats from "@/components/dashboard/DashboardStats";
import RecommendedTopics from "@/components/dashboard/RecommendedTopics";

export default function HomePage() {
    return (
        <main className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                <DashboardStats />
            </div>
            <RecommendedTopics />
        </main>
    );
}

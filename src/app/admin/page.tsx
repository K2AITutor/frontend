"use client";

import Link from "next/link";

export default function AdminPage() {
    return (
        <div>
            <h1 className="text-3xl mb-4">Admin Dashboard</h1>

            <div className="flex flex-col gap-3">
                <Link href="/admin/users">Manage Users</Link>
                <Link href="/admin/topics">Manage Topics</Link>
                <Link href="/admin/questions">Manage Questions</Link>
                <Link href="/admin/payments">View Payments</Link>
            </div>
        </div>
    );
}

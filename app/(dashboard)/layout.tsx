"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 dark:border-slate-50"></div>
            </div>
        );
    }

    if (!user) {
        return null; // Don't render anything while redirecting
    }

    return (
        <div className="flex h-screen" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
            <aside className="hidden md:block">
                <Sidebar />
            </aside>
            <main className="flex-1 overflow-y-auto p-4 pb-20 md:p-8 md:pb-8">{children}</main>
            <MobileNav />
        </div>
    );
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { NotificationProvider } from "@/components/NotificationProvider";
import { NotificationBell } from "@/components/NotificationBell";
import { BudgetAlertMonitor } from "@/components/BudgetAlertMonitor";

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
        <CurrencyProvider>
            <NotificationProvider>
                {/* Budget alert monitor runs on app load to check thresholds */}
                <BudgetAlertMonitor />
                <div className="flex h-screen" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
                    <aside className="hidden md:block">
                        <Sidebar />
                    </aside>
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {/* Top bar with notification bell */}
                        <header className="flex items-center justify-end px-4 py-3 md:px-8 md:py-4">
                            <NotificationBell />
                        </header>
                        <main className="flex-1 overflow-y-auto px-4 pb-24 md:px-8 md:pb-8">{children}</main>
                    </div>
                    <MobileNav />
                </div>
            </NotificationProvider>
        </CurrencyProvider>
    );
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useNavigationStore } from "@/store/useNavigationStore";
import { Sidebar } from "@/components/Sidebar";
import { MobileMenu } from "@/components/MobileMenu";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { NotificationProvider } from "@/components/NotificationProvider";
import { NotificationBell } from "@/components/NotificationBell";
import { BudgetAlertMonitor } from "@/components/BudgetAlertMonitor";
import { ConnectionStatusBanner } from "@/components/ConnectionStatusBanner";
import { Menu } from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading } = useAuthStore();
    const { toggleMobileMenu } = useNavigationStore();
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
                    {/* Desktop Sidebar */}
                    <aside className="hidden md:block">
                        <Sidebar />
                    </aside>

                    {/* Mobile Menu (slide-out overlay) */}
                    <MobileMenu />

                    {/* Main Content Area */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {/* Connection status banner */}
                        <ConnectionStatusBanner />

                        {/* Header with hamburger menu (mobile) and notification bell */}
                        <header className="flex items-center justify-between px-4 py-3 md:px-8 md:py-4">
                            {/* Hamburger menu button - mobile only */}
                            <button
                                onClick={toggleMobileMenu}
                                className="p-2 rounded-lg md:hidden text-slate-600 hover:text-slate-900 hover:bg-slate-100/50 dark:text-slate-400 dark:hover:text-slate-50 dark:hover:bg-slate-800/50 transition-colors touch-target"
                                aria-label="Open navigation menu"
                            >
                                <Menu className="h-5 w-5" />
                            </button>

                            {/* Spacer for desktop (keeps notification bell on right) */}
                            <div className="flex-1" />

                            {/* Notification bell */}
                            <NotificationBell />
                        </header>

                        {/* Main content */}
                        <main className="flex-1 overflow-y-auto px-4 pb-8 md:px-8">{children}</main>
                    </div>
                </div>
            </NotificationProvider>
        </CurrencyProvider>
    );
}

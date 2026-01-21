"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Wallet,
    PieChart,
    Target,
    Settings,
    LogOut,
    Sparkles,
    BarChart3
} from "lucide-react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useAuthStore } from "@/store/useAuthStore";

const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Transactions", href: "/transactions", icon: Wallet },
    { name: "Budgets", href: "/budgets", icon: PieChart },
    { name: "Goals", href: "/goals", icon: Target },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();
    const { user } = useAuthStore();

    const handleLogout = () => {
        signOut(auth);
    };

    return (
        <div className="sidebar-glass flex h-screen w-64 flex-col">
            {/* Logo */}
            <div className="flex h-20 items-center justify-center px-6">
                <div className="flex items-center space-x-2">
                    <div className="bg-gradient-animated p-2 rounded-xl">
                        <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gradient">
                        Frugal
                    </h1>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2 p-4">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center space-x-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 ease-in-out",
                                isActive
                                    ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                                    : "text-slate-600 hover:bg-slate-100/50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-50"
                            )}
                        >
                            <item.icon className={cn(
                                "h-5 w-5 transition-colors",
                                isActive ? "text-indigo-500" : ""
                            )} />
                            <span>{item.name}</span>
                            {isActive && (
                                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-500" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* User Info & Logout */}
            <div className="border-t border-slate-200/50 dark:border-slate-700/50 p-4 space-y-3">
                {user && (
                    <div className="flex items-center space-x-3 px-2">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-teal-500 flex items-center justify-center text-white font-semibold text-sm">
                            {user.email?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div className="flex-1 truncate">
                            <p className="text-sm font-medium truncate">{user.displayName || user.email}</p>
                            <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        </div>
                    </div>
                )}
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center space-x-3 rounded-xl px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                >
                    <LogOut className="h-5 w-5" />
                    <span>Log Out</span>
                </button>
            </div>
        </div>
    );
}

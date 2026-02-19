"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navItems } from "@/lib/navigation";
import {
    LogOut,
    Sparkles,
    PanelLeftClose,
    PanelLeftOpen,
} from "lucide-react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useAuthStore } from "@/store/useAuthStore";
import { useNavigationStore } from "@/store/useNavigationStore";

export function Sidebar() {
    const pathname = usePathname();
    const { user } = useAuthStore();
    const { sidebarCollapsed, toggleSidebar } = useNavigationStore();

    const handleLogout = () => {
        signOut(auth);
    };

    return (
        <div
            className={cn(
                "sidebar-glass sidebar-transition flex h-screen flex-col overflow-hidden",
                sidebarCollapsed ? "w-16" : "w-64"
            )}
        >
            {/* Logo */}
            <div className={cn(
                "flex h-16 items-center shrink-0",
                sidebarCollapsed ? "justify-center px-2" : "px-4"
            )}>
                <div className={cn(
                    "flex items-center gap-3 min-w-0",
                    sidebarCollapsed && "justify-center"
                )}>
                    <div className="bg-gradient-animated p-2 rounded-xl shrink-0">
                        <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <h1 className={cn(
                        "text-xl font-bold text-gradient whitespace-nowrap transition-all duration-300",
                        sidebarCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
                    )}>
                        Frugal
                    </h1>
                </div>
            </div>

            {/* Collapse Toggle Button */}
            <div className={cn(
                "px-2 pb-2 shrink-0",
                sidebarCollapsed ? "flex justify-center" : "flex justify-end px-3"
            )}>
                <button
                    onClick={toggleSidebar}
                    className={cn(
                        "p-2 rounded-lg transition-colors",
                        "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50",
                        "dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50"
                    )}
                    aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    aria-expanded={!sidebarCollapsed}
                >
                    {sidebarCollapsed ? (
                        <PanelLeftOpen className="h-4 w-4" />
                    ) : (
                        <PanelLeftClose className="h-4 w-4" />
                    )}
                </button>
            </div>

            {/* Navigation */}
            <nav className={cn(
                "flex-1 space-y-1 overflow-y-auto overflow-x-hidden",
                sidebarCollapsed ? "px-2" : "px-3"
            )}>
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "group relative flex items-center rounded-xl text-sm font-medium transition-all duration-200",
                                sidebarCollapsed ? "justify-center p-3" : "gap-3 px-3 py-2.5",
                                isActive
                                    ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                                    : "text-slate-600 hover:bg-slate-100/50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-50"
                            )}
                            aria-current={isActive ? "page" : undefined}
                        >
                            <item.icon className={cn(
                                "h-5 w-5 shrink-0 transition-colors",
                                isActive && "text-indigo-500"
                            )} />
                            <span className={cn(
                                "whitespace-nowrap transition-all duration-300 min-w-0",
                                sidebarCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 flex-1"
                            )}>
                                {item.name}
                            </span>
                            {isActive && !sidebarCollapsed && (
                                <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0" />
                            )}
                            {/* Tooltip for collapsed state */}
                            {sidebarCollapsed && (
                                <span className="sidebar-tooltip" role="tooltip">
                                    {item.name}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* User Info & Logout */}
            <div className={cn(
                "border-t border-slate-200/50 dark:border-slate-700/50 shrink-0",
                sidebarCollapsed ? "p-2 space-y-2" : "p-3 space-y-3"
            )}>
                {user && (
                    <div className={cn(
                        "flex items-center min-w-0",
                        sidebarCollapsed ? "justify-center" : "gap-3 px-1"
                    )}>
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-teal-500 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                            {user.email?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div className={cn(
                            "min-w-0 transition-all duration-300",
                            sidebarCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 flex-1"
                        )}>
                            <p className="text-sm font-medium truncate">{user.displayName || user.email}</p>
                            <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        </div>
                    </div>
                )}
                <button
                    onClick={handleLogout}
                    className={cn(
                        "group relative flex w-full items-center rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors",
                        sidebarCollapsed ? "justify-center p-3" : "gap-3 px-3 py-2.5"
                    )}
                >
                    <LogOut className="h-5 w-5 shrink-0" />
                    <span className={cn(
                        "whitespace-nowrap transition-all duration-300",
                        sidebarCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
                    )}>
                        Log Out
                    </span>
                    {/* Tooltip for collapsed state */}
                    {sidebarCollapsed && (
                        <span className="sidebar-tooltip" role="tooltip">
                            Log Out
                        </span>
                    )}
                </button>
            </div>
        </div>
    );
}

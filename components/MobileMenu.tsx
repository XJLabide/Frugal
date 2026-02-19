"use client";

import { useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navItems } from "@/lib/navigation";
import { X, LogOut, Sparkles } from "lucide-react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useAuthStore } from "@/store/useAuthStore";
import { useNavigationStore } from "@/store/useNavigationStore";

export function MobileMenu() {
    const pathname = usePathname();
    const { user } = useAuthStore();
    const { mobileMenuOpen, closeMobileMenu } = useNavigationStore();

    const handleLogout = () => {
        signOut(auth);
        closeMobileMenu();
    };

    // Close menu on route change
    useEffect(() => {
        closeMobileMenu();
    }, [pathname, closeMobileMenu]);

    // Handle escape key to close menu
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === "Escape" && mobileMenuOpen) {
            closeMobileMenu();
        }
    }, [mobileMenuOpen, closeMobileMenu]);

    useEffect(() => {
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [mobileMenuOpen]);

    return (
        <>
            {/* Backdrop */}
            <div
                className={cn(
                    "mobile-menu-backdrop md:hidden",
                    mobileMenuOpen && "open"
                )}
                onClick={closeMobileMenu}
                aria-hidden="true"
                style={{ pointerEvents: mobileMenuOpen ? "auto" : "none" }}
            />

            {/* Menu Panel */}
            <div
                className={cn(
                    "mobile-menu-panel md:hidden safe-area-top",
                    mobileMenuOpen && "open"
                )}
                role="dialog"
                aria-modal="true"
                aria-label="Navigation menu"
                aria-hidden={!mobileMenuOpen}
            >
                {/* Header */}
                <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200/50 dark:border-slate-700/50">
                    <div className="flex items-center space-x-2">
                        <div className="bg-gradient-animated p-2 rounded-xl">
                            <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-gradient">Frugal</span>
                    </div>
                    <button
                        onClick={closeMobileMenu}
                        className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100/50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50 transition-colors touch-target"
                        aria-label="Close navigation menu"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={closeMobileMenu}
                                className={cn(
                                    "flex items-center space-x-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 ease-in-out touch-target",
                                    isActive
                                        ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                                        : "text-slate-600 hover:bg-slate-100/50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-50"
                                )}
                                aria-current={isActive ? "page" : undefined}
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
                <div className="border-t border-slate-200/50 dark:border-slate-700/50 p-4 space-y-3 safe-area-bottom">
                    {user && (
                        <div className="flex items-center space-x-3 px-2">
                            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-teal-500 flex items-center justify-center text-white font-semibold text-sm shrink-0">
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
                        className="flex w-full items-center space-x-3 rounded-xl px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors touch-target"
                    >
                        <LogOut className="h-5 w-5" />
                        <span>Log Out</span>
                    </button>
                </div>
            </div>
        </>
    );
}

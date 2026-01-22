"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Wallet,
    PieChart,
    Target,
    BarChart3,
    Settings,
} from "lucide-react";

const navItems = [
    { name: "Home", href: "/", icon: LayoutDashboard },
    { name: "Transactions", href: "/transactions", icon: Wallet },
    { name: "Budgets", href: "/budgets", icon: PieChart },
    { name: "Goals", href: "/goals", icon: Target },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Settings", href: "/settings", icon: Settings },
];

export function MobileNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 safe-area-bottom">
            <div className="flex items-center justify-around h-16">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center flex-1 h-full py-2 transition-colors",
                                isActive
                                    ? "text-indigo-600 dark:text-indigo-400"
                                    : "text-slate-500 dark:text-slate-400"
                            )}
                        >
                            <item.icon className={cn(
                                "h-5 w-5 mb-1",
                                isActive && "text-indigo-600 dark:text-indigo-400"
                            )} />
                            <span className={cn(
                                "text-[10px] font-medium",
                                isActive && "font-semibold"
                            )}>
                                {item.name}
                            </span>
                            {isActive && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-indigo-500 rounded-full" />
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}

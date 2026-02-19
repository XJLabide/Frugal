import {
    LayoutDashboard,
    Wallet,
    PieChart,
    Target,
    BarChart3,
    Settings,
    LucideIcon,
} from "lucide-react";

export interface NavItem {
    name: string;
    href: string;
    icon: LucideIcon;
}

export const navItems: NavItem[] = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Transactions", href: "/transactions", icon: Wallet },
    { name: "Budgets", href: "/budgets", icon: PieChart },
    { name: "Goals", href: "/goals", icon: Target },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Settings", href: "/settings", icon: Settings },
];

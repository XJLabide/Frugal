"use client";

import * as React from "react";
import { useBudgetAlerts } from "@/hooks/useBudgetAlerts";
import { useCategories } from "@/hooks/useCategories";
import { useToast } from "@/components/NotificationProvider";

/**
 * BudgetAlertMonitor runs on dashboard load to check for budget threshold breaches.
 * When a threshold is breached, it:
 * 1. Creates a notification (via useBudgetAlerts.checkAndSendAlerts)
 * 2. Shows a toast to immediately alert the user
 */
export function BudgetAlertMonitor() {
    const { alertingBudgets, loading: alertsLoading, checkAndSendAlerts } = useBudgetAlerts();
    const { categories, loading: categoriesLoading } = useCategories();
    const { warning, error } = useToast();
    const checkedRef = React.useRef(false);
    const prevAlertingBudgetsRef = React.useRef<string[]>([]);

    // Build category name map
    const categoryNames = React.useMemo(() => {
        const map: Record<string, string> = {};
        categories.forEach((cat) => {
            map[cat.id] = cat.name;
        });
        return map;
    }, [categories]);

    // Initial check on mount - run once when data is loaded
    React.useEffect(() => {
        if (alertsLoading || categoriesLoading || checkedRef.current) return;

        checkedRef.current = true;

        // Check and send alerts (this creates notifications in Firestore)
        checkAndSendAlerts(categoryNames);
    }, [alertsLoading, categoriesLoading, categoryNames, checkAndSendAlerts]);

    // Show toasts when new alerting budgets appear
    React.useEffect(() => {
        if (alertsLoading || categoriesLoading) return;

        const currentAlertIds = alertingBudgets.map(
            (b) => `${b.budgetId}-${b.alertLevel}`
        );
        const prevAlertIds = prevAlertingBudgetsRef.current;

        // Find new alerts that weren't in the previous state
        const newAlerts = alertingBudgets.filter(
            (budget) =>
                !prevAlertIds.includes(`${budget.budgetId}-${budget.alertLevel}`)
        );

        // Show toast for each new alert
        newAlerts.forEach((budget) => {
            const categoryName =
                budget.categoryId === "all"
                    ? "Overall Budget"
                    : categoryNames[budget.categoryId] || "Category";

            if (budget.alertLevel === "exceeded") {
                error({
                    title: `Budget Exceeded: ${categoryName}`,
                    message: `You've spent ${budget.percentage.toFixed(0)}% of your budget.`,
                    duration: 6000,
                });
            } else if (budget.alertLevel === "warning") {
                warning({
                    title: `Budget Warning: ${categoryName}`,
                    message: `You've used ${budget.percentage.toFixed(0)}% of your budget.`,
                    duration: 5000,
                });
            }
        });

        // Update ref for next comparison
        prevAlertingBudgetsRef.current = currentAlertIds;
    }, [alertingBudgets, alertsLoading, categoriesLoading, categoryNames, error, warning]);

    // This component doesn't render anything visible
    return null;
}

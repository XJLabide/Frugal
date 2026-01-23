import { useState, useEffect, useMemo, useCallback } from "react";
import {
    collection,
    query,
    onSnapshot,
    addDoc,
    getDocs,
    where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/store/useAuthStore";
import { Budget, Transaction } from "@/types";
import { useNotifications } from "./useNotifications";

// Alert thresholds
const WARNING_THRESHOLD = 0.8; // 80%
const EXCEEDED_THRESHOLD = 1.0; // 100%

export type AlertLevel = "warning" | "exceeded";

export interface BudgetAlert {
    id: string;
    userId: string;
    budgetId: string;
    categoryId: string;
    alertLevel: AlertLevel;
    month: string; // YYYY-MM format for the period this alert applies to
    createdAt: number;
}

export interface BudgetStatus {
    budgetId: string;
    categoryId: string;
    budgetAmount: number;
    spent: number;
    percentage: number;
    alertLevel: AlertLevel | null;
    categoryName?: string;
}

export function useBudgetAlerts() {
    const { user } = useAuthStore();
    const { addNotification } = useNotifications();
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [sentAlerts, setSentAlerts] = useState<BudgetAlert[]>([]);
    const [loading, setLoading] = useState(true);

    // Get current month in YYYY-MM format
    const currentMonth = useMemo(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    }, []);

    // Subscribe to budgets
    useEffect(() => {
        if (!user) {
            setBudgets([]);
            return;
        }

        const q = query(collection(db, "users", user.uid, "budgets"));

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const data = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Budget[];
                setBudgets(data);
            },
            (error) => {
                console.error("Error fetching budgets for alerts:", error);
            }
        );

        return () => unsubscribe();
    }, [user]);

    // Subscribe to transactions for current month
    useEffect(() => {
        if (!user) {
            setTransactions([]);
            return;
        }

        const q = query(collection(db, "users", user.uid, "transactions"));

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const data = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Transaction[];
                // Filter to current month transactions
                const monthlyTransactions = data.filter(
                    (t) => t.date && t.date.startsWith(currentMonth)
                );
                setTransactions(monthlyTransactions);
            },
            (error) => {
                console.error("Error fetching transactions for alerts:", error);
            }
        );

        return () => unsubscribe();
    }, [user, currentMonth]);

    // Subscribe to sent alerts
    useEffect(() => {
        if (!user) {
            setSentAlerts([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const q = query(
            collection(db, "users", user.uid, "budget_alerts"),
            where("month", "==", currentMonth)
        );

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const data = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as BudgetAlert[];
                setSentAlerts(data);
                setLoading(false);
            },
            (error) => {
                console.error("Error fetching budget alerts:", error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [user, currentMonth]);

    // Calculate budget statuses
    const budgetStatuses = useMemo((): BudgetStatus[] => {
        // Only consider recurring budgets
        const recurringBudgets = budgets.filter(
            (b) => b.month === "recurring" || !b.month
        );

        // Calculate spending by category
        const spendingByCategory = transactions
            .filter((t) => t.type === "expense")
            .reduce((acc, t) => {
                acc[t.categoryId] = (acc[t.categoryId] || 0) + t.amount;
                return acc;
            }, {} as Record<string, number>);

        // Total spending for overall budget
        const totalSpending = Object.values(spendingByCategory).reduce(
            (sum, amount) => sum + amount,
            0
        );

        return recurringBudgets.map((budget) => {
            const spent =
                budget.categoryId === "all"
                    ? totalSpending
                    : spendingByCategory[budget.categoryId] || 0;
            const percentage =
                budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

            let alertLevel: AlertLevel | null = null;
            if (percentage >= EXCEEDED_THRESHOLD * 100) {
                alertLevel = "exceeded";
            } else if (percentage >= WARNING_THRESHOLD * 100) {
                alertLevel = "warning";
            }

            return {
                budgetId: budget.id,
                categoryId: budget.categoryId,
                budgetAmount: budget.amount,
                spent,
                percentage,
                alertLevel,
            };
        });
    }, [budgets, transactions]);

    // Check if an alert has already been sent
    const hasAlertBeenSent = useCallback(
        (budgetId: string, alertLevel: AlertLevel): boolean => {
            return sentAlerts.some(
                (alert) =>
                    alert.budgetId === budgetId && alert.alertLevel === alertLevel
            );
        },
        [sentAlerts]
    );

    // Record that an alert was sent
    const recordAlert = useCallback(
        async (budgetId: string, categoryId: string, alertLevel: AlertLevel) => {
            if (!user) return;

            await addDoc(collection(db, "users", user.uid, "budget_alerts"), {
                userId: user.uid,
                budgetId,
                categoryId,
                alertLevel,
                month: currentMonth,
                createdAt: Date.now(),
            });
        },
        [user, currentMonth]
    );

    // Check budgets and send alerts if needed
    const checkAndSendAlerts = useCallback(
        async (categoryNames?: Record<string, string>) => {
            if (!user || loading) return;

            for (const status of budgetStatuses) {
                if (!status.alertLevel) continue;

                // Check if we need to send this alert
                // For exceeded: always send if not already sent
                // For warning: only send if exceeded hasn't been sent (prevents warning after exceeded)
                const shouldSendAlert =
                    status.alertLevel === "exceeded"
                        ? !hasAlertBeenSent(status.budgetId, "exceeded")
                        : !hasAlertBeenSent(status.budgetId, "warning") &&
                          !hasAlertBeenSent(status.budgetId, "exceeded");

                if (shouldSendAlert) {
                    const categoryName =
                        status.categoryId === "all"
                            ? "Overall Budget"
                            : categoryNames?.[status.categoryId] || "Category";

                    const isExceeded = status.alertLevel === "exceeded";
                    const title = isExceeded
                        ? `Budget Exceeded: ${categoryName}`
                        : `Budget Warning: ${categoryName}`;
                    const message = isExceeded
                        ? `You've exceeded your ${categoryName.toLowerCase()} budget. Spent ${status.percentage.toFixed(0)}% of your budget.`
                        : `You've used ${status.percentage.toFixed(0)}% of your ${categoryName.toLowerCase()} budget.`;

                    // Create notification
                    await addNotification({
                        type: "budget_alert",
                        title,
                        message,
                        data: {
                            budgetId: status.budgetId,
                            categoryId: status.categoryId,
                            alertLevel: status.alertLevel,
                            percentage: status.percentage,
                        },
                    });

                    // Record that we sent this alert
                    await recordAlert(
                        status.budgetId,
                        status.categoryId,
                        status.alertLevel
                    );
                }
            }
        },
        [
            user,
            loading,
            budgetStatuses,
            hasAlertBeenSent,
            addNotification,
            recordAlert,
        ]
    );

    // Get budgets that need attention (at warning or exceeded level)
    const alertingBudgets = useMemo(() => {
        return budgetStatuses.filter((status) => status.alertLevel !== null);
    }, [budgetStatuses]);

    return {
        budgetStatuses,
        alertingBudgets,
        loading,
        checkAndSendAlerts,
        hasAlertBeenSent,
        sentAlerts,
        WARNING_THRESHOLD: WARNING_THRESHOLD * 100,
        EXCEEDED_THRESHOLD: EXCEEDED_THRESHOLD * 100,
    };
}

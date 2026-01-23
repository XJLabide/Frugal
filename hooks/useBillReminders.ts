import { useState, useEffect, useMemo, useCallback } from "react";
import {
    collection,
    query,
    onSnapshot,
    addDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/store/useAuthStore";
import { RecurringTransaction } from "@/types";
import { useUserSettings } from "./useUserSettings";
import { useNotifications } from "./useNotifications";
import { differenceInDays, parseISO, format, startOfDay } from "date-fns";

export interface BillReminder {
    id: string;
    userId: string;
    recurringTransactionId: string;
    daysBeforeDue: number; // Which reminder day this was (e.g., 1, 3, 7)
    dueDate: string; // The due date this reminder is for (YYYY-MM-DD)
    createdAt: number;
}

export interface UpcomingBill {
    recurringTransaction: RecurringTransaction;
    daysUntilDue: number;
    dueDate: string;
    reminderStatus: "reminded" | "pending" | "not_due";
}

export function useBillReminders() {
    const { user } = useAuthStore();
    const { settings } = useUserSettings();
    const { addNotification } = useNotifications();
    const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([]);
    const [sentReminders, setSentReminders] = useState<BillReminder[]>([]);
    const [loading, setLoading] = useState(true);

    const today = useMemo(() => format(startOfDay(new Date()), "yyyy-MM-dd"), []);
    const billReminderDays = useMemo(
        () => settings.billReminderDays || [1, 3, 7],
        [settings.billReminderDays]
    );

    // Subscribe to recurring transactions
    useEffect(() => {
        if (!user) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setRecurringTransactions([]);
            return;
        }

        const q = query(collection(db, "users", user.uid, "recurring_transactions"));

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const data = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as RecurringTransaction[];
                // Only consider active recurring transactions (bills)
                setRecurringTransactions(data.filter((rt) => rt.isActive));
            },
            (error) => {
                console.error("Error fetching recurring transactions for reminders:", error);
            }
        );

        return () => unsubscribe();
    }, [user]);

    // Subscribe to sent reminders
    useEffect(() => {
        if (!user) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSentReminders([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const q = query(collection(db, "users", user.uid, "bill_reminders"));

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const data = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as BillReminder[];
                setSentReminders(data);
                setLoading(false);
            },
            (error) => {
                console.error("Error fetching bill reminders:", error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [user]);

    // Check if a specific reminder has already been sent
    const hasReminderBeenSent = useCallback(
        (recurringTransactionId: string, dueDate: string, daysBeforeDue: number): boolean => {
            return sentReminders.some(
                (reminder) =>
                    reminder.recurringTransactionId === recurringTransactionId &&
                    reminder.dueDate === dueDate &&
                    reminder.daysBeforeDue === daysBeforeDue
            );
        },
        [sentReminders]
    );

    // Record that a reminder was sent
    const recordReminder = useCallback(
        async (recurringTransactionId: string, dueDate: string, daysBeforeDue: number) => {
            if (!user) return;

            await addDoc(collection(db, "users", user.uid, "bill_reminders"), {
                userId: user.uid,
                recurringTransactionId,
                dueDate,
                daysBeforeDue,
                createdAt: Date.now(),
            });
        },
        [user]
    );

    // Calculate upcoming bills with their reminder status
    const upcomingBills = useMemo((): UpcomingBill[] => {
        const maxReminderDay = Math.max(...billReminderDays);
        const todayDate = parseISO(today);

        return recurringTransactions
            .map((rt) => {
                const dueDate = parseISO(rt.nextDueDate);
                const daysUntilDue = differenceInDays(dueDate, todayDate);

                // Determine reminder status
                let reminderStatus: "reminded" | "pending" | "not_due" = "not_due";

                if (daysUntilDue <= maxReminderDay && daysUntilDue >= 0) {
                    // Check if any reminder has been sent for this due date
                    const hasBeenReminded = billReminderDays.some((days) =>
                        hasReminderBeenSent(rt.id, rt.nextDueDate, days)
                    );
                    reminderStatus = hasBeenReminded ? "reminded" : "pending";
                }

                return {
                    recurringTransaction: rt,
                    daysUntilDue,
                    dueDate: rt.nextDueDate,
                    reminderStatus,
                };
            })
            .filter((bill) => bill.daysUntilDue >= 0 && bill.daysUntilDue <= maxReminderDay)
            .sort((a, b) => a.daysUntilDue - b.daysUntilDue);
    }, [recurringTransactions, today, billReminderDays, hasReminderBeenSent]);

    // Check and send reminders for upcoming bills
    const checkAndSendReminders = useCallback(async () => {
        if (!user || loading) return;

        const todayDate = parseISO(today);

        for (const rt of recurringTransactions) {
            if (!rt.isActive) continue;

            const dueDate = parseISO(rt.nextDueDate);
            const daysUntilDue = differenceInDays(dueDate, todayDate);

            // Check each reminder day threshold
            for (const reminderDay of billReminderDays) {
                // Only send reminder if we're at or past the reminder threshold but bill hasn't passed
                if (daysUntilDue === reminderDay) {
                    // Check if this specific reminder has already been sent
                    if (!hasReminderBeenSent(rt.id, rt.nextDueDate, reminderDay)) {
                        const daysText =
                            reminderDay === 0
                                ? "today"
                                : reminderDay === 1
                                ? "tomorrow"
                                : `in ${reminderDay} days`;

                        // Create notification
                        await addNotification({
                            type: "bill_reminder",
                            title: `Bill Due: ${rt.name}`,
                            message: `Your "${rt.name}" payment of ${rt.amount} is due ${daysText}.`,
                            data: {
                                recurringTransactionId: rt.id,
                                dueDate: rt.nextDueDate,
                                amount: rt.amount,
                                daysUntilDue: reminderDay,
                            },
                        });

                        // Record that we sent this reminder
                        await recordReminder(rt.id, rt.nextDueDate, reminderDay);
                    }
                }
            }
        }
    }, [
        user,
        loading,
        today,
        recurringTransactions,
        billReminderDays,
        hasReminderBeenSent,
        addNotification,
        recordReminder,
    ]);

    // Bills that need immediate attention (due within reminder window and not yet reminded)
    const pendingReminders = useMemo(() => {
        return upcomingBills.filter((bill) => bill.reminderStatus === "pending");
    }, [upcomingBills]);

    return {
        upcomingBills,
        pendingReminders,
        loading,
        checkAndSendReminders,
        hasReminderBeenSent,
        sentReminders,
        billReminderDays,
    };
}

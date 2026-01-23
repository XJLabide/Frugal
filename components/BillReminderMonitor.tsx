"use client";

import * as React from "react";
import { useBillReminders } from "@/hooks/useBillReminders";
import { useToast } from "@/components/NotificationProvider";

/**
 * BillReminderMonitor runs on dashboard load to check for upcoming bills.
 * When a bill is due soon (within the reminder window), it:
 * 1. Creates a notification (via useBillReminders.checkAndSendReminders)
 * 2. Shows a toast to immediately alert the user
 */
export function BillReminderMonitor() {
    const { upcomingBills, loading, checkAndSendReminders } = useBillReminders();
    const { warning, info } = useToast();
    const checkedRef = React.useRef(false);
    const prevUpcomingBillsRef = React.useRef<string[]>([]);

    // Initial check on mount - run once when data is loaded
    React.useEffect(() => {
        if (loading || checkedRef.current) return;

        checkedRef.current = true;

        // Check and send reminders (this creates notifications in Firestore)
        checkAndSendReminders();
    }, [loading, checkAndSendReminders]);

    // Show toasts when new urgent bills appear (due within 3 days)
    React.useEffect(() => {
        if (loading) return;

        const urgentBills = upcomingBills.filter((bill) => bill.daysUntilDue <= 3);
        const currentBillIds = urgentBills.map(
            (b) => `${b.recurringTransaction.id}-${b.dueDate}`
        );
        const prevBillIds = prevUpcomingBillsRef.current;

        // Find new urgent bills that weren't in the previous state
        const newUrgentBills = urgentBills.filter(
            (bill) =>
                !prevBillIds.includes(`${bill.recurringTransaction.id}-${bill.dueDate}`)
        );

        // Show toast for each new urgent bill
        newUrgentBills.forEach((bill) => {
            const daysText =
                bill.daysUntilDue === 0
                    ? "today"
                    : bill.daysUntilDue === 1
                    ? "tomorrow"
                    : `in ${bill.daysUntilDue} days`;

            if (bill.daysUntilDue <= 1) {
                warning({
                    title: `Bill Due: ${bill.recurringTransaction.name}`,
                    message: `Payment of ${bill.recurringTransaction.amount} due ${daysText}.`,
                    duration: 6000,
                });
            } else {
                info({
                    title: `Upcoming Bill: ${bill.recurringTransaction.name}`,
                    message: `Payment due ${daysText}.`,
                    duration: 5000,
                });
            }
        });

        // Update ref for next comparison
        prevUpcomingBillsRef.current = currentBillIds;
    }, [upcomingBills, loading, warning, info]);

    // This component doesn't render anything visible
    return null;
}

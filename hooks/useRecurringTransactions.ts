import { useState, useEffect, useCallback } from "react";
import {
    collection,
    query,
    onSnapshot,
    addDoc,
    deleteDoc,
    doc,
    updateDoc,
    where,
    getDocs,
    setDoc
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/store/useAuthStore";
import { RecurringTransaction, Transaction } from "@/types";
import { addMonths, addWeeks, addDays, addYears, parseISO, format, isAfter, isBefore } from "date-fns";

export function useRecurringTransactions() {
    const { user } = useAuthStore();
    const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([]);
    const [loading, setLoading] = useState(true);

    const calculateNextDueDate = (currentDate: string, frequency: string): string => {
        const date = parseISO(currentDate);
        let nextDate;

        switch (frequency) {
            case 'daily': nextDate = addDays(date, 1); break;
            case 'weekly': nextDate = addWeeks(date, 1); break;
            case 'monthly': nextDate = addMonths(date, 1); break;
            case 'yearly': nextDate = addYears(date, 1); break;
            default: nextDate = addMonths(date, 1);
        }

        return format(nextDate, 'yyyy-MM-dd');
    };

    const processDueTransactions = useCallback(async (transactions: RecurringTransaction[], userId: string) => {
        const today = format(new Date(), 'yyyy-MM-dd');

        for (const rt of transactions) {
            if (!rt.isActive || isAfter(parseISO(rt.nextDueDate), parseISO(today))) {
                continue;
            }

            // Transaction is due!
            try {
                // 1. Create the transaction with a deterministic ID to prevent duplicates
                // ID format: recurring_{recurringTransactionId}_{dueDate}
                const transactionId = `recurring_${rt.id}_${rt.nextDueDate}`;

                await setDoc(doc(db, "users", userId, "transactions", transactionId), {
                    userId: userId,
                    amount: rt.amount,
                    categoryId: rt.categoryId,
                    accountId: rt.accountId ?? null,
                    date: rt.nextDueDate,
                    note: `Recurring: ${rt.name}` + (rt.note ? ` - ${rt.note}` : ''),
                    location: rt.location || 'Recurring',
                    type: rt.type,
                    subCategory: rt.subCategory ?? null,
                    createdAt: Date.now(),
                } as Transaction);

                // 2. Update the next due date
                const nextDate = calculateNextDueDate(rt.nextDueDate, rt.frequency);
                await updateDoc(doc(db, "users", userId, "recurring_transactions", rt.id), {
                    nextDueDate: nextDate,
                });

                console.log(`Processed recurring transaction: ${rt.name}`);
            } catch (error) {
                console.error("Error processing recurring transaction:", error);
            }
        }
    }, []);

    useEffect(() => {
        if (!user) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setRecurringTransactions([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const q = query(
            collection(db, "users", user.uid, "recurring_transactions")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as RecurringTransaction[];

            setRecurringTransactions(data);
            setLoading(false);

            // Check for processing after data is loaded
            processDueTransactions(data, user.uid);
        });

        return () => unsubscribe();
    }, [user, processDueTransactions]);

    const addRecurringTransaction = async (data: Omit<RecurringTransaction, "id" | "userId" | "nextDueDate" | "createdAt">) => {
        if (!user) return;

        // Initial nextDueDate is the startDate
        const nextDueDate = data.startDate;

        // Clean undefined values
        const sanitizedData = Object.entries(data).reduce((acc, [key, value]) => {
            if (value !== undefined) {
                acc[key] = value;
            }
            return acc;
        }, {} as any);

        await addDoc(collection(db, "users", user.uid, "recurring_transactions"), {
            ...sanitizedData,
            userId: user.uid,
            nextDueDate,
            createdAt: Date.now(),
        });
    };

    const updateRecurringTransaction = async (id: string, data: Partial<RecurringTransaction>) => {
        if (!user) return;

        // Clean undefined values
        const sanitizedData = Object.entries(data).reduce((acc, [key, value]) => {
            if (value !== undefined) {
                acc[key] = value;
            }
            return acc;
        }, {} as any);

        await updateDoc(doc(db, "users", user.uid, "recurring_transactions", id), sanitizedData);
    };

    const deleteRecurringTransaction = async (id: string) => {
        if (!user) return;
        await deleteDoc(doc(db, "users", user.uid, "recurring_transactions", id));
    };

    return {
        recurringTransactions,
        loading,
        addRecurringTransaction,
        updateRecurringTransaction,
        deleteRecurringTransaction
    };
}

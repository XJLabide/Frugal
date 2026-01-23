import { useState, useEffect } from "react";
import {
    collection,
    query,
    onSnapshot,
    addDoc,
    deleteDoc,
    doc,
    orderBy,
    writeBatch
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/store/useAuthStore";
import { Transfer } from "@/types";

export function useTransfers() {
    const { user } = useAuthStore();
    const [transfers, setTransfers] = useState<Transfer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) {
            setTransfers([]);
            setLoading(false);
            return;
        }

        setLoading(true);

        const q = query(
            collection(db, "users", user.uid, "transfers"),
            orderBy("date", "desc")
        );

        const unsubscribe = onSnapshot(q,
            (snapshot) => {
                const data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Transfer[];
                setTransfers(data);
                setLoading(false);
            },
            (err) => {
                console.error("Error fetching transfers:", err);
                setError("Failed to fetch transfers");
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [user]);

    /**
     * Creates a transfer between two accounts.
     * This creates:
     * 1. A transfer record in users/{uid}/transfers
     * 2. An expense transaction from the source account
     * 3. An income transaction to the destination account
     */
    const addTransfer = async (transfer: Omit<Transfer, "id" | "userId" | "createdAt" | "fromTransactionId" | "toTransactionId">) => {
        if (!user) return;

        try {
            const batch = writeBatch(db);
            const timestamp = Date.now();

            // Create expense transaction (from source account)
            const fromTransactionRef = doc(collection(db, "users", user.uid, "transactions"));
            batch.set(fromTransactionRef, {
                userId: user.uid,
                amount: transfer.amount,
                categoryId: "Transfer Out",
                date: transfer.date,
                note: transfer.note ? `Transfer: ${transfer.note}` : "Transfer to another account",
                type: "expense",
                accountId: transfer.fromAccountId,
                createdAt: timestamp,
            });

            // Create income transaction (to destination account)
            const toTransactionRef = doc(collection(db, "users", user.uid, "transactions"));
            batch.set(toTransactionRef, {
                userId: user.uid,
                amount: transfer.amount,
                categoryId: "Transfer In",
                date: transfer.date,
                note: transfer.note ? `Transfer: ${transfer.note}` : "Transfer from another account",
                type: "income",
                accountId: transfer.toAccountId,
                createdAt: timestamp,
            });

            // Create transfer record
            const transferRef = doc(collection(db, "users", user.uid, "transfers"));
            batch.set(transferRef, {
                ...transfer,
                userId: user.uid,
                createdAt: timestamp,
                fromTransactionId: fromTransactionRef.id,
                toTransactionId: toTransactionRef.id,
            });

            await batch.commit();
        } catch (err: unknown) {
            console.error("Error adding transfer:", err);
            throw err;
        }
    };

    /**
     * Deletes a transfer and its associated transactions.
     * Note: This should be used carefully as it will also delete the transaction entries.
     */
    const deleteTransfer = async (transferId: string) => {
        if (!user) return;

        try {
            const transfer = transfers.find(t => t.id === transferId);
            if (!transfer) {
                throw new Error("Transfer not found");
            }

            const batch = writeBatch(db);

            // Delete the associated transactions if they exist
            if (transfer.fromTransactionId) {
                batch.delete(doc(db, "users", user.uid, "transactions", transfer.fromTransactionId));
            }
            if (transfer.toTransactionId) {
                batch.delete(doc(db, "users", user.uid, "transactions", transfer.toTransactionId));
            }

            // Delete the transfer record
            batch.delete(doc(db, "users", user.uid, "transfers", transferId));

            await batch.commit();
        } catch (err: unknown) {
            console.error("Error deleting transfer:", err);
            throw err;
        }
    };

    return {
        transfers,
        loading,
        error,
        addTransfer,
        deleteTransfer
    };
}

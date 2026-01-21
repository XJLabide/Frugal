import { useState, useEffect } from "react";
import {
    collection,
    query,
    where,
    onSnapshot,
    addDoc,
    deleteDoc,
    doc,
    updateDoc,
    orderBy,
    getDocs,
    writeBatch
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/store/useAuthStore";
import { Transaction } from "@/types";

export function useTransactions() {
    const { user } = useAuthStore();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) {
            setTransactions([]);
            setLoading(false);
            return;
        }

        setLoading(true);

        // Use single orderBy to avoid needing a composite index
        const q = query(
            collection(db, "users", user.uid, "transactions"),
            orderBy("date", "desc")
        );

        const unsubscribe = onSnapshot(q,
            (snapshot) => {
                const data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Transaction[];
                setTransactions(data);
                setLoading(false);
            },
            (err) => {
                console.error("Error fetching transactions:", err);
                setError("Failed to fetch transactions");
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [user]);

    const addTransaction = async (transaction: Omit<Transaction, "id" | "userId" | "createdAt">) => {
        if (!user) return;
        try {
            // Clean undefined values
            const sanitizedData = Object.entries(transaction).reduce((acc, [key, value]) => {
                if (value !== undefined) {
                    acc[key] = value;
                }
                return acc;
            }, {} as any);

            await addDoc(collection(db, "users", user.uid, "transactions"), {
                ...sanitizedData,
                userId: user.uid,
                createdAt: Date.now(),
            });
        } catch (err: any) {
            console.error("Error adding transaction:", err);
            throw err;
        }
    };

    const deleteTransaction = async (id: string) => {
        if (!user) return;
        try {
            await deleteDoc(doc(db, "users", user.uid, "transactions", id));
        } catch (err: any) {
            console.error("Error deleting transaction:", err);
            throw err;
        }
    };

    const updateTransaction = async (id: string, data: Partial<Transaction>) => {
        if (!user) return;
        try {
            // Clean undefined values
            const sanitizedData = Object.entries(data).reduce((acc, [key, value]) => {
                if (value !== undefined) {
                    acc[key] = value;
                }
                return acc;
            }, {} as any);

            await updateDoc(doc(db, "users", user.uid, "transactions", id), sanitizedData);
        } catch (err: any) {
            console.error("Error updating transaction:", err);
            throw err;
        }
    };

    const renameSubcategory = async (categoryId: string, oldName: string, newName: string) => {
        if (!user) return;
        try {
            // Find all transactions with this category and subcategory
            const q = query(
                collection(db, "users", user.uid, "transactions"),
                where("categoryId", "==", categoryId),
                where("subCategory", "==", oldName)
            );

            const snapshot = await getDocs(q);
            const batch = writeBatch(db);

            snapshot.docs.forEach(doc => {
                batch.update(doc.ref, { subCategory: newName });
            });

            await batch.commit();
        } catch (err: any) {
            console.error("Error renaming subcategory:", err);
            throw err;
        }
    };

    return { transactions, loading, error, addTransaction, deleteTransaction, updateTransaction, renameSubcategory };
}

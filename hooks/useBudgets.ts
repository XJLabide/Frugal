import { useState, useEffect, useMemo } from "react";
import {
    collection,
    query,
    onSnapshot,
    addDoc,
    deleteDoc,
    doc,
    updateDoc
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/store/useAuthStore";
import { Budget } from "@/types";

export function useBudgets() {
    const { user } = useAuthStore();
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!user) {
            setBudgets([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const q = query(
            collection(db, "users", user.uid, "budgets")
        );

        const unsubscribe = onSnapshot(q,
            (snapshot) => {
                const data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Budget[];
                setBudgets(data);
                setLoading(false);
            },
            (err) => {
                console.error("Error fetching budgets:", err);
                setError(err);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [user]);

    // Computed values for recurring budgets
    const budgetAnalysis = useMemo(() => {
        // Filter only recurring budgets (or legacy month-specific ones)
        const recurringBudgets = budgets.filter(b => b.month === 'recurring' || !b.month);

        // Overall budget (categoryId = 'all')
        const overallBudget = recurringBudgets.find(b => b.categoryId === 'all');
        const overallAmount = overallBudget?.amount || 0;

        // Category budgets (excluding 'all')
        const categoryBudgets = recurringBudgets.filter(b => b.categoryId !== 'all');
        const totalAllocated = categoryBudgets.reduce((sum, b) => sum + b.amount, 0);

        // Remaining to allocate
        const remainingToAllocate = overallAmount - totalAllocated;
        const isOverAllocated = totalAllocated > overallAmount && overallAmount > 0;

        return {
            overallBudget,
            overallAmount,
            categoryBudgets,
            totalAllocated,
            remainingToAllocate,
            isOverAllocated,
            allBudgets: recurringBudgets
        };
    }, [budgets]);

    const addBudget = async (budget: Omit<Budget, "id" | "userId">) => {
        if (!user) return;
        try {
            setError(null);
            await addDoc(collection(db, "users", user.uid, "budgets"), {
                ...budget,
                userId: user.uid,
            });
        } catch (err) {
            const error = err instanceof Error ? err : new Error("Failed to add budget");
            console.error("Error adding budget:", error);
            setError(error);
            throw error;
        }
    };

    const updateBudget = async (id: string, amount: number) => {
        if (!user) return;
        try {
            setError(null);
            await updateDoc(doc(db, "users", user.uid, "budgets", id), { amount });
        } catch (err) {
            const error = err instanceof Error ? err : new Error("Failed to update budget");
            console.error("Error updating budget:", error);
            setError(error);
            throw error;
        }
    };

    const deleteBudget = async (id: string) => {
        if (!user) return;
        try {
            setError(null);
            await deleteDoc(doc(db, "users", user.uid, "budgets", id));
        } catch (err) {
            const error = err instanceof Error ? err : new Error("Failed to delete budget");
            console.error("Error deleting budget:", error);
            setError(error);
            throw error;
        }
    };

    return {
        budgets,
        loading,
        error,
        addBudget,
        updateBudget,
        deleteBudget,
        ...budgetAnalysis
    };
}

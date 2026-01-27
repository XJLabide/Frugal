import { useState, useEffect } from "react";
import {
    collection,
    query,
    onSnapshot,
    addDoc,
    deleteDoc,
    doc,
    updateDoc,
    increment,
    writeBatch
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/store/useAuthStore";
import { Goal, Transaction } from "@/types";

export function useGoals() {
    const { user } = useAuthStore();
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setGoals([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const q = query(
            collection(db, "users", user.uid, "goals")
        );

        const unsubscribe = onSnapshot(q,
            (snapshot) => {
                const data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Goal[];
                // Sort by creation date, newest first
                data.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
                setGoals(data);
                setLoading(false);
            },
            (error) => {
                console.error("Error fetching goals:", error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [user]);

    const addGoal = async (goal: Omit<Goal, "id" | "userId" | "createdAt">) => {
        if (!user) return;
        await addDoc(collection(db, "users", user.uid, "goals"), {
            ...goal,
            userId: user.uid,
            createdAt: Date.now(),
        });
    };

    const updateGoal = async (id: string, data: Partial<Goal>) => {
        if (!user) return;
        await updateDoc(doc(db, "users", user.uid, "goals", id), data);
    };

    const addToGoal = async (id: string, amount: number) => {
        if (!user) return;
        await updateDoc(doc(db, "users", user.uid, "goals", id), {
            currentAmount: increment(amount)
        });
    };

    // Atomic goal funding: creates expense transaction AND updates goal in a single batch
    const fundGoal = async (
        goalId: string,
        amount: number,
        goalName: string,
        location?: string | null
    ) => {
        if (!user) return;

        const batch = writeBatch(db);
        const today = new Date().toISOString().split("T")[0];

        // 1. Create expense transaction
        const transactionRef = doc(collection(db, "users", user.uid, "transactions"));
        batch.set(transactionRef, {
            userId: user.uid,
            amount,
            categoryId: "Goal Funding",
            date: today,
            note: `Funded goal: ${goalName}`,
            location: location || "Savings",
            type: "expense",
            createdAt: Date.now(),
        } as Transaction);

        // 2. Update goal amount atomically
        const goalRef = doc(db, "users", user.uid, "goals", goalId);
        batch.update(goalRef, {
            currentAmount: increment(amount)
        });

        // Commit both operations atomically
        await batch.commit();
    };

    const deleteGoal = async (id: string) => {
        if (!user) return;
        await deleteDoc(doc(db, "users", user.uid, "goals", id));
    };

    // Calculate totals
    const totalTargetAmount = goals.reduce((sum, g) => sum + g.targetAmount, 0);
    const totalSavedAmount = goals.reduce((sum, g) => sum + g.currentAmount, 0);
    const overallProgress = totalTargetAmount > 0 ? (totalSavedAmount / totalTargetAmount) * 100 : 0;

    return {
        goals,
        loading,
        addGoal,
        updateGoal,
        addToGoal,
        fundGoal,
        deleteGoal,
        totalTargetAmount,
        totalSavedAmount,
        overallProgress
    };
}

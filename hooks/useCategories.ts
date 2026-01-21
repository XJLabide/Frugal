import { useState, useEffect } from "react";
import {
    collection,
    query,
    onSnapshot,
    addDoc,
    deleteDoc,
    doc,
    updateDoc,
    orderBy,
    writeBatch
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/store/useAuthStore";
import { Category } from "@/types";

const DEFAULT_CATEGORIES = [
    { name: "Food", type: "expense", color: "#ef4444", icon: "Utensils" },
    { name: "Transport", type: "expense", color: "#3b82f6", icon: "Car" },
    { name: "Rent", type: "expense", color: "#f59e0b", icon: "Home" },
    { name: "Utilities", type: "expense", color: "#10b981", icon: "Zap" },
    { name: "Entertainment", type: "expense", color: "#8b5cf6", icon: "Film" },
    { name: "Savings", type: "expense", color: "#6366f1", icon: "PiggyBank" },
    { name: "Salary", type: "income", color: "#22c55e", icon: "Banknote" },
    { name: "Freelance", type: "income", color: "#14b8a6", icon: "Laptop" },
];

export function useCategories() {
    const { user } = useAuthStore();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setCategories([]);
            setLoading(false);
            return;
        }

        setLoading(true);

        // Simple query without orderBy to avoid index requirements
        const q = query(
            collection(db, "users", user.uid, "categories")
        );

        const unsubscribe = onSnapshot(q,
            (snapshot) => {
                const data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Category[];

                // Sort client-side by name
                data.sort((a, b) => a.name.localeCompare(b.name));

                setCategories(data);
                setLoading(false);
            },
            (error) => {
                console.error("Error fetching categories:", error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [user]);

    const addCategory = async (category: Omit<Category, "id" | "userId">) => {
        if (!user) return;
        await addDoc(collection(db, "users", user.uid, "categories"), {
            ...category,
            userId: user.uid,
        });
    };

    const deleteCategory = async (id: string) => {
        if (!user) return;
        await deleteDoc(doc(db, "users", user.uid, "categories", id));
    };

    const updateCategory = async (id: string, updates: Partial<Category>) => {
        if (!user) return;
        await updateDoc(doc(db, "users", user.uid, "categories", id), updates);
    };

    const seedDefaults = async () => {
        if (!user) return;
        const batch = writeBatch(db);
        DEFAULT_CATEGORIES.forEach(cat => {
            const docRef = doc(collection(db, "users", user.uid, "categories"));
            batch.set(docRef, { ...cat, userId: user.uid });
        });
        await batch.commit();
    };

    return {
        categories: categories.length > 0 ? categories : [],
        loading,
        addCategory,
        updateCategory,
        deleteCategory,
        seedDefaults,
        hasCategories: categories.length > 0
    };
}

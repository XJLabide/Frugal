import { useState, useEffect } from "react";
import {
    collection,
    query,
    onSnapshot,
    addDoc,
    deleteDoc,
    doc,
    updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/store/useAuthStore";
import { Tag } from "@/types";

export function useTags() {
    const { user } = useAuthStore();
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setTags([]);
            setLoading(false);
            return;
        }

        setLoading(true);

        const q = query(
            collection(db, "users", user.uid, "tags")
        );

        const unsubscribe = onSnapshot(q,
            (snapshot) => {
                const data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Tag[];

                // Sort client-side by name
                data.sort((a, b) => a.name.localeCompare(b.name));

                setTags(data);
                setLoading(false);
            },
            (error) => {
                console.error("Error fetching tags:", error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [user]);

    const addTag = async (tag: Omit<Tag, "id" | "userId" | "createdAt">) => {
        if (!user) return;
        await addDoc(collection(db, "users", user.uid, "tags"), {
            ...tag,
            userId: user.uid,
            createdAt: Date.now(),
        });
    };

    const deleteTag = async (id: string) => {
        if (!user) return;
        await deleteDoc(doc(db, "users", user.uid, "tags", id));
    };

    const updateTag = async (id: string, updates: Partial<Omit<Tag, "id" | "userId">>) => {
        if (!user) return;
        await updateDoc(doc(db, "users", user.uid, "tags", id), updates);
    };

    return {
        tags,
        loading,
        addTag,
        updateTag,
        deleteTag,
    };
}

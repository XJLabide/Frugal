import { useState, useEffect, useMemo } from "react";
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    addDoc,
    deleteDoc,
    doc,
    updateDoc,
    writeBatch,
    getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/store/useAuthStore";
import { Notification, NotificationType } from "@/types";

export function useNotifications() {
    const { user } = useAuthStore();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setNotifications([]);
            setLoading(false);
            return;
        }

        setLoading(true);

        const q = query(
            collection(db, "users", user.uid, "notifications"),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q,
            (snapshot) => {
                const data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Notification[];

                setNotifications(data);
                setLoading(false);
            },
            (error) => {
                console.error("Error fetching notifications:", error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [user]);

    // Computed: count of unread notifications
    const unreadCount = useMemo(() => {
        return notifications.filter(n => !n.read).length;
    }, [notifications]);

    const addNotification = async (
        notification: Omit<Notification, "id" | "userId" | "read" | "createdAt">
    ) => {
        if (!user) return;
        await addDoc(collection(db, "users", user.uid, "notifications"), {
            ...notification,
            userId: user.uid,
            read: false,
            createdAt: Date.now(),
        });
    };

    const markAsRead = async (id: string) => {
        if (!user) return;
        await updateDoc(doc(db, "users", user.uid, "notifications", id), {
            read: true,
        });
    };

    const markAllAsRead = async () => {
        if (!user) return;

        const unreadNotifications = notifications.filter(n => !n.read);
        if (unreadNotifications.length === 0) return;

        const batch = writeBatch(db);
        unreadNotifications.forEach(notification => {
            const notificationRef = doc(db, "users", user.uid, "notifications", notification.id);
            batch.update(notificationRef, { read: true });
        });

        await batch.commit();
    };

    const deleteNotification = async (id: string) => {
        if (!user) return;
        await deleteDoc(doc(db, "users", user.uid, "notifications", id));
    };

    return {
        notifications,
        loading,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
    };
}

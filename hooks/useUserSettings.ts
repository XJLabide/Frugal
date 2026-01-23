import { useState, useEffect } from "react";
import {
    doc,
    onSnapshot,
    setDoc,
    updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/store/useAuthStore";
import { UserSettings } from "@/types";

const DEFAULT_SETTINGS: UserSettings = {
    currency: "PHP",
    billReminderDays: [1, 3, 7], // Default reminder days before bill due date
};

export function useUserSettings() {
    const { user } = useAuthStore();
    const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setSettings(DEFAULT_SETTINGS);
            setLoading(false);
            return;
        }

        setLoading(true);

        // Listen to the user document at users/{uid}
        const userDocRef = doc(db, "users", user.uid);

        const unsubscribe = onSnapshot(userDocRef,
            (snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.data();
                    // Merge with defaults to ensure all fields exist
                    setSettings({
                        currency: data.currency || DEFAULT_SETTINGS.currency,
                        billReminderDays: data.billReminderDays || DEFAULT_SETTINGS.billReminderDays,
                    });
                } else {
                    // Document doesn't exist, use defaults
                    setSettings(DEFAULT_SETTINGS);
                }
                setLoading(false);
            },
            (error) => {
                console.error("Error fetching user settings:", error);
                setSettings(DEFAULT_SETTINGS);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [user]);

    const updateSettings = async (updates: Partial<UserSettings>) => {
        if (!user) return;

        const userDocRef = doc(db, "users", user.uid);

        try {
            // Use setDoc with merge to create the document if it doesn't exist
            await setDoc(userDocRef, updates, { merge: true });
        } catch (error) {
            console.error("Error updating user settings:", error);
            throw error;
        }
    };

    const setCurrency = async (currency: string) => {
        await updateSettings({ currency });
    };

    const setBillReminderDays = async (days: number[]) => {
        await updateSettings({ billReminderDays: days });
    };

    return {
        settings,
        loading,
        updateSettings,
        setCurrency,
        setBillReminderDays,
    };
}

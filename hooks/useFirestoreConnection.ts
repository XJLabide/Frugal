"use client";

import { useState, useEffect, useCallback } from "react";
import { onSnapshotsInSync } from "firebase/firestore";
import { db } from "@/lib/firebase";

export type ConnectionState = "connected" | "connecting" | "offline";

interface UseFirestoreConnectionReturn {
    /** Browser's online/offline status */
    isOnline: boolean;
    /** Whether Firestore has successfully synced */
    isFirestoreConnected: boolean;
    /** Combined connection state */
    connectionState: ConnectionState;
    /** Whether the connection was just restored (for showing "back online" message) */
    justReconnected: boolean;
    /** Clear the justReconnected flag */
    clearReconnectedFlag: () => void;
}

export function useFirestoreConnection(): UseFirestoreConnectionReturn {
    const [isOnline, setIsOnline] = useState(true);
    const [isFirestoreConnected, setIsFirestoreConnected] = useState(true);
    const [justReconnected, setJustReconnected] = useState(false);
    const [wasOffline, setWasOffline] = useState(false);

    // Track browser online/offline status
    useEffect(() => {
        // Set initial state
        setIsOnline(typeof navigator !== "undefined" ? navigator.onLine : true);

        const handleOnline = () => {
            setIsOnline(true);
        };

        const handleOffline = () => {
            setIsOnline(false);
            setWasOffline(true);
        };

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    // Track Firestore sync status
    useEffect(() => {
        // onSnapshotsInSync fires when all pending writes have been acknowledged
        // and all local data is in sync with the server
        const unsubscribe = onSnapshotsInSync(db, () => {
            const wasDisconnected = !isFirestoreConnected;
            setIsFirestoreConnected(true);

            // If we were offline and just reconnected, set the flag
            if (wasDisconnected && wasOffline) {
                setJustReconnected(true);
                setWasOffline(false);
            }
        });

        return () => unsubscribe();
    }, [isFirestoreConnected, wasOffline]);

    // When browser goes offline, mark Firestore as disconnected
    useEffect(() => {
        if (!isOnline) {
            setIsFirestoreConnected(false);
        }
    }, [isOnline]);

    // Determine overall connection state
    const connectionState: ConnectionState = !isOnline
        ? "offline"
        : isFirestoreConnected
            ? "connected"
            : "connecting";

    const clearReconnectedFlag = useCallback(() => {
        setJustReconnected(false);
    }, []);

    return {
        isOnline,
        isFirestoreConnected,
        connectionState,
        justReconnected,
        clearReconnectedFlag,
    };
}

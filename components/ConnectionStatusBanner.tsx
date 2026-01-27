"use client";

import { useEffect, useState } from "react";
import { WifiOff, Wifi, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFirestoreConnection } from "@/hooks/useFirestoreConnection";
import { useToast } from "@/components/NotificationProvider";

export function ConnectionStatusBanner() {
    const { connectionState, justReconnected, clearReconnectedFlag } = useFirestoreConnection();
    const { success } = useToast();
    const [isVisible, setIsVisible] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    // Show banner when offline, hide when connected
    useEffect(() => {
        if (connectionState === "offline") {
            setIsVisible(true);
            setIsDismissed(false);
        } else if (connectionState === "connected") {
            // Small delay before hiding for smoother UX
            const timer = setTimeout(() => {
                setIsVisible(false);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [connectionState]);

    // Show toast when reconnected
    useEffect(() => {
        if (justReconnected) {
            success({
                title: "Back online",
                message: "Your connection has been restored.",
                duration: 3000,
            });
            clearReconnectedFlag();
        }
    }, [justReconnected, success, clearReconnectedFlag]);

    // Don't render if not visible or dismissed
    if (!isVisible || isDismissed) {
        return null;
    }

    const isOffline = connectionState === "offline";
    const isConnecting = connectionState === "connecting";

    return (
        <div
            className={cn(
                "w-full transition-all duration-300 ease-in-out",
                isOffline || isConnecting
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 -translate-y-full"
            )}
        >
            <div
                className={cn(
                    "flex items-center justify-between gap-3 px-4 py-2.5 text-sm",
                    isOffline
                        ? "bg-amber-50 border-b border-amber-200 dark:bg-amber-950/50 dark:border-amber-800"
                        : "bg-indigo-50 border-b border-indigo-200 dark:bg-indigo-950/50 dark:border-indigo-800"
                )}
            >
                <div className="flex items-center gap-2.5">
                    {isOffline ? (
                        <WifiOff className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                    ) : (
                        <Wifi className="h-4 w-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0 animate-pulse" />
                    )}
                    <span
                        className={cn(
                            "font-medium",
                            isOffline
                                ? "text-amber-800 dark:text-amber-200"
                                : "text-indigo-800 dark:text-indigo-200"
                        )}
                    >
                        {isOffline
                            ? "You're offline"
                            : "Reconnecting..."}
                    </span>
                    <span
                        className={cn(
                            "hidden sm:inline",
                            isOffline
                                ? "text-amber-700 dark:text-amber-300"
                                : "text-indigo-700 dark:text-indigo-300"
                        )}
                    >
                        {isOffline
                            ? "Changes will sync when you reconnect."
                            : "Please wait while we restore your connection."}
                    </span>
                </div>
                <button
                    onClick={() => setIsDismissed(true)}
                    className={cn(
                        "rounded-md p-1 transition-colors flex-shrink-0",
                        isOffline
                            ? "text-amber-600 hover:text-amber-800 hover:bg-amber-200/50 dark:text-amber-400 dark:hover:text-amber-200 dark:hover:bg-amber-800/50"
                            : "text-indigo-600 hover:text-indigo-800 hover:bg-indigo-200/50 dark:text-indigo-400 dark:hover:text-indigo-200 dark:hover:bg-indigo-800/50"
                    )}
                    aria-label="Dismiss notification"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}

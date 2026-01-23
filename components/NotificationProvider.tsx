"use client";

import * as React from "react";
import { Toast, ToastContainer, ToastType } from "@/components/ui/toast";

interface ToastOptions {
    title: string;
    message?: string;
    duration?: number;
}

interface NotificationContextType {
    toasts: Toast[];
    showToast: (type: ToastType, options: ToastOptions) => void;
    dismissToast: (id: string) => void;
    success: (options: ToastOptions) => void;
    error: (options: ToastOptions) => void;
    warning: (options: ToastOptions) => void;
    info: (options: ToastOptions) => void;
}

const NotificationContext = React.createContext<NotificationContextType | undefined>(undefined);

let toastIdCounter = 0;

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = React.useState<Toast[]>([]);

    const showToast = React.useCallback((type: ToastType, options: ToastOptions) => {
        const id = `toast-${++toastIdCounter}`;
        const newToast: Toast = {
            id,
            type,
            ...options,
        };
        setToasts((prev) => [...prev, newToast]);
    }, []);

    const dismissToast = React.useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const success = React.useCallback(
        (options: ToastOptions) => showToast("success", options),
        [showToast]
    );

    const error = React.useCallback(
        (options: ToastOptions) => showToast("error", options),
        [showToast]
    );

    const warning = React.useCallback(
        (options: ToastOptions) => showToast("warning", options),
        [showToast]
    );

    const info = React.useCallback(
        (options: ToastOptions) => showToast("info", options),
        [showToast]
    );

    const value = React.useMemo(
        () => ({
            toasts,
            showToast,
            dismissToast,
            success,
            error,
            warning,
            info,
        }),
        [toasts, showToast, dismissToast, success, error, warning, info]
    );

    return (
        <NotificationContext.Provider value={value}>
            {children}
            <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        </NotificationContext.Provider>
    );
}

export function useToast() {
    const context = React.useContext(NotificationContext);
    if (context === undefined) {
        throw new Error("useToast must be used within a NotificationProvider");
    }
    return context;
}

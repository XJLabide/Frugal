"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number; // ms, default 5000
}

interface ToastItemProps {
    toast: Toast;
    onDismiss: (id: string) => void;
}

const toastIcons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
};

const toastStyles = {
    success: "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/50",
    error: "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/50",
    warning: "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/50",
    info: "border-indigo-200 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-950/50",
};

const toastIconStyles = {
    success: "text-green-600 dark:text-green-400",
    error: "text-red-600 dark:text-red-400",
    warning: "text-amber-600 dark:text-amber-400",
    info: "text-indigo-600 dark:text-indigo-400",
};

export function ToastItem({ toast, onDismiss }: ToastItemProps) {
    const Icon = toastIcons[toast.type];
    const [isExiting, setIsExiting] = React.useState(false);

    React.useEffect(() => {
        const duration = toast.duration ?? 5000;
        const exitTimer = setTimeout(() => {
            setIsExiting(true);
        }, duration - 300); // Start exit animation 300ms before removal

        const removeTimer = setTimeout(() => {
            onDismiss(toast.id);
        }, duration);

        return () => {
            clearTimeout(exitTimer);
            clearTimeout(removeTimer);
        };
    }, [toast.id, toast.duration, onDismiss]);

    const handleDismiss = () => {
        setIsExiting(true);
        setTimeout(() => onDismiss(toast.id), 300);
    };

    return (
        <div
            className={cn(
                "pointer-events-auto w-full max-w-sm overflow-hidden rounded-xl border shadow-lg backdrop-blur-sm transition-all duration-300",
                toastStyles[toast.type],
                isExiting
                    ? "opacity-0 translate-x-4"
                    : "opacity-100 translate-x-0 animate-in slide-in-from-right-full"
            )}
        >
            <div className="flex items-start gap-3 p-4">
                <Icon className={cn("h-5 w-5 flex-shrink-0 mt-0.5", toastIconStyles[toast.type])} />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {toast.title}
                    </p>
                    {toast.message && (
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            {toast.message}
                        </p>
                    )}
                </div>
                <button
                    onClick={handleDismiss}
                    className="flex-shrink-0 rounded-lg p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 dark:hover:text-slate-300 dark:hover:bg-slate-700/50 transition-colors"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}

interface ToastContainerProps {
    toasts: Toast[];
    onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none md:bottom-8 md:right-8">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
            ))}
        </div>
    );
}

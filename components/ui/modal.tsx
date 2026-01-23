"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
    // Close on escape key
    React.useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" />

            {/* Modal - Bottom sheet on mobile, centered on desktop */}
            <div
                className={cn(
                    "relative w-full flex flex-col p-0",
                    // Mobile: bottom sheet style
                    "max-h-[85vh] rounded-t-2xl",
                    // Desktop: centered modal
                    "sm:max-w-md sm:max-h-[85vh] sm:rounded-2xl sm:m-4",
                    // Glass styling
                    "bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl",
                    "border border-slate-200/50 dark:border-slate-700/50",
                    "shadow-xl",
                    // Animation
                    "animate-in slide-in-from-bottom-4 sm:zoom-in-95 fade-in duration-200"
                )}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Drag handle for mobile */}
                <div className="flex justify-center pt-2 pb-1 sm:hidden">
                    <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 sm:p-4 border-b border-slate-200/50 dark:border-slate-700/50 shrink-0">
                    <h2 className="text-base font-semibold">{title}</h2>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="h-8 w-8 rounded-lg"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Content */}
                <div className="px-4 py-3 sm:p-4 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}

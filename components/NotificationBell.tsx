"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Bell, Check, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/hooks/useNotifications";
import { Notification, NotificationType } from "@/types";

const notificationTypeStyles: Record<NotificationType, string> = {
    budget_alert: "text-amber-500",
    bill_reminder: "text-indigo-500",
    goal_milestone: "text-green-500",
    system: "text-slate-500",
};

const notificationTypeLabels: Record<NotificationType, string> = {
    budget_alert: "Budget Alert",
    bill_reminder: "Bill Reminder",
    goal_milestone: "Goal Milestone",
    system: "System",
};

function formatRelativeTime(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
}

interface NotificationItemProps {
    notification: Notification;
    onMarkRead: (id: string) => void;
    onDelete: (id: string) => void;
    onClick?: (notification: Notification) => void;
}

function NotificationItem({ notification, onMarkRead, onDelete, onClick }: NotificationItemProps) {
    const isClickable = notification.type === "budget_alert" || notification.type === "bill_reminder";

    const handleClick = () => {
        if (isClickable && onClick) {
            onClick(notification);
        }
    };

    return (
        <div
            onClick={handleClick}
            className={cn(
                "group relative flex items-start gap-3 p-3 rounded-lg transition-colors",
                notification.read
                    ? "bg-transparent"
                    : "bg-indigo-50/50 dark:bg-indigo-950/20",
                isClickable && "cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
            )}
        >
            {!notification.read && (
                <div className="absolute left-1 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-indigo-500" />
            )}
            <div className="flex-1 min-w-0 pl-2">
                <div className="flex items-center gap-2">
                    <span
                        className={cn(
                            "text-xs font-medium",
                            notificationTypeStyles[notification.type]
                        )}
                    >
                        {notificationTypeLabels[notification.type]}
                    </span>
                    <span className="text-xs text-slate-400">
                        {formatRelativeTime(notification.createdAt)}
                    </span>
                </div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mt-0.5">
                    {notification.title}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-2">
                    {notification.message}
                </p>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {!notification.read && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onMarkRead(notification.id);
                        }}
                        className="p-1.5 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                        title="Mark as read"
                    >
                        <Check className="h-3.5 w-3.5" />
                    </button>
                )}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(notification.id);
                    }}
                    className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                    title="Delete"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </button>
            </div>
        </div>
    );
}

export function NotificationBell() {
    const router = useRouter();
    const { notifications, unreadCount, loading, markAsRead, markAllAsRead, deleteNotification } =
        useNotifications();
    const [isOpen, setIsOpen] = React.useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);
    const buttonRef = React.useRef<HTMLButtonElement>(null);

    // Handle notification click - navigate to relevant page
    const handleNotificationClick = React.useCallback(
        (notification: Notification) => {
            // Mark as read
            if (!notification.read) {
                markAsRead(notification.id);
            }

            // Close dropdown
            setIsOpen(false);

            // Navigate based on notification type
            if (notification.type === "budget_alert") {
                router.push("/budgets");
            } else if (notification.type === "bill_reminder") {
                // Bill reminders will link to dashboard (upcoming bills section)
                router.push("/");
            }
        },
        [markAsRead, router]
    );

    // Close dropdown when clicking outside
    React.useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    // Close on escape
    React.useEffect(() => {
        function handleEscape(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
        }
        return () => {
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen]);

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "relative p-2 rounded-xl transition-all duration-200",
                    "text-slate-600 hover:text-slate-900 hover:bg-slate-100/50",
                    "dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/50",
                    isOpen && "bg-slate-100/50 dark:bg-slate-800/50"
                )}
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div
                    ref={dropdownRef}
                    className="absolute right-0 top-full mt-2 w-80 sm:w-96 glass-card p-0 animate-in fade-in slide-in-from-top-2 duration-200 z-50"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-slate-200/50 dark:border-slate-700/50">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            Notifications
                        </h3>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
                                >
                                    Mark all read
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Notification List */}
                    <div className="max-h-[400px] overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" />
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <Bell className="h-10 w-10 text-slate-300 dark:text-slate-600 mb-2" />
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    No notifications yet
                                </p>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                    We&apos;ll notify you about important updates
                                </p>
                            </div>
                        ) : (
                            <div className="p-2 space-y-1">
                                {notifications.map((notification) => (
                                    <NotificationItem
                                        key={notification.id}
                                        notification={notification}
                                        onMarkRead={markAsRead}
                                        onDelete={deleteNotification}
                                        onClick={handleNotificationClick}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

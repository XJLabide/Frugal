export type TransactionType = 'income' | 'expense';

export interface UserProfile {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    currency?: string;
    darkMode?: boolean; // Persisted preference
}

export interface Category {
    id: string;
    userId: string;
    name: string;
    type: TransactionType;
    icon?: string; // Icon name from lucide-react
    color?: string; // Hex code or tailwind class
    isDefault?: boolean;
    subCategories?: string[]; // List of available subcategories
}

export interface Transaction {
    id: string;
    userId: string;
    amount: number;
    categoryId: string;
    date: string; // ISO date string YYYY-MM-DD
    note?: string;
    location?: string; // e.g., 'Bank', 'Cash', 'GCash'
    type: TransactionType;
    createdAt?: number; // Timestamp
    subCategory?: string; // Selected subcategory
    tags?: string[]; // Tag IDs associated with this transaction
}

export interface Tag {
    id: string;
    userId: string;
    name: string;
    color?: string; // Hex code for tag color
    createdAt?: number; // Timestamp
}

export interface Budget {
    id: string;
    userId: string;
    categoryId: string; // 'all' or specific category ID
    amount: number;
    month: string; // YYYY-MM format or 'recurring'
}

export interface Goal {
    id: string;
    userId: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    deadline?: string; // ISO date YYYY-MM-DD
    location?: string; // Storage location: Bank, Wallet, GCash, etc.
    icon?: string;
    color?: string;
    createdAt?: number;
}

export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RecurringTransaction {
    id: string;
    userId: string;
    name: string;
    amount: number;
    categoryId: string;
    type: TransactionType;
    frequency: RecurringFrequency;
    startDate: string; // YYYY-MM-DD
    nextDueDate: string; // YYYY-MM-DD - when the next transaction should be created
    isActive: boolean;
    note?: string;
    location?: string;
    subCategory?: string;
    tags?: string[]; // Tag IDs associated with this recurring transaction
    createdAt?: number;
}

export interface UserSettings {
    currency: string; // ISO 4217 currency code (e.g., 'PHP', 'USD')
    billReminderDays?: number[]; // Days before due date to send reminders (e.g., [1, 3, 7])
}

export type NotificationType = 'budget_alert' | 'bill_reminder' | 'goal_milestone' | 'system';

export interface Notification {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    read: boolean;
    createdAt: number; // Timestamp
    data?: Record<string, unknown>; // Additional payload (e.g., categoryId, goalId)
}

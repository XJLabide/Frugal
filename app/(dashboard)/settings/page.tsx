"use client";

import { useState, useEffect } from "react";
import { useCategories } from "@/hooks/useCategories";
import { useRecurringTransactions } from "@/hooks/useRecurringTransactions";
import { useAccounts } from "@/hooks/useAccounts";
import { RecurringTransaction, Account, AccountType } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { RecurringTransactionForm } from "@/components/forms/RecurringTransactionForm";
import { Trash2, Plus, Moon, Sun, Palette, Tags, Repeat, CalendarClock, Pencil, Coins, Bell, X, Wallet, Building2, Smartphone, CreditCard, CircleDollarSign, Star, Check } from "lucide-react";
import { cn, CURRENCIES } from "@/lib/utils";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useUserSettings } from "@/hooks/useUserSettings";
import { format, parseISO } from "date-fns";

const ACCOUNT_TYPE_OPTIONS: { value: AccountType; label: string; icon: string }[] = [
    { value: "cash", label: "Cash", icon: "Wallet" },
    { value: "bank", label: "Bank", icon: "Building2" },
    { value: "ewallet", label: "E-Wallet", icon: "Smartphone" },
    { value: "credit", label: "Credit Card", icon: "CreditCard" },
    { value: "other", label: "Other", icon: "CircleDollarSign" },
];

const ACCOUNT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
    Wallet,
    Building2,
    Smartphone,
    CreditCard,
    CircleDollarSign,
};

export default function SettingsPage() {
    const { categories, addCategory, deleteCategory, seedDefaults, hasCategories, loading } = useCategories();
    const { recurringTransactions, deleteRecurringTransaction, loading: recurringLoading } = useRecurringTransactions();
    const {
        accounts,
        loading: accountsLoading,
        hasAccounts,
        addAccount,
        updateAccount,
        deleteAccount,
        setDefaultAccount,
        seedDefaults: seedAccountDefaults,
        getAccountBalance
    } = useAccounts();
    const { currency, currencySymbol, setCurrency, loading: currencyLoading, formatCurrency } = useCurrency();
    const { settings, setBillReminderDays, loading: settingsLoading } = useUserSettings();
    const [newCatName, setNewCatName] = useState("");
    const [newCatType, setNewCatType] = useState<"income" | "expense">("expense");
    const [isDark, setIsDark] = useState(false);
    const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
    const [editingRecurring, setEditingRecurring] = useState<RecurringTransaction | null>(null);
    const [deleteRecurringId, setDeleteRecurringId] = useState<string | null>(null);
    const [newReminderDay, setNewReminderDay] = useState("");

    // Account management state
    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState<Account | null>(null);
    const [deleteAccountId, setDeleteAccountId] = useState<string | null>(null);
    const [accountForm, setAccountForm] = useState({
        name: "",
        type: "cash" as AccountType,
        startingBalance: 0,
        icon: "Wallet",
        color: "#22c55e",
    });

    // Check initial theme on mount
    useEffect(() => {
        const theme = localStorage.getItem("theme");
        if (theme === "dark" || (!theme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
            document.documentElement.classList.add("dark");
            setIsDark(true);
        }
    }, []);

    const toggleDarkMode = () => {
        if (isDark) {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
            setIsDark(false);
        } else {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
            setIsDark(true);
        }
    };

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCatName) return;
        await addCategory({
            name: newCatName,
            type: newCatType,
            color: newCatType === "income" ? "#22c55e" : "#ef4444",
            isDefault: false
        });
        setNewCatName("");
    };

    const expenseCategories = categories.filter(c => c.type === "expense");
    const incomeCategories = categories.filter(c => c.type === "income");

    const openAccountModal = (account?: Account) => {
        if (account) {
            setEditingAccount(account);
            setAccountForm({
                name: account.name,
                type: account.type,
                startingBalance: account.startingBalance,
                icon: account.icon || "Wallet",
                color: account.color || "#22c55e",
            });
        } else {
            setEditingAccount(null);
            setAccountForm({
                name: "",
                type: "cash",
                startingBalance: 0,
                icon: "Wallet",
                color: "#22c55e",
            });
        }
        setIsAccountModalOpen(true);
    };

    const handleAccountSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!accountForm.name.trim()) return;

        if (editingAccount) {
            await updateAccount(editingAccount.id, {
                name: accountForm.name,
                type: accountForm.type,
                startingBalance: accountForm.startingBalance,
                icon: accountForm.icon,
                color: accountForm.color,
            });
        } else {
            await addAccount({
                name: accountForm.name,
                type: accountForm.type,
                startingBalance: accountForm.startingBalance,
                icon: accountForm.icon,
                color: accountForm.color,
            });
        }
        setIsAccountModalOpen(false);
    };

    const getAccountIcon = (iconName?: string) => {
        const IconComponent = ACCOUNT_ICONS[iconName || "Wallet"] || Wallet;
        return IconComponent;
    };

    return (
        <div className="space-y-6 max-w-3xl">
            {/* Header */}
            <div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Settings</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm md:text-base">
                    Customize your Frugal experience
                </p>
            </div>

            {/* Appearance */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Palette className="h-5 w-5 text-indigo-500" />
                        Appearance
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="font-medium">Dark Mode</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Switch between light and dark themes
                            </p>
                        </div>
                        <button
                            onClick={toggleDarkMode}
                            className={cn(
                                "relative inline-flex h-11 w-20 items-center rounded-full transition-colors",
                                isDark ? "bg-indigo-600" : "bg-slate-200"
                            )}
                        >
                            <span
                                className={cn(
                                    "inline-flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md transition-transform",
                                    isDark ? "translate-x-10" : "translate-x-1"
                                )}
                            >
                                {isDark ? (
                                    <Moon className="h-5 w-5 text-indigo-600" />
                                ) : (
                                    <Sun className="h-5 w-5 text-amber-500" />
                                )}
                            </span>
                        </button>
                    </div>
                </CardContent>
            </Card>

            {/* Currency */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Coins className="h-5 w-5 text-indigo-500" />
                        Currency
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="font-medium">Display Currency</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Choose your preferred currency for displaying amounts
                            </p>
                        </div>
                        <select
                            className="h-11 w-40 rounded-xl border-2 px-3 py-2 text-sm font-medium transition-all focus:ring-2 focus:ring-indigo-500/20"
                            style={{
                                backgroundColor: 'var(--input-bg)',
                                borderColor: 'var(--input-border)',
                                color: 'var(--input-text)',
                            }}
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            disabled={currencyLoading}
                        >
                            {Object.entries(CURRENCIES).map(([code, { symbol, name }]) => (
                                <option key={code} value={code}>
                                    {symbol} {code} - {name}
                                </option>
                            ))}
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Accounts */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Wallet className="h-5 w-5 text-indigo-500" />
                            Accounts
                        </div>
                        <Button size="sm" onClick={() => openAccountModal()}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {!hasAccounts && !accountsLoading && (
                        <div className="rounded-xl bg-gradient-to-r from-indigo-500/10 to-teal-500/10 p-4 border border-indigo-500/20">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-500 rounded-lg">
                                    <Wallet className="h-4 w-4 text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">No accounts found</p>
                                    <p className="text-xs text-slate-500">Add default accounts to get started quickly</p>
                                </div>
                                <Button size="sm" onClick={() => seedAccountDefaults()}>
                                    Add Defaults
                                </Button>
                            </div>
                        </div>
                    )}

                    {accountsLoading ? (
                        <p className="text-sm text-slate-500">Loading accounts...</p>
                    ) : hasAccounts && (
                        <div className="space-y-3">
                            {accounts.map((account) => {
                                const IconComponent = getAccountIcon(account.icon);
                                const balance = getAccountBalance(account.id);
                                return (
                                    <div
                                        key={account.id}
                                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-700 p-4"
                                    >
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <div
                                                className="p-2 rounded-lg shrink-0 flex items-center justify-center"
                                                style={{ backgroundColor: account.color ? `${account.color}20` : '#e2e8f0', color: account.color || '#64748b' }}
                                            >
                                                <IconComponent className="h-5 w-5" />
                                            </div>
                                            <div className="flex flex-col gap-0.5 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-semibold truncate">{account.name}</span>
                                                    {account.isDefault && (
                                                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 shrink-0">
                                                            <Star className="h-3 w-3" />
                                                            Default
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                                                    {ACCOUNT_TYPE_OPTIONS.find(t => t.value === account.type)?.label || account.type}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 shrink-0">
                                            <span className={cn(
                                                "font-bold text-lg",
                                                balance >= 0 ? "text-slate-900 dark:text-white" : "text-red-600 dark:text-red-400"
                                            )}>
                                                {formatCurrency(balance)}
                                            </span>
                                            <div className="flex items-center gap-1">
                                                {!account.isDefault && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-slate-400 hover:text-indigo-600"
                                                        onClick={() => setDefaultAccount(account.id)}
                                                        title="Set as default"
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-slate-400 hover:text-indigo-600"
                                                    onClick={() => openAccountModal(account)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-slate-400 hover:text-red-600"
                                                    onClick={() => setDeleteAccountId(account.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Bill Reminder Preferences */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-indigo-500" />
                        Bill Reminders
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-1">
                        <p className="font-medium">Reminder Days</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Get notified before upcoming bills are due
                        </p>
                    </div>

                    {/* Current reminder days */}
                    <div className="flex flex-wrap gap-2">
                        {(settings.billReminderDays || [1, 3]).sort((a, b) => a - b).map((day) => (
                            <div
                                key={day}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium"
                            >
                                <span>{day} day{day !== 1 ? 's' : ''} before</span>
                                <button
                                    onClick={async () => {
                                        const newDays = (settings.billReminderDays || []).filter(d => d !== day);
                                        await setBillReminderDays(newDays);
                                    }}
                                    disabled={settingsLoading}
                                    className="p-0.5 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        ))}
                        {(settings.billReminderDays || []).length === 0 && (
                            <p className="text-sm text-slate-400 italic">No reminders set</p>
                        )}
                    </div>

                    {/* Add new reminder day */}
                    <div className="flex items-center gap-3">
                        <div className="flex-1 max-w-[200px]">
                            <Input
                                type="number"
                                min="1"
                                max="30"
                                value={newReminderDay}
                                onChange={(e) => setNewReminderDay(e.target.value)}
                                placeholder="Days before..."
                                className="h-10"
                            />
                        </div>
                        <Button
                            size="sm"
                            onClick={async () => {
                                const day = parseInt(newReminderDay, 10);
                                if (day && day >= 1 && day <= 30) {
                                    const currentDays = settings.billReminderDays || [];
                                    if (!currentDays.includes(day)) {
                                        await setBillReminderDays([...currentDays, day]);
                                    }
                                    setNewReminderDay("");
                                }
                            }}
                            disabled={settingsLoading || !newReminderDay}
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            Add
                        </Button>
                    </div>

                    <p className="text-xs text-slate-400 dark:text-slate-500">
                        Add up to 30 days before the due date. Common choices: 1, 3, 7 days.
                    </p>
                </CardContent>
            </Card>

            {/* Recurring Transactions */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Repeat className="h-5 w-5 text-indigo-500" />
                            Recurring Transactions
                        </div>
                        <Button size="sm" onClick={() => {
                            setEditingRecurring(null);
                            setIsRecurringModalOpen(true);
                        }}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {recurringLoading ? (
                            <p className="text-sm text-slate-500">Loading...</p>
                        ) : recurringTransactions.length === 0 ? (
                            <div className="text-center py-6 text-slate-500 dark:text-slate-400">
                                <CalendarClock className="h-10 w-10 mx-auto mb-2 opacity-20" />
                                <p>No recurring transactions set up.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recurringTransactions.map((rt) => (
                                    <div
                                        key={rt.id}
                                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-700 p-4"
                                    >
                                        <div className="flex flex-col gap-1 min-w-0 flex-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-semibold truncate">{rt.name}</span>
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 capitalize shrink-0">
                                                    {rt.frequency}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 flex-wrap">
                                                <span className="capitalize">{rt.categoryId}</span>
                                                <span>•</span>
                                                <span className="whitespace-nowrap">Next: {format(parseISO(rt.nextDueDate), 'MMM d, yyyy')}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 shrink-0">
                                            <span className={cn(
                                                "font-bold text-lg",
                                                rt.type === 'income' ? "text-green-600 dark:text-green-400" : "text-slate-900 dark:text-white"
                                            )}>
                                                {rt.type === 'income' ? '+' : ''}{currencySymbol}{rt.amount.toFixed(2)}
                                            </span>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-slate-400 hover:text-indigo-600"
                                                    onClick={() => {
                                                        setEditingRecurring(rt);
                                                        setIsRecurringModalOpen(true);
                                                    }}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-slate-400 hover:text-red-600"
                                                    onClick={() => setDeleteRecurringId(rt.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Categories */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Tags className="h-5 w-5 text-indigo-500" />
                        Categories
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {!hasCategories && !loading && (
                        <div className="rounded-xl bg-gradient-to-r from-indigo-500/10 to-teal-500/10 p-4 border border-indigo-500/20">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-500 rounded-lg">
                                    <Tags className="h-4 w-4 text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">No categories found</p>
                                    <p className="text-xs text-slate-500">Add default categories to get started quickly</p>
                                </div>
                                <Button size="sm" onClick={() => seedDefaults()}>
                                    Add Defaults
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Add Category Form */}
                    <form onSubmit={handleAddCategory} className="flex gap-3 items-end">
                        <div className="flex-1 space-y-2">
                            <label className="text-sm font-medium">New Category</label>
                            <Input
                                value={newCatName}
                                onChange={(e) => setNewCatName(e.target.value)}
                                placeholder="Category name..."
                            />
                        </div>
                        <div className="w-32 space-y-2">
                            <label className="text-sm font-medium">Type</label>
                            <select
                                className="flex h-11 w-full rounded-xl border-2 px-3 py-2 text-sm transition-all focus:ring-2 focus:ring-indigo-500/20"
                                style={{
                                    backgroundColor: 'var(--input-bg)',
                                    borderColor: 'var(--input-border)',
                                    color: 'var(--input-text)',
                                }}
                                value={newCatType}
                                onChange={(e) => setNewCatType(e.target.value as any)}
                            >
                                <option value="expense">Expense</option>
                                <option value="income">Income</option>
                            </select>
                        </div>
                        <Button type="submit" size="icon" className="h-11 w-11">
                            <Plus className="h-5 w-5" />
                        </Button>
                    </form>

                    {/* Category Lists */}
                    {hasCategories && (
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Expense Categories */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                                    Expense Categories
                                </h4>
                                <div className="space-y-2">
                                    {expenseCategories.map((cat) => (
                                        <div
                                            key={cat.id}
                                            className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 p-3 group hover:border-red-300 dark:hover:border-red-700 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 rounded-full bg-red-500" />
                                                <span className="font-medium">{cat.name}</span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-600"
                                                onClick={() => deleteCategory(cat.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    {expenseCategories.length === 0 && (
                                        <p className="text-sm text-slate-400 italic">No expense categories</p>
                                    )}
                                </div>
                            </div>

                            {/* Income Categories */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                                    Income Categories
                                </h4>
                                <div className="space-y-2">
                                    {incomeCategories.map((cat) => (
                                        <div
                                            key={cat.id}
                                            className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 p-3 group hover:border-green-300 dark:hover:border-green-700 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 rounded-full bg-green-500" />
                                                <span className="font-medium">{cat.name}</span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-600"
                                                onClick={() => deleteCategory(cat.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    {incomeCategories.length === 0 && (
                                        <p className="text-sm text-slate-400 italic">No income categories</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>


            <Modal
                isOpen={isRecurringModalOpen}
                onClose={() => setIsRecurringModalOpen(false)}
                title={editingRecurring ? "Edit Recurring Transaction" : "Add Recurring Transaction"}
            >
                <RecurringTransactionForm
                    onSuccess={() => setIsRecurringModalOpen(false)}
                    editingTransaction={editingRecurring}
                />
            </Modal>

            <ConfirmDialog
                isOpen={!!deleteRecurringId}
                onClose={() => setDeleteRecurringId(null)}
                onConfirm={async () => {
                    if (deleteRecurringId) {
                        await deleteRecurringTransaction(deleteRecurringId);
                        setDeleteRecurringId(null);
                    }
                }}
                title="Delete Recurring Transaction"
                message="Are you sure you want to stop this recurring transaction? Past transactions will not be deleted."
                confirmText="Stop Recurring"
            />

            {/* Account Modal */}
            <Modal
                isOpen={isAccountModalOpen}
                onClose={() => setIsAccountModalOpen(false)}
                title={editingAccount ? "Edit Account" : "Add Account"}
            >
                <form onSubmit={handleAccountSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Account Name</label>
                        <Input
                            value={accountForm.name}
                            onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                            placeholder="e.g., Main Bank Account"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Account Type</label>
                        <select
                            className="flex h-11 w-full rounded-xl border-2 px-3 py-2 text-sm transition-all focus:ring-2 focus:ring-indigo-500/20"
                            style={{
                                backgroundColor: 'var(--input-bg)',
                                borderColor: 'var(--input-border)',
                                color: 'var(--input-text)',
                            }}
                            value={accountForm.type}
                            onChange={(e) => {
                                const type = e.target.value as AccountType;
                                const typeOption = ACCOUNT_TYPE_OPTIONS.find(t => t.value === type);
                                setAccountForm({
                                    ...accountForm,
                                    type,
                                    icon: typeOption?.icon || "Wallet",
                                });
                            }}
                        >
                            {ACCOUNT_TYPE_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Starting Balance</label>
                        <Input
                            type="number"
                            step="0.01"
                            value={accountForm.startingBalance}
                            onChange={(e) => setAccountForm({ ...accountForm, startingBalance: parseFloat(e.target.value) || 0 })}
                            placeholder="0.00"
                        />
                        <p className="text-xs text-slate-500">
                            The initial balance when you start tracking this account
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Color</label>
                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                value={accountForm.color}
                                onChange={(e) => setAccountForm({ ...accountForm, color: e.target.value })}
                                className="h-11 w-14 rounded-lg border-2 cursor-pointer"
                            />
                            <span className="text-sm text-slate-500">{accountForm.color}</span>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsAccountModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit">
                            {editingAccount ? "Save Changes" : "Add Account"}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Account Confirm Dialog */}
            <ConfirmDialog
                isOpen={!!deleteAccountId}
                onClose={() => setDeleteAccountId(null)}
                onConfirm={async () => {
                    if (deleteAccountId) {
                        await deleteAccount(deleteAccountId);
                        setDeleteAccountId(null);
                    }
                }}
                title="Delete Account"
                message="Are you sure you want to delete this account? Transactions associated with this account will not be deleted but will no longer be linked to an account."
                confirmText="Delete Account"
            />
        </div>
    );
}

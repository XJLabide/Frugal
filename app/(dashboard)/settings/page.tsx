"use client";

import { useState, useEffect } from "react";
import { useCategories } from "@/hooks/useCategories";
import { useRecurringTransactions } from "@/hooks/useRecurringTransactions";
import { RecurringTransaction } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { RecurringTransactionForm } from "@/components/forms/RecurringTransactionForm";
import { Trash2, Plus, Moon, Sun, Palette, Tags, Repeat, CalendarClock, Pencil, Coins } from "lucide-react";
import { cn, CURRENCIES } from "@/lib/utils";
import { useCurrency } from "@/contexts/CurrencyContext";
import { format, parseISO } from "date-fns";

export default function SettingsPage() {
    const { categories, addCategory, deleteCategory, seedDefaults, hasCategories, loading } = useCategories();
    const { recurringTransactions, deleteRecurringTransaction, loading: recurringLoading } = useRecurringTransactions();
    const { currency, currencySymbol, setCurrency, loading: currencyLoading } = useCurrency();
    const [newCatName, setNewCatName] = useState("");
    const [newCatType, setNewCatType] = useState<"income" | "expense">("expense");
    const [isDark, setIsDark] = useState(false);
    const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
    const [editingRecurring, setEditingRecurring] = useState<RecurringTransaction | null>(null);
    const [deleteRecurringId, setDeleteRecurringId] = useState<string | null>(null);

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
        </div>
    );
}

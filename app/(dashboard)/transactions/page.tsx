"use client";

import { useState, useMemo } from "react";
import { useTransactions } from "@/hooks/useTransactions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, ArrowUpRight, ArrowDownLeft, Search, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Wallet, Pencil } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { TransactionForm } from "@/components/forms/TransactionForm";
import { Input } from "@/components/ui/input";
import { cn, CURRENCY_SYMBOL } from "@/lib/utils";
import { format, parseISO, addMonths, subMonths } from "date-fns";
import { Transaction } from "@/types";

export default function TransactionsPage() {
    const { transactions, loading, deleteTransaction } = useTransactions();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedMonth, setSelectedMonth] = useState(new Date());

    const handleDelete = async () => {
        if (deleteId) {
            await deleteTransaction(deleteId);
            setDeleteId(null);
        }
    };

    // Format for filtering
    const monthKey = format(selectedMonth, "yyyy-MM");

    // Filter transactions by month first, then by search
    const monthTransactions = useMemo(() => {
        return transactions.filter(t => t.date.startsWith(monthKey));
    }, [transactions, monthKey]);

    const filteredTransactions = useMemo(() => {
        return monthTransactions.filter(t =>
            t.categoryId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.note?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.location?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [monthTransactions, searchQuery]);

    // Calculate monthly summary
    const summary = useMemo(() => {
        const income = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expenses = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const net = income - expenses;
        return { income, expenses, net };
    }, [monthTransactions]);

    // Group by date
    const groupedTransactions = filteredTransactions.reduce((acc, transaction) => {
        const date = transaction.date;
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(transaction);
        return acc;
    }, {} as Record<string, typeof transactions>);

    const sortedDates = Object.keys(groupedTransactions).sort((a, b) =>
        new Date(b).getTime() - new Date(a).getTime()
    );

    const goToPrevMonth = () => setSelectedMonth(prev => subMonths(prev, 1));
    const goToNextMonth = () => setSelectedMonth(prev => addMonths(prev, 1));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Transactions</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        View and manage all your transactions
                    </p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="group">
                    <Plus className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90" />
                    Add Transaction
                </Button>
            </div>

            {/* Month Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={goToPrevMonth}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="px-4 py-2 min-w-[180px] text-center font-semibold text-lg">
                        {format(selectedMonth, "MMMM yyyy")}
                    </div>
                    <Button variant="outline" size="icon" onClick={goToNextMonth}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Monthly Summary */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-200 dark:border-green-800">
                    <CardContent className="flex items-center justify-between p-4">
                        <div>
                            <p className="text-sm text-green-600 dark:text-green-400 font-medium">Income</p>
                            <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                                {CURRENCY_SYMBOL}{summary.income.toFixed(2)}
                            </p>
                        </div>
                        <div className="p-3 rounded-xl bg-green-500/20">
                            <TrendingUp className="h-6 w-6 text-green-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-red-500/10 to-rose-500/10 border-red-200 dark:border-red-800">
                    <CardContent className="flex items-center justify-between p-4">
                        <div>
                            <p className="text-sm text-red-600 dark:text-red-400 font-medium">Expenses</p>
                            <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                                {CURRENCY_SYMBOL}{summary.expenses.toFixed(2)}
                            </p>
                        </div>
                        <div className="p-3 rounded-xl bg-red-500/20">
                            <TrendingDown className="h-6 w-6 text-red-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card className={cn(
                    "bg-gradient-to-br border",
                    summary.net >= 0
                        ? "from-indigo-500/10 to-purple-500/10 border-indigo-200 dark:border-indigo-800"
                        : "from-amber-500/10 to-orange-500/10 border-amber-200 dark:border-amber-800"
                )}>
                    <CardContent className="flex items-center justify-between p-4">
                        <div>
                            <p className={cn(
                                "text-sm font-medium",
                                summary.net >= 0 ? "text-indigo-600 dark:text-indigo-400" : "text-amber-600 dark:text-amber-400"
                            )}>
                                Net {summary.net >= 0 ? "Savings" : "Loss"}
                            </p>
                            <p className={cn(
                                "text-2xl font-bold",
                                summary.net >= 0 ? "text-indigo-700 dark:text-indigo-300" : "text-amber-700 dark:text-amber-300"
                            )}>
                                {summary.net >= 0 ? "+" : "-"}{CURRENCY_SYMBOL}{Math.abs(summary.net).toFixed(2)}
                            </p>
                        </div>
                        <div className={cn(
                            "p-3 rounded-xl",
                            summary.net >= 0 ? "bg-indigo-500/20" : "bg-amber-500/20"
                        )}>
                            <Wallet className={cn("h-6 w-6", summary.net >= 0 ? "text-indigo-600" : "text-amber-600")} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                    placeholder="Search transactions..."
                    className="pl-11"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Transactions List */}
            <div className="space-y-6">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
                    </div>
                ) : sortedDates.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                            <ArrowDownLeft className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">No transactions found</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-4">
                            {searchQuery
                                ? "Try a different search term"
                                : `No transactions in ${format(selectedMonth, "MMMM yyyy")}`
                            }
                        </p>
                        {!searchQuery && (
                            <Button onClick={() => setIsModalOpen(true)}>
                                <Plus className="mr-2 h-4 w-4" /> Add Transaction
                            </Button>
                        )}
                    </div>
                ) : (
                    sortedDates.map((date) => (
                        <div key={date} className="space-y-3">
                            <div className="flex items-center gap-4">
                                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                    {format(parseISO(date), "EEEE, MMMM d, yyyy")}
                                </h3>
                                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                            </div>
                            <div className="space-y-2">
                                {groupedTransactions[date].map((transaction) => (
                                    <Card key={transaction.id} className="group transition-all hover:shadow-lg">
                                        <CardContent className="flex items-center justify-between p-4">
                                            <div className="flex items-center space-x-4">
                                                <div
                                                    className={cn(
                                                        "flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110",
                                                        transaction.type === "income"
                                                            ? "bg-gradient-to-br from-green-500/20 to-emerald-500/20"
                                                            : "bg-gradient-to-br from-red-500/20 to-rose-500/20"
                                                    )}
                                                >
                                                    {transaction.type === "income" ? (
                                                        <ArrowUpRight className="h-6 w-6 text-green-600" />
                                                    ) : (
                                                        <ArrowDownLeft className="h-6 w-6 text-red-600" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-semibold">
                                                        {transaction.categoryId}
                                                    </p>
                                                    <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 space-x-2">
                                                        <span>{transaction.location || "—"}</span>
                                                        {transaction.note && (
                                                            <>
                                                                <span className="text-slate-300 dark:text-slate-600">•</span>
                                                                <span className="truncate max-w-[150px]">{transaction.note}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <span
                                                    className={cn(
                                                        "text-lg font-bold",
                                                        transaction.type === "income"
                                                            ? "text-green-600 dark:text-green-500"
                                                            : "text-red-600 dark:text-red-500"
                                                    )}
                                                >
                                                    {transaction.type === "income" ? "+" : "-"}{CURRENCY_SYMBOL}{transaction.amount.toFixed(2)}
                                                </span>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-9 w-9 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/20"
                                                        onClick={() => setEditingTransaction(transaction)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-9 w-9 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                                                        onClick={() => setDeleteId(transaction.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add Transaction"
            >
                <TransactionForm onSuccess={() => setIsModalOpen(false)} />
            </Modal>

            {/* Edit Transaction Modal */}
            <Modal
                isOpen={!!editingTransaction}
                onClose={() => setEditingTransaction(null)}
                title="Edit Transaction"
            >
                {editingTransaction && (
                    <TransactionForm
                        editingTransaction={editingTransaction}
                        onSuccess={() => setEditingTransaction(null)}
                    />
                )}
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Delete Transaction"
                message="Are you sure you want to delete this transaction? This action cannot be undone."
                confirmText="Delete"
            />
        </div>
    );
}

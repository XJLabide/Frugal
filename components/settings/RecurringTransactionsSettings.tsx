"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { RecurringTransactionForm } from "@/components/forms/RecurringTransactionForm";
import { useRecurringTransactions } from "@/hooks/useRecurringTransactions";
import { useCurrency } from "@/contexts/CurrencyContext";
import { RecurringTransaction } from "@/types";
import { Repeat, CalendarClock, Plus, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";

export function RecurringTransactionsSettings() {
    const { recurringTransactions, deleteRecurringTransaction, loading } = useRecurringTransactions();
    const { currencySymbol } = useCurrency();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRecurring, setEditingRecurring] = useState<RecurringTransaction | null>(null);
    const [deleteRecurringId, setDeleteRecurringId] = useState<string | null>(null);

    const openModal = (transaction?: RecurringTransaction) => {
        setEditingRecurring(transaction || null);
        setIsModalOpen(true);
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Repeat className="h-5 w-5 text-indigo-500" />
                            Recurring Transactions
                        </div>
                        <Button size="sm" onClick={() => openModal()}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {loading ? (
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
                                                    onClick={() => openModal(rt)}
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

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingRecurring ? "Edit Recurring Transaction" : "Add Recurring Transaction"}
            >
                <RecurringTransactionForm
                    onSuccess={() => setIsModalOpen(false)}
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
        </>
    );
}
